import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download } from 'lucide-react'
import { SalesReportChart } from '@/components/reports/SalesReportChart'
import { SalesReportTable } from '@/components/reports/SalesReportTable'

export default async function SalesReportPage({
  searchParams
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const fromDate = params.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const toDate = params.to || new Date().toISOString().split('T')[0]

  const { data: sales } = await supabase
    .from('sales')
    .select('*')
    .gte('created_at', fromDate)
    .lte('created_at', `${toDate}T23:59:59`)
    .order('created_at', { ascending: true })

  const { data: saleItems } = await supabase
    .from('sale_items')
    .select(`
      *,
      sales!inner(created_at)
    `)
    .gte('sales.created_at', fromDate)
    .lte('sales.created_at', `${toDate}T23:59:59`)

  // Agrupar ventas por día
    // 1. Definimos la estructura exacta que requiere el gráfico
  interface DailySale {
    date: string;
    total: number;
    count: number;
  }

  // 2. Tipamos correctamente el acumulador del reduce usando Record
  const salesByDay = sales?.reduce<Record<string, DailySale>>((acc, sale) => {
    const day = new Date(sale.created_at).toISOString().split('T')[0]
    if (!acc[day]) {
      acc[day] = { date: day, total: 0, count: 0 }
    }
    acc[day].total += Number(sale.total || 0)
    acc[day].count += 1
    return acc
  }, {}) || {}

  // Ahora TypeScript sabrá exactamente que chartData es un arreglo de DailySale[]
  const chartData = Object.values(salesByDay).sort((a, b) => a.date.localeCompare(b.date))


  const totalSales = sales?.reduce((sum, s) => sum + Number(s.total || 0), 0) || 0
  const avgTicket = sales && sales.length > 0 ? totalSales / sales.length : 0

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Reporte de Ventas</h1>
          <p className="text-muted-foreground mt-1">
            {fromDate} al {toDate}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label>Desde</Label>
              <Input type="date" name="from" defaultValue={fromDate} />
            </div>
            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input type="date" name="to" defaultValue={toDate} />
            </div>
            <Button type="submit">Aplicar Filtros</Button>
          </form>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Vendido</p>
          <p className="text-3xl font-bold text-green-600">${totalSales.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Transacciones</p>
          <p className="text-3xl font-bold">{sales?.length || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Ticket Promedio</p>
          <p className="text-3xl font-bold">${avgTicket.toFixed(2)}</p>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Diarias</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesReportChart data={chartData} />
        </CardContent>
      </Card>

      {/* Tabla detallada */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detalle de Ventas</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/reports/sales?from=${fromDate}&to=${toDate}`} target="_blank">
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SalesReportTable sales={sales || []} />
        </CardContent>
      </Card>
    </div>
  )
}