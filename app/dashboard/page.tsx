import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { RoleGuard } from '@/components/RoleGuard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const role = user.user_metadata.role || 'MEMBER'

  // Fetch projects & tasks depending on role. Supabase RLS handles visibility automatically.
  const { data: projects } = await supabase.from('projects').select('*')
  const { data: tasks } = await supabase.from('tasks').select('*')

  return (
    <div className="flex-1 w-full flex flex-col gap-8 items-center max-w-5xl mx-auto p-8">
      <nav className="w-full flex justify-between items-center border-b pb-4">
        <h1 className="text-xl font-bold">Team Task Manager</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Hey, {user.user_metadata.name || user.email}! ({role})</span>
          <form action={logout}>
            <button className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 transition-colors">
              Logout
            </button>
          </form>
        </div>
      </nav>

      <main className="w-full flex flex-col gap-8">
        
        {/* Only ADMINs can see these controls */}
        <RoleGuard userRole={role} allowedRoles={['ADMIN']}>
          <section className="p-6 border rounded-lg shadow-sm bg-blue-50">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">Admin Controls</h2>
            <div className="flex gap-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700">Create Project</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700">Add Member</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700">Create Task</button>
            </div>
            <p className="text-sm text-blue-700 mt-4">These buttons would hook into our Server Actions (createProject, etc.)</p>
          </section>
        </RoleGuard>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Projects</h2>
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(p => (
                <div key={p.id} className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <p className="text-gray-600 text-sm mt-2">{p.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic p-4 bg-gray-50 rounded">No projects found. You may not have access or none exist.</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
          {tasks && tasks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {tasks.map(t => (
                <div key={t.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-semibold">{t.title}</h3>
                    <p className="text-gray-600 text-sm">{t.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs rounded font-bold ${
                      t.status === 'DONE' ? 'bg-green-100 text-green-800' : 
                      t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {t.status}
                    </span>
                    <button className="text-sm border px-3 py-1 rounded hover:bg-gray-100 transition-colors">
                      Update Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic p-4 bg-gray-50 rounded">No tasks assigned to your projects.</p>
          )}
        </section>
      </main>
    </div>
  )
}
