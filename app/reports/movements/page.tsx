import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'

export default async function MovementsReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: movements } = await supabase
    .from('inventory_movements')
    .select(`
      *,
      products(name, sku),
      inventory_movement_types(name, operation)
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  // Estadísticas
  const entradas = movements?.filter(m => m.inventory_movement_types?.operation === 'IN') || []
  const salidas = movements?.filter(m => m.inventory_movement_types?.operation === 'OUT') || []
  const totalEntradas = entradas.reduce((sum, m) => sum + Number(m.quantity || 0), 0)
  const totalSalidas = salidas.reduce((sum, m) => sum + Number(m.quantity || 0), 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Kardex de Movimientos</h1>
          <p className="text-muted-foreground mt-1">Últimos 500 movimientos</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Movimientos</p>
          <p className="text-2xl font-bold">{movements?.length || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Entradas</p>
          <p className="text-2xl font-bold text-green-600">+{totalEntradas}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Salidas</p>
          <p className="text-2xl font-bold text-red-600">-{totalSalidas}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial Detallado</CardTitle>
        </CardHeader>
        <CardContent>
          {!movements || movements.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No hay movimientos registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium">Producto</th>
                    <th className="text-left py-3 px-4 font-medium">Tipo</th>
                    <th className="text-center py-3 px-4 font-medium">Cantidad</th>
                    <th className="text-center py-3 px-4 font-medium">Stock Ant.</th>
                    <th className="text-center py-3 px-4 font-medium">Stock Nuevo</th>
                    <th className="text-left py-3 px-4 font-medium">Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement: any) => {
                    const typeName = movement.inventory_movement_types?.name || '-'
                    const isOut = movement.inventory_movement_types?.operation === 'OUT'
                    return (
                      <tr key={movement.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm whitespace-nowrap">
                          {new Date(movement.created_at).toLocaleString('es-ES')}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{movement.products?.name}</p>
                          <p className="text-xs text-muted-foreground">{movement.products?.sku}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={isOut ? 'destructive' : 'secondary'}>
                            {typeName}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          <span className={isOut ? 'text-red-600' : 'text-green-600'}>
                            {isOut ? '-' : '+'}{movement.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground">
                          {movement.previous_stock}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {movement.new_stock}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                          {movement.reference || '-'}
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