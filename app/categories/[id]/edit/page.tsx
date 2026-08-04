import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { updateCategory } from '@/app/actions/categories'
import { CategoryForm } from '@/components/categories/CategoryForm'

type PageProps = { params: Promise<{ id: string }> }

export default async function EditCategoryPage(props: PageProps) {
  const params = await props.params
  const id = params.id

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: category } = await supabase.from('categories').select('*').eq('id', id).single()
  if (!category) notFound()

  return (
    <div className="p-8">
      <CategoryForm
        action={updateCategory}
        initialData={{ id: category.id, name: category.name, description: category.description }}
        submitLabel="Actualizar Categoría"
      />
    </div>
  )
}