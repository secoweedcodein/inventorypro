import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, AlertTriangle, DollarSign } from 'lucide-react'

export default async function InventoryReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('id, name, sku, cost, price, stock, min_stock')
    .eq('active', true)
    .order('name')

  const totalProducts = products?.length || 0
  const totalUnits = products?.reduce((sum, p) => sum + Number(p.stock || 0), 0) || 0
  const valueAtCost = products?.reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.cost || 0)), 0) || 0
  const valueAtSale = products?.reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.price || 0)), 0) || 0
  const potentialProfit = valueAtSale - valueAtCost
  const lowStockCount = products?.filter(p => Number(p.stock) <= Number(p.min_stock)).length || 0

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Valor de Inventario</h1>
          <p className="text-muted-foreground mt-1">Análisis completo del inventario</p>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-muted-foreground">Productos</p>
          </div>
          <p className="text-2xl font-bold mt-2">{totalProducts}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Unidades Totales</p>
          <p className="text-2xl font-bold mt-2">{totalUnits}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Valor al Costo</p>
          <p className="text-2xl font-bold mt-2 text-orange-600">${valueAtCost.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Valor a la Venta</p>
          <p className="text-2xl font-bold mt-2 text-green-600">${valueAtSale.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Ganancia Potencial</p>
          <p className="text-2xl font-bold mt-2 text-purple-600">${potentialProfit.toFixed(2)}</p>
        </Card>
      </div>

      {lowStockCount > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">
                {lowStockCount} producto(s) con stock bajo o agotado
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalle */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Producto</th>
                  <th className="text-left py-3 px-4 font-medium">SKU</th>
                  <th className="text-center py-3 px-4 font-medium">Stock</th>
                  <th className="text-right py-3 px-4 font-medium">Costo Unit.</th>
                  <th className="text-right py-3 px-4 font-medium">Precio Venta</th>
                  <th className="text-right py-3 px-4 font-medium">Valor Costo</th>
                  <th className="text-right py-3 px-4 font-medium">Valor Venta</th>
                  <th className="text-center py-3 px-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product) => {
                  const stock = Number(product.stock || 0)
                  const cost = Number(product.cost || 0)
                  const price = Number(product.price || 0)
                  const isLow = stock <= Number(product.min_stock)
                  return (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{product.name}</td>
                      <td className="py-3 px-4 font-mono text-xs">{product.sku}</td>
                      <td className="py-3 px-4 text-center font-semibold">{stock}</td>
                      <td className="py-3 px-4 text-right">${cost.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">${price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">${(stock * cost).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        ${(stock * price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Bajo
                          </Badge>
                        ) : stock === 0 ? (
                          <Badge variant="outline">Agotado</Badge>
                        ) : (
                          <Badge variant="secondary">OK</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}