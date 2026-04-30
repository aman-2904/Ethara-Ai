'use client'

import { useTransition } from 'react'
import { deleteProject } from '@/app/actions/projects'
import { AddMemberModal } from './AddMemberModal'
import Link from 'next/link'

interface Project {
  id: string;
  name: string;
  description: string;
  created_by: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function ProjectCard({ project, users, isAdmin }: { project: Project, users: User[], isAdmin: boolean }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      startTransition(async () => {
        await deleteProject(project.id)
      })
    }
  }

  return (
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white relative flex flex-col justify-between">
      <div>
        {isAdmin && (
          <button 
            onClick={handleDelete}
            disabled={isPending}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors z-10"
            title="Delete Project"
          >
            {isPending ? '...' : '🗑️'}
          </button>
        )}
        <h3 className="font-semibold text-lg pr-6">{project.name}</h3>
        <p className="text-gray-600 text-sm mt-2 mb-6 min-h-[3rem]">{project.description}</p>
      </div>
      
      <div className="flex gap-4 items-center justify-between border-t pt-4 mt-auto">
        <Link 
          href={`/projects/${project.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          View Details →
        </Link>
        {isAdmin && (
          <div className="flex-shrink-0">
            <AddMemberModal projectId={project.id} users={users} />
          </div>
        )}
      </div>
    </div>
  )
}
