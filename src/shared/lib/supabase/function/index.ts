import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TIME_PERIODS: Record<string, { from: string; to: string; label: string }> = {
  morning:   { from: "06:00", to: "12:00", label: "الصبح" },
  afternoon: { from: "12:00", to: "15:00", label: "الظهر" },
  evening:   { from: "15:00", to: "18:00", label: "العصر" },
  night:     { from: "18:00", to: "24:00", label: "المسا" },
};

interface BookingRecord {
  start_time: string | null;
  end_time: string | null;
  status: string;
}

interface FreeGap {
  start: string;
  end: string;
  type: "internal" | "trailing";
}

function timeToMinutes(time: string): number {
  const parts = time.split(":").map(Number);
  return parts[0] * 60 + (parts[1] || 0);
}

function hasBookingTimes(booking: BookingRecord): booking is BookingRecord & { start_time: string; end_time: string } {
  return Boolean(booking.start_time && booking.end_time);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function ceilToStep(minutes: number, step: number): number {
  return Math.ceil(minutes / step) * step;
}

function getNowMinutesInTimezone(timezone: string): number {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return timeToMinutes(timeStr);
}

function isTodayInTimezone(dateStr: string, timezone: string): boolean {
  const now = new Date();
  const localDate = now.toLocaleDateString("en-CA", { timeZone: timezone });
  return dateStr === localDate;
}

function calculateFreeGaps(
  shiftStart: string,
  shiftEnd: string,
  existingBookings: BookingRecord[]
): FreeGap[] {
  const shiftStartMin = timeToMinutes(shiftStart);
  const shiftEndMin   = timeToMinutes(shiftEnd);

  const sortedBookings = existingBookings
    .filter((b) => b.status !== "cancelled" && hasBookingTimes(b))
    .map((b) => ({ start: timeToMinutes(b.start_time), end: timeToMinutes(b.end_time) }))
    .sort((a, b) => a.start - b.start);

  const freeGaps: FreeGap[] = [];
  let pointer    = shiftStartMin;
  let hadBooking = false;

  for (const booking of sortedBookings) {
    if (pointer < booking.start) {
      freeGaps.push({
        start: minutesToTime(pointer),
        end:   minutesToTime(booking.start),
        type:  hadBooking ? "internal" : "trailing",
      });
    }
    if (pointer < booking.end) pointer = booking.end;
    hadBooking = true;
  }

  if (pointer < shiftEndMin) {
    freeGaps.push({
      start: minutesToTime(pointer),
      end:   minutesToTime(shiftEndMin),
      type:  "trailing",
    });
  }

  return freeGaps;
}

function validateSlots(
  slots: any[],
  shiftStart: string,
  shiftEnd: string,
  serviceDuration: number,
  existingBookings: BookingRecord[],
  freeGaps: FreeGap[]
): any[] {
  const shiftStartMin = timeToMinutes(shiftStart);
  const shiftEndMin   = timeToMinutes(shiftEnd);

  const bookingsMin = existingBookings
    .filter((b) => b.status !== "cancelled" && hasBookingTimes(b))
    .map((b) => ({ start: timeToMinutes(b.start_time), end: timeToMinutes(b.end_time) }));

  const gapsMin = freeGaps.map((g) => ({
    start: timeToMinutes(g.start),
    end:   timeToMinutes(g.end),
  }));

  return slots.filter((slot: any) => {
    const actualStart  = timeToMinutes(slot.actual_start_time);
    const actualEnd    = timeToMinutes(slot.actual_end_time);
    const displayStart = timeToMinutes(slot.display_start_time);

    if (actualEnd !== actualStart + serviceDuration) return false;
    if (actualStart < shiftStartMin || actualEnd > shiftEndMin) return false;
    const hasConflict = bookingsMin.some((b) => actualStart < b.end && actualEnd > b.start);
    if (hasConflict) return false;

    if (slot.gap_type === "current_queue") return true;

    const expectedDisplay = Math.max(actualStart - ARRIVAL_BUFFER, shiftStartMin);
    if (displayStart !== expectedDisplay) return false;
    const inGap = gapsMin.some((g) => actualStart >= g.start && actualEnd <= g.end);
    if (!inGap) return false;
    return true;
  });
}

function generateStartNowQueue(
  nowMin: number,
  serviceDuration: number,
  shiftStart: string,
  shiftEnd: string,
  bookings: BookingRecord[],
  prefFrom: string,
  prefTo: string
): any | null {
  const shiftStartMin = timeToMinutes(shiftStart);
  const shiftEndMin   = timeToMinutes(shiftEnd);
  const roundedNow    = ceilToStep(nowMin, 5);
  const anchorStart   = roundedNow + ARRIVAL_BUFFER;

  if (anchorStart < shiftStartMin) return null;
  if (anchorStart + serviceDuration > shiftEndMin) return null;

  const nextBooking = bookings
    .filter((b) => b.status !== "cancelled" && hasBookingTimes(b))
    .map((b) => ({ start: timeToMinutes(b.start_time), end: timeToMinutes(b.end_time) }))
    .filter((b) => b.end > nowMin)
    .sort((a, b) => a.start - b.start)[0] ?? null;

  const canStart = !nextBooking || nextBooking.start - anchorStart >= serviceDuration;
  if (!canStart) return null;

  const prefFromMin = timeToMinutes(prefFrom);
  const prefToMin   = timeToMinutes(prefTo);
  const inPref      = anchorStart >= prefFromMin && anchorStart < prefToMin + serviceDuration;

  return {
    display_start_time: minutesToTime(roundedNow),
    actual_start_time:  minutesToTime(anchorStart),
    actual_end_time:    minutesToTime(anchorStart + serviceDuration),
    gap_type:           "current_queue",
    in_preference:      inPref,
    is_first_available: true,
    is_alternative:     !inPref,
    score:              95,
    reason:             "Available now with 10 minute arrival buffer",
  };
}

const ARRIVAL_BUFFER = 10;
const SHOP_TIMEZONE  = "Africa/Cairo";

function generateSmartSlots(
  freeGaps: FreeGap[],
  serviceDuration: number,
  shiftStart: string,
  prefFrom: string,
  prefTo: string,
  nowMin: number | null = null
): any[] {
  const shiftStartMin = timeToMinutes(shiftStart);
  const prefFromMin   = timeToMinutes(prefFrom);
  const prefToMin     = timeToMinutes(prefTo);
  const prefMid       = (prefFromMin + prefToMin) / 2;

  const allSuggestions: {
    display_start_time: string;
    actual_start_time:  string;
    actual_end_time:    string;
    distance:           number;
    inPref:             boolean;
    gapType:            string;
  }[] = [];

  for (const gap of freeGaps) {
    const gapStart = timeToMinutes(gap.start);
    const gapEnd   = timeToMinutes(gap.end);
    let actualStart = gapStart;

    while (actualStart + serviceDuration <= gapEnd) {
      if (nowMin !== null && actualStart <= nowMin) {
        actualStart += serviceDuration;
        continue;
      }

      const displayStartMin = Math.max(actualStart - ARRIVAL_BUFFER, shiftStartMin);
      const inPref   = actualStart >= prefFromMin && actualStart < prefToMin + serviceDuration;
      const distance = Math.abs(actualStart - prefMid);

      allSuggestions.push({
        display_start_time: minutesToTime(displayStartMin),
        actual_start_time:  minutesToTime(actualStart),
        actual_end_time:    minutesToTime(actualStart + serviceDuration),
        distance,
        inPref,
        gapType: gap.type,
      });

      actualStart += serviceDuration;
    }
  }

  const sorted = allSuggestions.sort((a, b) => {
    if (a.gapType === "internal" && b.gapType === "trailing") return -1;
    if (a.gapType === "trailing" && b.gapType === "internal") return 1;
    if (a.inPref && !b.inPref) return -1;
    if (!a.inPref && b.inPref) return 1;
    return a.distance - b.distance;
  });

  return sorted.map((s, i) => ({
    display_start_time: s.display_start_time,
    actual_start_time:  s.actual_start_time,
    actual_end_time:    s.actual_end_time,
    gap_type:           s.gapType,
    in_preference:      s.inPref,
    score:              Math.max(50, 100 - i * 10),
    reason: i === 0
      ? "أقرب موعد متاح لتفضيلك"
      : s.gapType === "internal"
      ? "يملأ فراغاً داخلياً بين الحجوزات"
      : "موعد متاح",
  }));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const body = await req.json();
    const { shop_id, staff_id, target_date, time_preference, service_id, service_duration: rawDuration } = body;

    if (!shop_id || !target_date) {
      return new Response(
        JSON.stringify({ success: false, error: "shop_id and target_date are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let serviceDuration = rawDuration || 30;
    let serviceName = "حلاقة";
    if (service_id) {
      const { data: service } = await supabase
        .from("services").select("name, duration_minutes").eq("id", service_id).single();
      if (service) { serviceDuration = service.duration_minutes; serviceName = service.name; }
    }

    const pref = time_preference || {};
    let prefFrom  = "06:00";
    let prefTo    = "23:00";
    let prefLabel = "أي وقت";

    if (pref.period && TIME_PERIODS[pref.period]) {
      prefFrom  = TIME_PERIODS[pref.period].from;
      prefTo    = TIME_PERIODS[pref.period].to;
      prefLabel = TIME_PERIODS[pref.period].label;
      if (pref.from) prefFrom = pref.from;
      if (pref.to)   prefTo   = pref.to;
    } else if (pref.from && pref.to) {
      prefFrom  = pref.from;
      prefTo    = pref.to;
      prefLabel = `من ${pref.from} إلى ${pref.to}`;
    }

    const dayOfWeek = new Date(target_date + "T00:00:00").getDay();

    let staffQuery = supabase
      .from("shop_staff").select("id, user_id, role")
      .eq("shop_id", shop_id).eq("is_active", true).eq("role", "barber");
    if (staff_id) staffQuery = staffQuery.eq("id", staff_id);

    const { data: staffList, error: staffError } = await staffQuery;
    if (staffError || !staffList?.length) {
      return new Response(
        JSON.stringify({ success: false, message: "لا يوجد حلاقين متاحين", staff_results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const staffResults = [];

    for (const staff of staffList) {
      const { data: profile } = await supabase
        .from("profiles").select("name").eq("id", staff.user_id).single();
      const staffName = profile?.name || "حلاق";

      let workHours: { start_time: string; end_time: string; is_off: boolean } | null = null;
      const { data: staffHours } = await supabase
        .from("working_hours").select("start_time, end_time, is_off")
        .eq("shop_id", shop_id).eq("staff_id", staff.id).eq("day_of_week", dayOfWeek).maybeSingle();
      if (staffHours) {
        workHours = staffHours;
      } else {
        const { data: shopHours } = await supabase
          .from("working_hours").select("start_time, end_time, is_off")
          .eq("shop_id", shop_id).is("staff_id", null).eq("day_of_week", dayOfWeek).maybeSingle();
        workHours = shopHours;
      }

      if (!workHours || workHours.is_off) {
        staffResults.push({ staff_id: staff.id, staff_name: staffName, is_available: false, message: "يوم إجازة", recommended_slots: [] });
        continue;
      }

      const { data: existingBookings } = await supabase
        .from("bookings_v2").select("start_time, end_time, status")
        .eq("staff_id", staff.id).eq("booking_date", target_date)
        .neq("status", "cancelled");

      const freeGaps = calculateFreeGaps(workHours.start_time, workHours.end_time, existingBookings || []);

      if (freeGaps.length === 0) {
        staffResults.push({ staff_id: staff.id, staff_name: staffName, is_available: false, message: "لا توجد فراغات متاحة", recommended_slots: [] });
        continue;
      }

      const isToday = isTodayInTimezone(target_date, SHOP_TIMEZONE);
      const nowMin: number | null = isToday ? getNowMinutesInTimezone(SHOP_TIMEZONE) : null;

      let slots: any[] = [];

      if (nowMin !== null) {
        const startNowSlot = generateStartNowQueue(
          nowMin,
          serviceDuration,
          workHours.start_time,
          workHours.end_time,
          existingBookings || [],
          prefFrom,
          prefTo
        );
        if (startNowSlot) slots.push(startNowSlot);
      }

      slots.push(...generateSmartSlots(freeGaps, serviceDuration, workHours.start_time, prefFrom, prefTo, nowMin));

      const seen = new Set<string>();
      slots = slots.filter((s: any) => {
        if (seen.has(s.actual_start_time)) return false;
        seen.add(s.actual_start_time);
        return true;
      });

      slots = validateSlots(slots, workHours.start_time, workHours.end_time, serviceDuration, existingBookings || [], freeGaps);

      if (nowMin !== null) {
        slots = slots.filter((s: any) => timeToMinutes(s.actual_start_time) > nowMin);
      }

      const prefFromMin = timeToMinutes(prefFrom);
      const prefToMin   = timeToMinutes(prefTo);
      slots = slots.filter((s: any) => {
        if (s.gap_type === "current_queue") return true;
        const actualStart = timeToMinutes(s.actual_start_time);
        return actualStart >= prefFromMin && actualStart < prefToMin + serviceDuration;
      });

      const currentQueue = slots.filter((s: any) => s.gap_type === "current_queue");
      const otherSlots   = slots.filter((s: any) => s.gap_type !== "current_queue");
      slots = [...currentQueue, ...otherSlots];

      staffResults.push({
        staff_id:            staff.id,
        staff_name:          staffName,
        is_available:        slots.length > 0,
        total_bookings:      existingBookings?.length || 0,
        recommended_slots:   slots,
        message:             slots.length > 0 ? "المواعيد المتاحة لهذا اليوم" : "لا توجد مواعيد متاحة في هذا اليوم",
        has_alternatives:    false,
        alternative_message: null,
      });
    }

    return new Response(
      JSON.stringify({
        success:         true,
        date:            target_date,
        day_of_week:     dayOfWeek,
        time_preference: { label: prefLabel, from: prefFrom, to: prefTo },
        service:         { id: service_id || null, name: serviceName, duration: serviceDuration },
        staff_results:   staffResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("smart-booking-slots error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
