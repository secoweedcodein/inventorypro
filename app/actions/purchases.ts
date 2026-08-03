'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getUserCompanyId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado', companyId: null, userId: null }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .limit(1)

  if (!profiles || profiles.length === 0) {
    return { error: 'Perfil no encontrado', companyId: null, userId: null }
  }

  return { error: null, companyId: profiles[0].company_id, userId: user.id }
}

export async function createPurchase(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { error, companyId, userId } = await getUserCompanyId()

  if (error || !companyId || !userId) return { error }

  const supplierId = formData.get('supplier_id') as string
  const reference = formData.get('reference') as string
  const notes = formData.get('notes') as string || null
  const itemsJson = formData.get('items') as string

  if (!supplierId) return { error: 'Proveedor es obligatorio' }
  if (!reference) return { error: 'Referencia es obligatoria' }
  if (!itemsJson) return { error: 'Debe agregar al menos un producto' }

  let items
  try {
    items = JSON.parse(itemsJson)
  } catch {
    return { error: 'Formato de productos inválido' }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'Debe agregar al menos un producto' }
  }

  // Obtener almacén principal
  const { data: warehouse } = await supabase
    .from('warehouses')
    .select('id')
    .eq('company_id', companyId)
    .limit(1)
    .single()

  if (!warehouse) {
    return { error: 'No hay almacenes configurados' }
  }

  // Obtener tipo de movimiento COMPRA
  const { data: purchaseType } = await supabase
    .from('inventory_movement_types')
    .select('id')
    .eq('name', 'COMPRA')
    .single()

  if (!purchaseType) {
    return { error: 'Tipo de movimiento COMPRA no encontrado' }
  }

  // Calcular total
  const total = items.reduce((sum: number, item: any) => {
    return sum + (item.quantity * item.unit_cost)
  }, 0)

  // Crear orden de compra
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      supplier_id: supplierId,
      reference,
      notes,
      total,
      status: 'COMPLETED',
      company_id: companyId,
      created_by: userId
    })
    .select()
    .single()

  if (purchaseError) return { error: purchaseError.message }

  // Procesar cada producto
  for (const item of items) {
    const productId = item.product_id
    const quantity = parseFloat(item.quantity)
    const unitCost = parseFloat(item.unit_cost)

    // Obtener stock actual
    const { data: inventoryRecord } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouse.id)
      .eq('company_id', companyId)
      .maybeSingle()

    const previousStock = inventoryRecord?.quantity || 0
    const newStock = previousStock + quantity

    // Crear movimiento de inventario
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: productId,
        warehouse_id: warehouse.id,
        movement_type_id: purchaseType.id,
        quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        reference: `Compra #${purchase.id}`,
        notes: `Proveedor: ${item.supplier_name}`,
        created_by: userId,
        company_id: companyId
      })

    if (movementError) return { error: `Error en producto ${item.product_name}: ${movementError.message}` }

    // Actualizar inventario
    const { error: inventoryError } = await supabase
      .from('inventory')
      .upsert({
        product_id: productId,
        warehouse_id: warehouse.id,
        quantity: newStock,
        company_id: companyId
      }, {
        onConflict: 'warehouse_id,product_id'
      })

    if (inventoryError) return { error: inventoryError.message }

    // Actualizar stock en products
    await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)
      .eq('company_id', companyId)

    // Crear detalle de compra
    const { error: detailError } = await supabase
      .from('purchase_items')
      .insert({
        purchase_id: purchase.id,
        product_id: productId,
        quantity,
        unit_cost: unitCost,
        total: quantity * unitCost
      })

    if (detailError) return { error: detailError.message }
  }

  revalidatePath('/purchases')
  redirect('/purchases')
}