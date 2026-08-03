import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'

export default async function InventoryHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener todos los movimientos con sus relaciones
  const { data: movements } = await supabase
    .from('inventory_movements')
    .select(`
      id,
      quantity,
      previous_stock,
      new_stock,
      reference,
      notes,
      created_at,
      products (
        name,
        sku
      ),
      inventory_movement_types (
        name
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Historial de Movimientos</h1>
          <p className="text-muted-foreground mt-1">
            Registro completo de todas las entradas y salidas de inventario
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos ({movements?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!movements || movements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay movimientos registrados aún</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium">Producto</th>
                    <th className="text-left py-3 px-4 font-medium">Tipo</th>
                    <th className="text-center py-3 px-4 font-medium">Cantidad</th>
                    <th className="text-center py-3 px-4 font-medium">Stock Anterior</th>
                    <th className="text-center py-3 px-4 font-medium">Stock Nuevo</th>
                    <th className="text-left py-3 px-4 font-medium">Referencia / Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement: any) => {
                    const typeName = movement.inventory_movement_types?.name || 'DESCONOCIDO'
                    const isSalida = typeName === 'VENTA' || typeName === 'AJUSTE_SALIDA' || typeName === 'MERMA'
                    
                    return (
                      <tr key={movement.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm whitespace-nowrap">
                          {new Date(movement.created_at).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{movement.products?.name || 'Producto eliminado'}</p>
                            <p className="text-xs text-muted-foreground">{movement.products?.sku || '-'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={isSalida ? 'destructive' : 'secondary'}>
                            {typeName}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          <span className={isSalida ? 'text-red-600' : 'text-green-600'}>
                            {isSalida ? '-' : '+'}{movement.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground">
                          {movement.previous_stock}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {movement.new_stock}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                          {movement.reference && <span className="font-medium text-foreground">{movement.reference}</span>}
                          {movement.reference && movement.notes && <span className="mx-1">•</span>}
                          {movement.notes}
                          {!movement.reference && !movement.notes && '-'}
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