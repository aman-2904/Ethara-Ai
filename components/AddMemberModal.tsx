'use client'

import { useState, useTransition } from 'react'
import { addProjectMember } from '@/app/actions/projects'

interface User {
  id: string;
  name: string;
  email: string;
}

export function AddMemberModal({ projectId, users }: { projectId: string, users: User[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    formData.append('projectId', projectId)
    setError(null)
    startTransition(async () => {
      const result = await addProjectMember(formData)
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
        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded transition-colors"
      >
        Add Member
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Add Member</h2>
            <form action={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select User</label>
                <select name="userId" required className="w-full border rounded-md px-3 py-2 bg-inherit">
                  <option value="">-- Choose a user --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>
              
              {error && <p className="text-red-600 text-sm">{error}</p>}
              
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
              >
                {isPending ? 'Adding...' : 'Add to Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
