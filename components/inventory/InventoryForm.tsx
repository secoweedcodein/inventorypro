'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useActionState, useEffect } from 'react'

interface InventoryFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>
  products: { id: string; name: string; sku: string; stock: number }[]
  movementTypes: { id: string; name: string }[]
  submitLabel: string
}

export function InventoryForm({ action, products, movementTypes, submitLabel }: InventoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null })

  // Debug: Verificar que los datos llegan
  useEffect(() => {
    console.log('Products:', products)
    console.log('Movement Types:', movementTypes)
  }, [products, movementTypes])

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Movimiento de Inventario</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_id">Producto *</Label>
            <select 
              id="product_id" 
              name="product_id" 
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar producto</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - Stock: {p.stock}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="movement_type_id">Tipo de Movimiento *</Label>
            <select 
              id="movement_type_id" 
              name="movement_type_id" 
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar tipo</option>
              {movementTypes.map(mt => (
                <option key={mt.id} value={mt.id}>
                  {mt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              required
              placeholder="Ej: 10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referencia (opcional)</Label>
            <Input
              id="reference"
              name="reference"
              placeholder="Ej: Factura #123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Observaciones del movimiento"
              rows={3}
            />
          </div>

          {state?.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">{state.error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Registrando...' : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}