import { Form } from "@/domains/auth/components/form"
import { Scissors } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 sm:px-6 relative overflow-hidden" dir="rtl">
      {/* Premium Header Background Pattern */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent -z-10" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10" />

      {/* Main Content */}
      <div className="w-full max-w-sm mt-[12vh] sm:mt-[15vh]">
        
        {/* Logo & Welcome */}
        <div className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 rounded-[1.5rem] bg-primary text-primary-foreground shadow-xl shadow-primary/20 flex items-center justify-center mb-6 ring-8 ring-primary/10 transition-transform hover:scale-105">
            <Scissors className="w-10 h-10" />
          </div>
          {/* <p className="text-sm font-medium text-slate-500">سجل دخولك لإدارة  بكل سهولة</p> */}
          <h1 className="text-3xl font-bold text-slate-900 mb-2">مرحباً بك في لوحة التحكم</h1>
          <p className="text-sm font-medium text-slate-500">سجل دخولك لإدارة صالونك ومواعيدك بكل سهولة</p>
        </div>

        {/* Card for Form */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100/50 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
          <Form />
        </div>
        
        {/* Footer Text */}
        <div className="mt-8 text-center animate-in fade-in duration-700 delay-300 fill-mode-both">
          <p className="text-xs font-medium text-slate-400">
            © {new Date().getFullYear()} نظام إدارة الصالونات والمواعيد
          </p>
        </div>

      </div>
    </div>
  )
}