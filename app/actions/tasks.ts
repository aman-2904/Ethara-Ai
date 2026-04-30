'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== 'ADMIN') {
    return { error: 'Unauthorized: Only ADMINs can create tasks' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const projectId = formData.get('projectId') as string
  const assignedTo = formData.get('assignedTo') as string

  if (!title || !projectId) return { error: 'Title and Project ID are required' }

  const { error } = await supabase
    .from('tasks')
    .insert({
      title,
      description,
      project_id: projectId,
      assigned_to: assignedTo || null
    })

  if (error) {
    console.error('Error creating task:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating task status:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
