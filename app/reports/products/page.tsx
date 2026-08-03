import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, TrendingUp } from 'lucide-react'

export default async function ProductsReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: saleItems } = await supabase
    .from('sale_items')
    .select(`
      product_id,
      quantity,
      unit_price,
      total,
      products(name, sku, price)
    `)

  // Agrupar por producto
  const productsMap = new Map<string, any>()
  
  saleItems?.forEach((item: any) => {
    const key = item.product_id
    if (!productsMap.has(key)) {
      productsMap.set(key, {
        product_id: key,
        name: item.products?.name || 'N/A',
        sku: item.products?.sku || '-',
        total_quantity: 0,
        total_revenue: 0,
        avg_price: 0,
        transactions: 0
      })
    }
    const product = productsMap.get(key)
    product.total_quantity += Number(item.quantity)
    product.total_revenue += Number(item.total)
    product.transactions += 1
    product.avg_price = product.total_revenue / product.total_quantity
  })

  const topProducts = Array.from(productsMap.values())
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 20)

  const totalRevenue = topProducts.reduce((sum, p) => sum + p.total_revenue, 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Productos Más Vendidos</h1>
          <p className="text-muted-foreground mt-1">Top 20 por ingresos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay ventas registradas aún</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">#</th>
                    <th className="text-left py-3 px-4 font-medium">Producto</th>
                    <th className="text-left py-3 px-4 font-medium">SKU</th>
                    <th className="text-center py-3 px-4 font-medium">Cantidad</th>
                    <th className="text-center py-3 px-4 font-medium">Transacciones</th>
                    <th className="text-right py-3 px-4 font-medium">Precio Prom.</th>
                    <th className="text-right py-3 px-4 font-medium">Ingresos</th>
                    <th className="text-right py-3 px-4 font-medium">% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => {
                    const percentage = totalRevenue > 0 ? (product.total_revenue / totalRevenue) * 100 : 0
                    return (
                      <tr key={product.product_id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-bold text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4 font-mono text-xs">{product.sku}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            {product.total_quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">{product.transactions}</td>
                        <td className="py-3 px-4 text-right">${product.avg_price.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-bold text-green-600">
                          ${product.total_revenue.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs">{percentage.toFixed(1)}%</span>
                          </div>
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
    </div>
  )
}