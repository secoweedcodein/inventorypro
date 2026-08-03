'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getUserCompanyId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado', companyId: null }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .limit(1)

  if (!profiles || profiles.length === 0) {
    return { error: 'Perfil no encontrado', companyId: null }
  }

  return { error: null, companyId: profiles[0].company_id }
}

export async function createCategory(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { error, companyId } = await getUserCompanyId()

  if (error) return { error }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) return { error: 'El nombre es obligatorio' }

  const { error: insertError } = await supabase
    .from('categories')
    .insert({
      name,
      description,
      company_id: companyId
    })

  if (insertError) return { error: insertError.message }

  revalidatePath('/categories')
  redirect('/categories')
}

export async function updateCategory(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { error, companyId } = await getUserCompanyId()

  if (error) return { error }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) return { error: 'El nombre es obligatorio' }

  const { error: updateError } = await supabase
    .from('categories')
    .update({ name, description })
    .eq('id', id)
    .eq('company_id', companyId)

  if (updateError) return { error: updateError.message }

  revalidatePath('/categories')
  redirect('/categories')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error, companyId } = await getUserCompanyId()

  if (error) return { error }

  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (deleteError) return { error: deleteError.message }

  revalidatePath('/categories')
  return { success: true }
}