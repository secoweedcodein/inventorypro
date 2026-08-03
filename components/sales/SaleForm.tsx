'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useActionState, useState } from 'react'
import { Plus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone } from 'lucide-react'

interface SaleFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>
  products: { id: string; name: string; sku: string; price: number; stock: number }[]
  submitLabel: string
}

interface SaleItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  discount: number
}

export function SaleForm({ action, products, submitLabel }: SaleFormProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null })
  const [items, setItems] = useState<SaleItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [itemDiscount, setItemDiscount] = useState('0')
  const [taxPercent, setTaxPercent] = useState('0')
  const [globalDiscount, setGlobalDiscount] = useState('0')

  const addItem = () => {
    if (!selectedProduct || !quantity || !unitPrice) {
      alert('Completa todos los campos del producto')
      return
    }

    const product = products.find(p => p.id === selectedProduct)
    if (!product) return

    const qty = parseFloat(quantity)
    if (qty > product.stock) {
      alert(`Stock insuficiente. Disponible: ${product.stock}`)
      return
    }

    setItems([...items, {
      product_id: selectedProduct,
      product_name: product.name,
      quantity: qty,
      unit_price: parseFloat(unitPrice),
      discount: parseFloat(itemDiscount) || 0
    }])

    setSelectedProduct('')
    setQuantity('')
    setUnitPrice('')
    setItemDiscount('0')
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId)
    const product = products.find(p => p.id === productId)
    if (product) {
      setUnitPrice(product.price.toString())
    }
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price - item.discount)
  }, 0)

  const tax = subtotal * (parseFloat(taxPercent) / 100)
  const total = subtotal + tax - (parseFloat(globalDiscount) || 0)

  const paymentMethods = [
    { value: 'CASH', label: 'Efectivo', icon: Banknote },
    { value: 'CARD', label: 'Tarjeta', icon: CreditCard },
    { value: 'TRANSFER', label: 'Transferencia', icon: Smartphone },
  ]

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Punto de Venta
        </CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <input type="hidden" name="items" value={JSON.stringify(items)} />
          <input type="hidden" name="tax_percent" value={taxPercent} />
          <input type="hidden" name="discount" value={globalDiscount} />

          {/* Datos del cliente */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Cliente</Label>
              <Input
                id="customer_name"
                name="customer_name"
                defaultValue="Cliente General"
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                name="customer_email"
                type="email"
                placeholder="cliente@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Teléfono</Label>
              <Input
                id="customer_phone"
                name="customer_phone"
                placeholder="+52 55 1234 5678"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reference">Referencia *</Label>
              <Input
                id="reference"
                name="reference"
                required
                defaultValue={`VTA-${Date.now().toString().slice(-6)}`}
                placeholder="VTA-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select name="payment_method" defaultValue="CASH">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(pm => (
                    <SelectItem key={pm.value} value={pm.value}>
                      <span className="flex items-center gap-2">
                        <pm.icon className="h-4 w-4" />
                        {pm.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Agregar productos */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
            <h3 className="font-semibold">Agregar Productos</h3>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2 space-y-2">
                <Label>Producto</Label>
                <Select value={selectedProduct} onValueChange={handleProductSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.stock > 0).map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.sku}) - Stock: {p.stock}
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
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Precio</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
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
              <h3 className="font-semibold mb-4">Productos en la Venta ({items.length})</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Producto</th>
                    <th className="text-center py-2 px-3 font-medium">Cant.</th>
                    <th className="text-right py-2 px-3 font-medium">Precio</th>
                    <th className="text-right py-2 px-3 font-medium">Desc.</th>
                    <th className="text-right py-2 px-3 font-medium">Subtotal</th>
                    <th className="text-center py-2 px-3 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-3 font-medium">{item.product_name}</td>
                      <td className="py-2 px-3 text-center">{item.quantity}</td>
                      <td className="py-2 px-3 text-right">${item.unit_price.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-red-500">
                        {item.discount > 0 ? `-$${item.discount.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        ${(item.quantity * item.unit_price - item.discount).toFixed(2)}
                      </td>
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
              </table>
            </div>
          )}

          {/* Totales */}
          {items.length > 0 && (
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>IVA (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descuento Global</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Input id="notes" name="notes" placeholder="Observaciones" />
                </div>
              </div>
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {parseFloat(taxPercent) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>IVA ({taxPercent}%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(globalDiscount) > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Descuento:</span>
                    <span>-${parseFloat(globalDiscount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {state?.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">{state.error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending || items.length === 0} size="lg" className="w-full">
            {isPending ? 'Procesando...' : `Cobrar $${total.toFixed(2)}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}