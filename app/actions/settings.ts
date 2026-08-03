'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Definimos el tipo explícito para el estado de la acción
export type ActionState = {
  error: string | null
  success: boolean
}

export async function updateCompany(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado', success: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Perfil no encontrado', success: false }

  const name = formData.get('name') as string
  if (!name) return { error: 'El nombre es obligatorio', success: false }

  const { error } = await supabase
    .from('companies')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', profile.company_id)

  if (error) return { error: error.message, success: false }

  revalidatePath('/settings')
  revalidatePath('/settings/users')
  return { error: null, success: true }
}

export async function updateProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado', success: false }

  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const phone = formData.get('phone') as string

  if (!first_name || !last_name) return { error: 'Nombre y apellido son obligatorios', success: false }

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name,
      last_name,
      phone,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) return { error: error.message, success: false }

  revalidatePath('/settings')
  revalidatePath('/settings/users')
  return { error: null, success: true }
}