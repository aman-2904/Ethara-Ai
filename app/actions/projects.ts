'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.user_metadata.role !== 'ADMIN') {
    return { error: 'Unauthorized: Only ADMINs can create projects' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) return { error: 'Project name is required' }

  const { error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      created_by: user.id
    })

  if (error) {
    console.error('Error creating project:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function addProjectMember(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== 'ADMIN') {
    return { error: 'Unauthorized: Only ADMINs can manage members' }
  }

  const projectId = formData.get('projectId') as string
  const userId = formData.get('userId') as string

  if (!projectId || !userId) return { error: 'Project ID and User ID are required' }

  const { error } = await supabase
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: userId
    })

  if (error) {
    console.error('Error adding member:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== 'ADMIN') {
    return { error: 'Unauthorized: Only ADMINs can delete projects' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('Error deleting project:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
