'use client'

import { useState, useTransition } from 'react'
import { createProject } from '@/app/actions/projects'

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await createProject(formData)
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
        className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 transition-colors"
      >
        Create Project
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
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form action={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input 
                  name="name" 
                  required 
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  name="description" 
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="What is this project about?"
                  rows={3}
                />
              </div>
              
              {error && <p className="text-red-600 text-sm">{error}</p>}
              
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
              >
                {isPending ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
