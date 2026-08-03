import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createInventoryMovement } from '@/app/actions/inventory'
import { InventoryForm } from '@/components/inventory/InventoryForm'

export default async function InventoryMovementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, sku, stock')
    .eq('active', true)
    .order('name')

  const { data: movementTypes, error: movementTypesError } = await supabase
    .from('inventory_movement_types')
    .select('id, name')
    .order('name')

  // Debug: Mostrar errores en consola del servidor
  if (productsError) console.error('Error cargando productos:', productsError)
  if (movementTypesError) console.error('Error cargando tipos:', movementTypesError)
  
  console.log('Movement Types cargados:', movementTypes)

  return (
    <div className="p-8">
      <InventoryForm
        action={createInventoryMovement}
        products={products || []}
        movementTypes={movementTypes || []}
        submitLabel="Registrar Movimiento"
      />
    </div>
  )
}