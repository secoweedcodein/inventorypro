import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createProduct } from '@/app/actions/products'
import { ProductForm } from '@/components/products/ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: brands } = await supabase.from('brands').select('id, name').order('name')
  const { data: suppliers } = await supabase.from('suppliers').select('id, name').order('name')

  return (
    <div className="p-8">
      <ProductForm
        action={createProduct}
        brands={brands || []}
        suppliers={suppliers || []}
        submitLabel="Crear Producto"
      />
    </div>
  )
}