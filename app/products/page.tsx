import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Package, AlertTriangle } from 'lucide-react'
import { DeleteProductButton } from '@/components/products/DeleteProductButton'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('*, brands(name), suppliers(name)')
    .eq('active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu catálogo de productos</p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo ({products?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!products || products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No hay productos registrados</p>
              <Button asChild>
                <Link href="/products/new">Crear primer producto</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Producto</th>
                    <th className="text-left py-3 px-4 font-medium">SKU</th>
                    <th className="text-left py-3 px-4 font-medium">Marca</th>
                    <th className="text-right py-3 px-4 font-medium">Costo</th>
                    <th className="text-right py-3 px-4 font-medium">Precio</th>
                    <th className="text-center py-3 px-4 font-medium">Stock</th>
                    <th className="text-right py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isLowStock = product.stock <= product.min_stock
                    return (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                              {product.image_url ? (
                                <Image src={product.image_url} alt={product.name} fill className="object-cover" unoptimized />
                              ) : (
                                <Package className="h-5 w-5 m-auto text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.suppliers?.name && (
                                <p className="text-xs text-muted-foreground">{product.suppliers.name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{product.sku}</td>
                        <td className="py-3 px-4 text-sm">{product.brands?.name || '-'}</td>
                        <td className="py-3 px-4 text-right">${Number(product.cost || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-medium">${Number(product.price || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          {isLowStock ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {product.stock}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{product.stock}</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DeleteProductButton id={product.id} />
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