'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useActionState, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface PurchaseFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>
  suppliers: { id: string; name: string }[]
  products: { id: string; name: string; sku: string; cost: number }[]
  submitLabel: string
}

interface PurchaseItem {
  product_id: string
  product_name: string
  supplier_name: string
  quantity: number
  unit_cost: number
}

export function PurchaseForm({ action, suppliers, products, submitLabel }: PurchaseFormProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null })
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')

  const addItem = () => {
    if (!selectedProduct || !quantity || !unitCost) {
      alert('Completa todos los campos del producto')
      return
    }

    const product = products.find(p => p.id === selectedProduct)
    if (!product) return

    const supplier = suppliers.find(s => s.id === selectedProduct)
    
    setItems([...items, {
      product_id: selectedProduct,
      product_name: product.name,
      supplier_name: supplier?.name || 'N/A',
      quantity: parseFloat(quantity),
      unit_cost: parseFloat(unitCost)
    }])

    setSelectedProduct('')
    setQuantity('')
    setUnitCost('')
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Compra</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <input type="hidden" name="items" value={JSON.stringify(items)} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Proveedor *</Label>
              <Select name="supplier_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Referencia *</Label>
              <Input
                id="reference"
                name="reference"
                required
                placeholder="Ej: Factura #123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Observaciones de la compra"
              rows={2}
            />
          </div>

          {/* Agregar productos */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Agregar Productos</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Producto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label>Costo Unitario</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button type="button" onClick={addItem} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          {items.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Productos en la Compra ({items.length})</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Producto</th>
                    <th className="text-center py-2 px-3 font-medium">Cantidad</th>
                    <th className="text-right py-2 px-3 font-medium">Costo Unit.</th>
                    <th className="text-right py-2 px-3 font-medium">Subtotal</th>
                    <th className="text-center py-2 px-3 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-3">{item.product_name}</td>
                      <td className="py-2 px-3 text-center">{item.quantity}</td>
                      <td className="py-2 px-3 text-right">${item.unit_cost.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right">${(item.quantity * item.unit_cost).toFixed(2)}</td>
                      <td className="py-2 px-3 text-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td colSpan={3} className="py-2 px-3 text-right font-semibold">Total:</td>
                    <td className="py-2 px-3 text-right font-bold text-lg">${total.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {state?.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">{state.error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending || items.length === 0}>
            {isPending ? 'Registrando...' : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}