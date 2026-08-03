import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createSale } from '@/app/actions/sales'
import { SaleForm } from '@/components/sales/SaleForm'

export default async function NewSalePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('id, name, sku, price, stock')
    .eq('active', true)
    .order('name')

  return (
    <div className="p-8">
      <SaleForm
        action={createSale}
        products={products || []}
        submitLabel="Registrar Venta"
      />
    </div>
  )
}