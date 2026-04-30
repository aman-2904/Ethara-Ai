'use client'

import { useTransition } from 'react'
import { updateTaskStatus } from '@/app/actions/tasks'

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function TaskCard({ task, users, isAssigned, isAdmin }: { task: Task, users: User[], isAssigned: boolean, isAdmin: boolean }) {
  const [isPending, startTransition] = useTransition()

  // Calculate overdue status
  let isOverdue = false
  if (task.due_date && task.status !== 'DONE') {
    const dueDate = new Date(task.due_date)
    const today = new Date()
    // Reset time for accurate day comparison
    today.setHours(0, 0, 0, 0)
    if (dueDate < today) {
      isOverdue = true
    }
  }

  const assignedUser = users.find(u => u.id === task.assigned_to)

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    startTransition(async () => {
      await updateTaskStatus(task.id, newStatus)
    })
  }

  return (
    <div className={`p-4 border rounded-lg shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white transition-colors hover:bg-gray-50 ${isOverdue ? 'border-red-500 bg-red-50 hover:bg-red-50' : ''}`}>
      <div className="mb-4 sm:mb-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{task.title}</h3>
          {isOverdue && (
            <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded border border-red-200">
              OVERDUE
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mt-1">{task.description}</p>
        
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
          {assignedUser ? (
            <span className="flex items-center gap-1 font-medium">
              👤 {assignedUser.name || assignedUser.email}
            </span>
          ) : (
            <span className="flex items-center gap-1 italic">
              👤 Unassigned
            </span>
          )}
          
          {task.due_date && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              📅 Due: {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 self-start sm:self-center">
        {/* If the user is assigned or is an Admin, they can change the status. */}
        {isAssigned || isAdmin ? (
          <div className="relative">
            <select 
              value={task.status} 
              onChange={handleStatusChange}
              disabled={isPending}
              className={`text-xs font-bold px-3 py-1.5 rounded cursor-pointer border transition-colors ${
                task.status === 'DONE' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : 
                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' : 
                'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
              } ${isPending ? 'opacity-50' : ''}`}
            >
              <option value="TODO" className="bg-white text-black">TODO</option>
              <option value="IN_PROGRESS" className="bg-white text-black">IN_PROGRESS</option>
              <option value="DONE" className="bg-white text-black">DONE</option>
            </select>
          </div>
        ) : (
          <span className={`px-2 py-1 text-xs rounded font-bold ${
            task.status === 'DONE' ? 'bg-green-100 text-green-800' : 
            task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {task.status}
          </span>
        )}
      </div>
    </div>
  )
}
