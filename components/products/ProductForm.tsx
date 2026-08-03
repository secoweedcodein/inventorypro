'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useActionState, useState } from 'react'
import { ImageUpload } from './ImageUpload'
import { RefreshCw } from 'lucide-react'

interface ProductFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>
  initialData?: {
    id?: string
    name: string
    description?: string | null
    sku: string
    barcode: string
    cost: number
    price: number
    stock: number
    min_stock: number
    brand_id?: string | null
    supplier_id?: string | null
    image_url?: string | null
  }
  brands: { id: string; name: string }[]
  suppliers: { id: string; name: string }[]
  submitLabel: string
}

export function ProductForm({ action, initialData, brands, suppliers, submitLabel }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null })
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image_url || null)

  const generateSKU = () => {
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `PRD-${timestamp}${random}`
  }

  const generateBarcode = () => {
    return Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('')
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{submitLabel}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {initialData?.id && (
            <input type="hidden" name="id" value={initialData.id} />
          )}
          <input type="hidden" name="image_url" value={imageUrl || ''} />

          <ImageUpload currentImage={imageUrl} onImageChange={setImageUrl} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={initialData?.name || ''}
                placeholder="Ej: Laptop HP 15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={initialData?.description || ''}
                placeholder="Descripción del producto"
                rows={2}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <div className="flex gap-2">
                <Input
                  id="sku"
                  name="sku"
                  defaultValue={initialData?.sku || ''}
                  placeholder="PRD-XXXX"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    const input = document.getElementById('sku') as HTMLInputElement
                    if (input) input.value = generateSKU()
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de barras</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  name="barcode"
                  defaultValue={initialData?.barcode || ''}
                  placeholder="7501234567890"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    const input = document.getElementById('barcode') as HTMLInputElement
                    if (input) input.value = generateBarcode()
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initialData?.cost || 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio venta *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={initialData?.price || 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                defaultValue={initialData?.stock || 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Stock mínimo</Label>
              <Input
                id="min_stock"
                name="min_stock"
                type="number"
                min="0"
                defaultValue={initialData?.min_stock || 0}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Marca</Label>
              <Select name="brand_id" defaultValue={initialData?.brand_id || 'none'}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin marca</SelectItem>
                  {brands.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Select name="supplier_id" defaultValue={initialData?.supplier_id || 'none'}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin proveedor</SelectItem>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">{state.error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}