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

export async function createSupplier(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { error, companyId } = await getUserCompanyId()

  if (error || !companyId) return { error }

  const name = formData.get('name') as string
  const contact_name = formData.get('contact_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string

  if (!name) return { error: 'El nombre es obligatorio' }

  const { error: insertError } = await supabase
    .from('suppliers')
    .insert({
      name,
      contact_name,
      email,
      phone,
      address,
      notes,
      active: true,
      company_id: companyId
    })

  if (insertError) return { error: insertError.message }

  revalidatePath('/suppliers')
  redirect('/suppliers')
}

export async function updateSupplier(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { error, companyId } = await getUserCompanyId()

  if (error || !companyId) return { error }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const contact_name = formData.get('contact_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string

  if (!name) return { error: 'El nombre es obligatorio' }

  const { error: updateError } = await supabase
    .from('suppliers')
    .update({ 
      name, 
      contact_name, 
      email, 
      phone, 
      address, 
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('company_id', companyId)

  if (updateError) return { error: updateError.message }

  revalidatePath('/suppliers')
  redirect('/suppliers')
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient()
  const { error, companyId } = await getUserCompanyId()

  if (error || !companyId) return { error }

  const { error: deleteError } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (deleteError) return { error: deleteError.message }

  revalidatePath('/suppliers')
  return { success: true }
}