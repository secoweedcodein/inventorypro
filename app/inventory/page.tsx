import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, AlertTriangle, ArrowUpDown } from 'lucide-react'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('name')

    const { data: movements } = await supabase
    .from('inventory_movements')
    .select(`
      *,
      products(name, sku),
      inventory_movement_types(name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el stock de tus productos
          </p>
        </div>
        <Button asChild>
          <Link href="/inventory/movement">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Movimiento
          </Link>
        </Button>
      </div>

      {/* Stock por producto */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Actual ({products?.length || 0} productos)</CardTitle>
        </CardHeader>
        <CardContent>
          {!products || products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay productos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Producto</th>
                    <th className="text-left py-3 px-4 font-medium">SKU</th>
                    <th className="text-center py-3 px-4 font-medium">Stock Actual</th>
                    <th className="text-center py-3 px-4 font-medium">Stock Mínimo</th>
                    <th className="text-center py-3 px-4 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isLowStock = product.stock <= product.min_stock
                    return (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4 font-mono text-xs">{product.sku}</td>
                        <td className="py-3 px-4 text-center text-lg font-semibold">
                          {product.stock}
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground">
                          {product.min_stock}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isLowStock ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Stock Bajo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Normal</Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movimientos recientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Movimientos Recientes</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/inventory/history">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Ver Historial
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!movements || movements.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay movimientos registrados
            </p>
          ) : (
            <div className="space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      movement.inventory_movement_types?.name === 'VENTA' || movement.inventory_movement_types?.name === 'AJUSTE_SALIDA' || movement.inventory_movement_types?.name === 'MERMA'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {movement.inventory_movement_types?.name === 'VENTA' || movement.inventory_movement_types?.name === 'AJUSTE_SALIDA' || movement.inventory_movement_types?.name === 'MERMA' ? '↓' : '↑'}
                    </div>
                    <div>
                      <p className="font-medium">{movement.products?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {movement.products?.sku} • {movement.inventory_movement_types?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      movement.inventory_movement_types?.name === 'VENTA' || movement.inventory_movement_types?.name === 'AJUSTE_SALIDA' || movement.inventory_movement_types?.name === 'MERMA'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {movement.inventory_movement_types?.name === 'VENTA' || movement.inventory_movement_types?.name === 'AJUSTE_SALIDA' || movement.inventory_movement_types?.name === 'MERMA' ? '-' : '+'}
                      {movement.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {movement.previous_stock} → {movement.new_stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}