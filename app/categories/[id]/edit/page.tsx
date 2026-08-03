import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { revalidatePath } from 'next/cache'

async function updateCategoryAction(prevState: any, formData: FormData) {
  'use server'
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .limit(1)

  if (!profiles || profiles.length === 0) {
    return { error: 'Perfil no encontrado' }
  }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) return { error: 'El nombre es obligatorio' }

  const { error } = await supabase
    .from('categories')
    .update({ name, description })
    .eq('id', id)
    .eq('company_id', profiles[0].company_id)

  if (error) return { error: error.message }

  revalidatePath('/categories')
  redirect('/categories')
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (!category) {
    notFound()
  }

  return (
    <div className="p-8">
      <CategoryForm
        action={updateCategoryAction}
        initialData={{
          id: category.id,
          name: category.name,
          description: category.description
        }}
        submitLabel="Actualizar Categoría"
      />
    </div>
  )
}