import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/dashboard/StatCard'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { TopProducts } from '@/components/dashboard/TopProducts'
import { RecentMovements } from '@/components/dashboard/RecentMovements'
import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil y empresa
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(name)')
    .eq('id', user.id)
    .single()

  // Obtener total de productos
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  // Obtener productos con stock bajo
  const { data: lowStockProducts } = await supabase
    .from('inventory')
    .select(`
      quantity,
      products!inner (
        name,
        stock_min
      )
    `)
    .lte('quantity', 10)
    .limit(10)

  // Obtener valor total del inventario
  const { data: inventoryData } = await supabase
    .from('inventory')
    .select(`
      quantity,
      products!inner (
        price_cost
      )
    `)

  const inventoryValue = inventoryData?.reduce((acc, item: any) => {
    return acc + (item.quantity * item.products.price_cost)
  }, 0) || 0

  // Obtener movimientos recientes
  const { data: recentMovements } = await supabase
    .from('inventory_movements')
    .select(`
      id,
      quantity,
      type,
      created_at,
      products!inner (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Obtener datos de ventas últimos 7 días
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const { data: salesMovements } = await supabase
    .from('inventory_movements')
    .select(`
      quantity,
      created_at,
      products!inner (
        price_sale
      )
    `)
    .eq('type', 'VENTA')
    .gte('created_at', last7Days[0])

  const salesByDay = last7Days.map(date => {
    const daySales = salesMovements?.filter(m => 
      m.created_at.startsWith(date)
    ) || []
    
    const total = daySales.reduce((acc, m: any) => {
      return acc + (m.quantity * m.products.price_sale)
    }, 0)

    return {
      date: new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      ventas: total
    }
  })

  // Obtener productos más vendidos
  const { data: topProductsData } = await supabase
    .from('inventory_movements')
    .select(`
      quantity,
      products!inner (
        name,
        price_sale
      )
    `)
    .eq('type', 'VENTA')
    .order('quantity', { ascending: false })
    .limit(5)

  const topProducts = topProductsData?.reduce((acc: any[], m: any) => {
    const existing = acc.find(p => p.name === m.products.name)
    if (existing) {
      existing.quantity += m.quantity
      existing.revenue += m.quantity * m.products.price_sale
    } else {
      acc.push({
        name: m.products.name,
        quantity: m.quantity,
        revenue: m.quantity * m.products.price_sale
      })
    }
    return acc
  }, []) || []

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
         Bienvenido, {`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user.email} - {profile?.companies?.name}
        </p>
      </div>

      {/* Tarjetas Estadísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Productos"
          value={totalProducts || 0}
          icon={Package}
          description="Productos registrados"
        />
        <StatCard
          title="Stock Bajo"
          value={lowStockProducts?.length || 0}
          icon={AlertTriangle}
          description="Productos con stock crítico"
        />
        <StatCard
          title="Valor Inventario"
          value={`$${inventoryValue.toFixed(2)}`}
          icon={DollarSign}
          description="Valor total al costo"
        />
        <StatCard
          title="Ventas Hoy"
          value={`$${salesByDay[salesByDay.length - 1]?.ventas.toFixed(2) || '0.00'}`}
          icon={TrendingUp}
          description="Ingresos del día"
        />
      </div>

      {/* Gráficos y Listas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart data={salesByDay} />
        <TopProducts products={topProducts} />
      </div>

      {/* Movimientos Recientes */}
      <RecentMovements 
        movements={recentMovements?.map((m: any) => ({
          id: m.id,
          product_name: m.products.name,
          type: m.type,
          quantity: m.quantity,
          created_at: m.created_at
        })) || []} 
      />
    </div>
  )
}