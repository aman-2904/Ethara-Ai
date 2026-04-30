'use client'

import { useState, useTransition } from 'react'
import { createTask } from '@/app/actions/tasks'

interface Project {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function CreateTaskModal({ projects, users, fixedProjectId }: { projects?: Project[], users: User[], fixedProjectId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await createTask(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setIsOpen(false)
      }
    })
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm font-medium transition-colors"
      >
        Create Task
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form action={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title</label>
                <input 
                  name="title" 
                  required 
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="e.g. Design Homepage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  name="description" 
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Task details..."
                  rows={2}
                />
              </div>
              
              {fixedProjectId ? (
                <input type="hidden" name="projectId" value={fixedProjectId} />
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">Project</label>
                  <select name="projectId" required className="w-full border rounded-md px-3 py-2 bg-inherit">
                    <option value="">-- Select Project --</option>
                    {projects?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Assign To (Optional)</label>
                  <select name="assignedTo" className="w-full border rounded-md px-3 py-2 bg-inherit">
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input 
                    name="dueDate" 
                    type="date"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              
              {error && <p className="text-red-600 text-sm">{error}</p>}
              
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
              >
                {isPending ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
