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

export async function createSale(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { error, companyId, userId } = await getUserCompanyId()

  if (error || !companyId || !userId) return { error }

  const customerName = formData.get('customer_name') as string || 'Cliente General'
  const customerEmail = formData.get('customer_email') as string || null
  const customerPhone = formData.get('customer_phone') as string || null
  const reference = formData.get('reference') as string
  const notes = formData.get('notes') as string || null
  const paymentMethod = formData.get('payment_method') as string || 'CASH'
  const taxPercent = parseFloat(formData.get('tax_percent') as string) || 0
  const discountAmount = parseFloat(formData.get('discount') as string) || 0
  const itemsJson = formData.get('items') as string

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

  // Obtener tipo de movimiento VENTA
  const { data: saleType } = await supabase
    .from('inventory_movement_types')
    .select('id')
    .eq('name', 'VENTA')
    .single()

  if (!saleType) {
    return { error: 'Tipo de movimiento VENTA no encontrado' }
  }

  // Calcular totales
  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (item.quantity * item.unit_price - item.discount)
  }, 0)

  const tax = subtotal * (taxPercent / 100)
  const total = subtotal + tax - discountAmount

  // Crear venta
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      reference,
      notes,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      payment_method: paymentMethod,
      status: 'COMPLETED',
      company_id: companyId,
      created_by: userId
    })
    .select()
    .single()

  if (saleError) return { error: saleError.message }

  // Procesar cada producto
  for (const item of items) {
    const productId = item.product_id
    const quantity = parseFloat(item.quantity)
    const unitPrice = parseFloat(item.unit_price)
    const itemDiscount = parseFloat(item.discount) || 0

    // Obtener stock actual
    const { data: inventoryRecord } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouse.id)
      .eq('company_id', companyId)
      .maybeSingle()

    const previousStock = inventoryRecord?.quantity || 0
    const newStock = previousStock - quantity

    if (newStock < 0) {
      return { error: `Stock insuficiente para "${item.product_name}". Disponible: ${previousStock}` }
    }

    // Crear movimiento de inventario
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: productId,
        warehouse_id: warehouse.id,
        movement_type_id: saleType.id,
        quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        reference: `Venta #${sale.id}`,
        notes: `Cliente: ${customerName}`,
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

    // Crear detalle de venta
    const { error: detailError } = await supabase
      .from('sale_items')
      .insert({
        sale_id: sale.id,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        discount: itemDiscount,
        total: (quantity * unitPrice) - itemDiscount
      })

    if (detailError) return { error: detailError.message }
  }

  revalidatePath('/sales')
  redirect('/sales')
}