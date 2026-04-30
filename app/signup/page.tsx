import { signup } from '@/app/auth/actions'
import Link from 'next/link'

export default async function SignupPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  const message = searchParams.message

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 min-h-screen mx-auto">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-gray-200 flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{' '}
        Back
      </Link>

      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground" action={signup}>
        <h1 className="text-2xl font-semibold text-center mb-6">Create an Account</h1>
        
        <label className="text-md" htmlFor="name">
          Full Name
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="name"
          placeholder="John Doe"
          required
        />

        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
        />

        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 mb-2 transition-colors">
          Sign Up
        </button>
        
        <div className="text-center text-sm mt-4">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
        </div>
        
        {message && (
          <p className="mt-4 p-4 bg-red-100 text-red-600 text-center rounded-md border border-red-300">
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
