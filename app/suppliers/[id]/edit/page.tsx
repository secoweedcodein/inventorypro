import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { updateSupplier } from '@/app/actions/suppliers'
import { SupplierForm } from '@/components/suppliers/SupplierForm'

type PageProps = { params: Promise<{ id: string }> }

export default async function EditSupplierPage(props: PageProps) {
  const params = await props.params
  const id = params.id

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: supplier } = await supabase.from('suppliers').select('*').eq('id', id).single()
  if (!supplier) notFound()

  return (
    <div className="p-8">
      <SupplierForm
        action={updateSupplier}
        initialData={supplier}
        submitLabel="Actualizar Proveedor"
      />
    </div>
  )
}