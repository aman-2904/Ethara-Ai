import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If the user is already logged in, skip the landing page and take them straight to work!
  if (user) {
    return redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col font-sans">
      {/* Navigation Bar */}
      <nav className="p-6 flex justify-between items-center max-w-6xl w-full mx-auto z-10">
        <div className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          Ethara
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium text-sm sm:text-base text-slate-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium text-sm sm:text-base bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center max-w-6xl mx-auto relative z-10 py-20">
        
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-300 mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
          Now in public beta
        </div>
        
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1] max-w-4xl">
          Manage your team's work <br className="hidden lg:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            beautifully.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl lg:text-2xl text-slate-400 max-w-3xl mb-12 leading-relaxed">
          Ethara is the modern project management platform designed for high-performing teams. Track tasks, assign members, and hit deadlines securely without the clutter.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/signup" className="px-8 py-4 rounded-full font-bold text-lg bg-white text-slate-900 hover:bg-slate-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95">
            Get started for free
          </Link>
          <a href="#features" className="px-8 py-4 rounded-full font-bold text-lg bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md">
            View features
          </a>
        </div>

        {/* Feature Highlights */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left w-full">
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-3xl mb-6 group-hover:scale-110 transition-transform">
              🎯
            </div>
            <h3 className="text-2xl font-bold mb-3">Project Workspaces</h3>
            <p className="text-slate-400 leading-relaxed text-lg">Create isolated environments for every project. Keep your team focused and organized efficiently.</p>
          </div>
          
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-3xl mb-6 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-2xl font-bold mb-3">Real-time Tasks</h3>
            <p className="text-slate-400 leading-relaxed text-lg">Assign tasks, update statuses instantly, and track due dates. Urgent tasks are automatically flagged.</p>
          </div>
          
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 text-3xl mb-6 group-hover:scale-110 transition-transform">
              🛡️
            </div>
            <h3 className="text-2xl font-bold mb-3">Role-Based Security</h3>
            <p className="text-slate-400 leading-relaxed text-lg">Strict Admin vs Member permissions enforced seamlessly at the database layer by Supabase.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-500 text-sm mt-20 border-t border-white/10 z-10">
        <p>© 2026 Ethara Team Task Manager. Built with Next.js & Supabase.</p>
      </footer>
    </div>
  )
}
