import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RoleGuard } from '@/components/RoleGuard'
import { CreateTaskModal } from '@/components/CreateTaskModal'
import { TaskCard } from '@/components/TaskCard'
import Link from 'next/link'

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const role = user.user_metadata.role || 'MEMBER'
  const isAdmin = role === 'ADMIN'

  // Fetch project details
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <p className="mt-4 text-gray-600">You either do not have access to this project, or it was deleted.</p>
        <Link href="/dashboard" className="text-blue-600 mt-4 inline-block hover:underline">← Back to Dashboard</Link>
      </div>
    )
  }

  // Fetch tasks for this project
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', params.id)
    .order('due_date', { ascending: true, nullsFirst: false })

  // Fetch members of this project to assign tasks to
  const { data: projectMembers } = await supabase
    .from('project_members')
    .select('user_id')
    .eq('project_id', params.id)

  const memberIds = projectMembers?.map(pm => pm.user_id) || []

  // Fetch users info for those members (if any exist)
  let projectUsers: any[] = []
  if (memberIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', memberIds)
    projectUsers = users || []
  }

  // Add the Admin themselves to the assignable users list so they can assign tasks to themselves if they want
  if (isAdmin && !projectUsers.find(u => u.id === user.id)) {
      projectUsers.push({ id: user.id, name: user.user_metadata.name, email: user.email })
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-5xl mx-auto p-8">
      <nav className="w-full flex items-center gap-4 border-b pb-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors font-medium">
          ← Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
      </nav>

      <div className="bg-white p-6 rounded-lg border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-3">{project.name}</h2>
          <p className="text-gray-600 max-w-2xl">{project.description}</p>
          
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <div className="flex items-center -space-x-3">
              {projectUsers.length > 0 ? projectUsers.map((u, i) => (
                <div 
                  key={u.id} 
                  className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-sm font-bold text-blue-800 shadow-sm"
                  title={u.name || u.email}
                >
                  {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                </div>
              )) : (
                <span className="text-sm text-gray-500 italic bg-gray-50 px-3 py-1 rounded">No members assigned yet.</span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{projectUsers.length} Team Member(s)</span>
          </div>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-semibold">Project Tasks</h2>
          <RoleGuard userRole={role} allowedRoles={['ADMIN']}>
            <CreateTaskModal fixedProjectId={project.id} users={projectUsers} />
          </RoleGuard>
        </div>

        {tasks && tasks.length > 0 ? (
          <div className="flex flex-col gap-4">
            {tasks.map(t => (
              <TaskCard 
                key={t.id} 
                task={t} 
                users={projectUsers} 
                isAssigned={t.assigned_to === user.id} 
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 border-2 border-dashed rounded-xl text-center bg-gray-50 flex flex-col items-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 max-w-sm">Get started by creating a new task for your team members.</p>
          </div>
        )}
      </section>
    </div>
  )
}
