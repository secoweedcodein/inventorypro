'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getUserCompanyId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado', companyId: null }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .limit(1)

  if (!profiles || profiles.length === 0) {
    return { error: 'Perfil no encontrado', companyId: null }
  }

  return { error: null, companyId: profiles[0].company_id }
}

function generateSKU(): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PRD-${timestamp}${random}`
}

function generateBarcode(): string {
  return Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('')
}

export async function uploadProductImage(formData: FormData) {
  const supabase = await createClient()
  const { error, companyId } = await getUserCompanyId()

  if (error || !companyId) return { error, url: null }

  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'No se seleccionó archivo', url: null }

  const fileExt = file.name.split('.').pop()
  const fileName = `${companyId}/${Date.now()}.${fileExt}`

  const { data, error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: true })

  if (uploadError) return { error: uploadError.message, url: null }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path)

  return { error: null, url: urlData.publicUrl }
}

export async function createProduct(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { error, companyId } = await getUserCompanyId()

  if (error || !companyId) return { error }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const sku = (formData.get('sku') as string) || generateSKU()
  const barcode = (formData.get('barcode') as string) || generateBarcode()
  const cost = parseFloat(formData.get('cost') as string) || 0
  const price = parseFloat(formData.get('price') as string) || 0
  const stock = parseInt(formData.get('stock') as string) || 0
  const minStock = parseInt(formData.get('min_stock') as string) || 0
  const brandId = (formData.get('brand_id') as string) === 'none' ? null : (formData.get('brand_id') as string) || null
  const supplierId = (formData.get('supplier_id') as string) === 'none' ? null : (formData.get('supplier_id') as string) || null
  const imageUrl = formData.get('image_url') as string || null

  if (!name) return { error: 'El nombre es obligatorio' }
  if (price <= 0) return { error: 'El precio de venta debe ser mayor a 0' }

  const { error: insertError } = await supabase
    .from('products')
    .insert({
      name,
      description,
      sku,
      barcode,
      cost,
      price,
      stock,
      min_stock: minStock,
      brand_id: brandId,
      supplier_id: supplierId,
      image_url: imageUrl,
      company_id: companyId,
      active: true
    })

  if (insertError) return { error: insertError.message }

  revalidatePath('/products')
  redirect('/products')
}

export async function updateProduct(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { error, companyId } = await getUserCompanyId()

  if (error || !companyId) return { error }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const sku = formData.get('sku') as string
  const barcode = formData.get('barcode') as string
  const cost = parseFloat(formData.get('cost') as string) || 0
  const price = parseFloat(formData.get('price') as string) || 0
  const stock = parseInt(formData.get('stock') as string) || 0
  const minStock = parseInt(formData.get('min_stock') as string) || 0
  const brandId = (formData.get('brand_id') as string) === 'none' ? null : (formData.get('brand_id') as string) || null
  const supplierId = (formData.get('supplier_id') as string) === 'none' ? null : (formData.get('supplier_id') as string) || null
  const imageUrl = formData.get('image_url') as string || null

  if (!name) return { error: 'El nombre es obligatorio' }

  const { error: updateError } = await supabase
    .from('products')
    .update({
      name,
      description,
      sku,
      barcode,
      cost,
      price,
      stock,
      min_stock: minStock,
      brand_id: brandId,
      supplier_id: supplierId,
      image_url: imageUrl
    })
    .eq('id', id)
    .eq('company_id', companyId)

  if (updateError) return { error: updateError.message }

  revalidatePath('/products')
  redirect('/products')
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error, companyId } = await getUserCompanyId()

  if (error || !companyId) return { error }

  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (deleteError) return { error: deleteError.message }

  revalidatePath('/products')
  return { success: true }
}