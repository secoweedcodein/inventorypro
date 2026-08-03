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

export async function createInventoryMovement(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { error, companyId, userId } = await getUserCompanyId()

  if (error || !companyId || !userId) return { error }

  const productId = formData.get('product_id') as string
  const movementTypeId = formData.get('movement_type_id') as string
  const quantity = parseFloat(formData.get('quantity') as string) || 0
  const notes = formData.get('notes') as string || null
  const reference = formData.get('reference') as string || null

  if (!productId) return { error: 'Producto es obligatorio' }
  if (!movementTypeId) return { error: 'Tipo de movimiento es obligatorio' }
  if (quantity <= 0) return { error: 'Cantidad debe ser mayor a 0' }

  // Obtener el almacén principal de la empresa
  const { data: warehouse, error: warehouseError } = await supabase
    .from('warehouses')
    .select('id')
    .eq('company_id', companyId)
    .limit(1)
    .single()

  if (warehouseError || !warehouse) {
    return { error: 'No hay almacenes configurados. Crea al menos un almacén primero.' }
  }

  // Obtener stock actual del producto en el inventario
  const { data: inventoryRecord } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouse.id)
    .eq('company_id', companyId)
    .maybeSingle()

  const previousStock = inventoryRecord?.quantity || 0
  let newStock = previousStock

  // Consultar el nombre del tipo de movimiento para saber si suma o resta
  const { data: movementType } = await supabase
    .from('inventory_movement_types')
    .select('name, operation')
    .eq('id', movementTypeId)
    .single()

  if (!movementType) return { error: 'Tipo de movimiento no válido' }

  const operation = movementType.operation?.toUpperCase()

  if (operation === 'IN') {
    newStock = previousStock + quantity
  } else if (operation === 'OUT') {
    newStock = previousStock - quantity
    if (newStock < 0) {
      return { error: 'Stock insuficiente para esta salida' }
    }
  }

  // Crear movimiento en inventory_movements
  const { error: movementError } = await supabase
    .from('inventory_movements')
    .insert({
      product_id: productId,
      warehouse_id: warehouse.id,
      movement_type_id: movementTypeId,
      quantity,
      previous_stock: previousStock,
      new_stock: newStock,
      reference,
      notes,
      created_by: userId,
      company_id: companyId
    })

  if (movementError) return { error: movementError.message }

  // Actualizar o insertar en la tabla inventory (upsert)
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

  // Actualizar stock en la tabla products (para mantener compatibilidad)
  const { error: updateError } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', productId)
    .eq('company_id', companyId)

  if (updateError) return { error: updateError.message }

  revalidatePath('/inventory')
  redirect('/inventory')
}