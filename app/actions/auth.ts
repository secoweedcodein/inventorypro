'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  console.log('signUp llamado con:', Object.fromEntries(formData))
  
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const companyName = formData.get('companyName') as string

  if (!email || !password || !fullName || !companyName) {
    return { error: 'Todos los campos son obligatorios' }
  }

  console.log('Intentando registrar usuario:', email)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName,
      },
    },
  })

  console.log('Respuesta de Supabase:', { data, error })

  if (error) {
    console.error('Error de Supabase:', error)
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'No se pudo crear el usuario' }
  }

  console.log('Usuario creado exitosamente:', data.user.id)
  redirect('/dashboard')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}