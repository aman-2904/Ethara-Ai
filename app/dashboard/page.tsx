import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { RoleGuard } from '@/components/RoleGuard'
import { CreateProjectModal } from '@/components/CreateProjectModal'
import { ProjectCard } from '@/components/ProjectCard'
import { TaskCard } from '@/components/TaskCard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const role = user.user_metadata.role || 'MEMBER'
  const isAdmin = role === 'ADMIN'

  // Fetch projects depending on role.
  const { data: projects } = await supabase.from('projects').select('*')
  
  // Fetch ALL tasks to calculate global dashboard statistics
  const { data: allTasks } = await supabase.from('tasks').select('*')
  
  // Dashboard Statistics
  const totalTasks = allTasks?.length || 0;
  const completedTasks = allTasks?.filter(t => t.status === 'DONE').length || 0;
  const pendingTasks = allTasks?.filter(t => t.status !== 'DONE').length || 0;
  
  let overdueTasks = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  allTasks?.forEach(t => {
    if (t.due_date && t.status !== 'DONE') {
      const dueDate = new Date(t.due_date);
      if (dueDate < today) {
        overdueTasks++;
      }
    }
  });

  // For the dashboard task list, only show "My Urgent/Pending Tasks"
  const myPendingTasks = allTasks?.filter(t => t.assigned_to === user.id && t.status !== 'DONE')
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }) || [];
  
  // Fetch users for the Add Member dropdowns in ProjectCard
  const { data: users } = await supabase.from('users').select('id, name, email')

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
          <section className="p-6 border rounded-lg shadow-sm bg-blue-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-blue-900">Admin Workspace</h2>
              <p className="text-sm text-blue-700">Manage your organization's projects here.</p>
            </div>
            <div className="flex gap-2">
              <CreateProjectModal />
            </div>
          </section>
        </RoleGuard>

        {/* Dashboard Statistics Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
            <p className="text-3xl font-bold mt-2 text-gray-800">{totalTasks}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 font-medium">Completed</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{completedTasks}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 font-medium">Pending</p>
            <p className="text-3xl font-bold mt-2 text-yellow-600">{pendingTasks}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 font-medium">Overdue</p>
            <p className="text-3xl font-bold mt-2 text-red-600">{overdueTasks}</p>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-2xl font-semibold">Your Projects</h2>
          </div>
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(p => (
                <ProjectCard key={p.id} project={p} users={users || []} isAdmin={isAdmin} />
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed rounded-xl text-center bg-gray-50">
              <p className="text-gray-500 italic">No projects found. You may not have access or none exist.</p>
            </div>
          )}
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-2xl font-semibold">My Urgent Tasks</h2>
          </div>
          {myPendingTasks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {myPendingTasks.map(t => (
                <TaskCard 
                  key={t.id} 
                  task={t} 
                  users={users || []} 
                  isAssigned={true} 
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed rounded-xl text-center bg-gray-50">
              <p className="text-gray-500 italic">You have no pending tasks assigned to you. Great job!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
