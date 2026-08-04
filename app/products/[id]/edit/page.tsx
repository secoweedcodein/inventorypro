import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { updateProduct } from '@/app/actions/products'
import { ProductForm } from '@/components/products/ProductForm'

// Tipado seguro para Next.js 15+
type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditProductPage(props: PageProps) {
  // 1. Hacemos el await de props.params aquí dentro
  const params = await props.params
  const id = params.id
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const { data: brands } = await supabase.from('brands').select('id, name').order('name')
  const { data: suppliers } = await supabase.from('suppliers').select('id, name').order('name')

  return (
    <div className="p-8">
      <ProductForm
        action={updateProduct}
        initialData={product}
        brands={brands || []}
        suppliers={suppliers || []}
        submitLabel="Actualizar Producto"
      />
    </div>
  )
}