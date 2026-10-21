"use client";

import {QueryClient , QueryClientProvider} from "@tanstack/react-query"; 
import { useState } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "sonner";
import { useKeyboardAvoidance } from "@/shared/hooks/use-keyboard-avoidance";

// Loaded lazily so the devtools chunk is never fetched in production.
const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtools),
  { ssr: false },
);

export default function Providers({children} : {children : React.ReactNode}){

    // Keeps focused inputs visible above the mobile keyboard in all sheets.
    useKeyboardAvoidance();

    const [queryClient] = useState(()=> new QueryClient({
        defaultOptions : {
            queries : {
                 staleTime : 1000 * 60 ,
                 gcTime : 1000*60*10 ,
                 refetchOnWindowFocus : false ,
                 retry : 1 
            }
        }
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-center" richColors closeButton dir="rtl" />
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    )
}