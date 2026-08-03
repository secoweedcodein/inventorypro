import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ShoppingCart } from 'lucide-react'

export default async function PurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: purchases } = await supabase
    .from('purchases')
    .select(`
      *,
      suppliers(name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compras</h1>
          <p className="text-muted-foreground mt-1">
            Historial de órdenes de compra
          </p>
        </div>
        <Button asChild>
          <Link href="/purchases/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Compra
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Compra ({purchases?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!purchases || purchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No hay compras registradas</p>
              <Button asChild>
                <Link href="/purchases/new">Registrar primera compra</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium">Referencia</th>
                    <th className="text-left py-3 px-4 font-medium">Proveedor</th>
                    <th className="text-center py-3 px-4 font-medium">Estado</th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">
                        {new Date(purchase.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4 font-medium">{purchase.reference}</td>
                      <td className="py-3 px-4">{purchase.suppliers?.name || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={purchase.status === 'COMPLETED' ? 'secondary' : 'outline'}>
                          {purchase.status === 'COMPLETED' ? 'Completada' : purchase.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        ${Number(purchase.total || 0).toFixed(2)}
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