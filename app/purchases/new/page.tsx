import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createPurchase } from '@/app/actions/purchases'
import { PurchaseForm } from '@/components/purchases/PurchaseForm'

export default async function NewPurchasePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const { data: products } = await supabase
    .from('products')
    .select('id, name, sku, cost')
    .eq('active', true)
    .order('name')

  return (
    <div className="p-8">
      <PurchaseForm
        action={createPurchase}
        suppliers={suppliers || []}
        products={products || []}
        submitLabel="Registrar Compra"
      />
    </div>
  )
}