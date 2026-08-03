import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'

export default async function SalesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: sales } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false })

  // Calcular estadísticas
  const totalSales = sales?.reduce((sum, s) => sum + Number(s.total || 0), 0) || 0
  const todaySales = sales?.filter(s => {
    const today = new Date().toDateString()
    return new Date(s.created_at).toDateString() === today
  }).reduce((sum, s) => sum + Number(s.total || 0), 0) || 0

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ventas</h1>
          <p className="text-muted-foreground mt-1">
            Historial de ventas y punto de venta
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/sales/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Venta
          </Link>
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ventas</p>
              <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ventas Hoy</p>
              <p className="text-2xl font-bold">${todaySales.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transacciones</p>
              <p className="text-2xl font-bold">{sales?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {!sales || sales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No hay ventas registradas</p>
              <Button asChild>
                <Link href="/sales/new">Registrar primera venta</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium">Referencia</th>
                    <th className="text-left py-3 px-4 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium">Pago</th>
                    <th className="text-center py-3 px-4 font-medium">Estado</th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">
                        {new Date(sale.created_at).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-medium">{sale.reference}</td>
                      <td className="py-3 px-4">{sale.customer_name || 'Cliente General'}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {sale.payment_method === 'CASH' ? 'Efectivo' :
                           sale.payment_method === 'CARD' ? 'Tarjeta' :
                           sale.payment_method === 'TRANSFER' ? 'Transferencia' :
                           sale.payment_method}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={sale.status === 'COMPLETED' ? 'secondary' : 'destructive'}>
                          {sale.status === 'COMPLETED' ? 'Completada' : sale.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">
                        ${Number(sale.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}