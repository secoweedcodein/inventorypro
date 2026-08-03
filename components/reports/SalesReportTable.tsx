interface Sale {
  id: string
  created_at: string
  reference: string
  customer_name: string
  payment_method: string
  total: number
}

export function SalesReportTable({ sales }: { sales: Sale[] }) {
  if (sales.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">No hay ventas en este período</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3 font-medium">Fecha</th>
            <th className="text-left py-2 px-3 font-medium">Referencia</th>
            <th className="text-left py-2 px-3 font-medium">Cliente</th>
            <th className="text-left py-2 px-3 font-medium">Pago</th>
            <th className="text-right py-2 px-3 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-b hover:bg-muted/50">
              <td className="py-2 px-3 text-sm">
                {new Date(sale.created_at).toLocaleString('es-ES')}
              </td>
              <td className="py-2 px-3 font-medium">{sale.reference}</td>
              <td className="py-2 px-3">{sale.customer_name || 'General'}</td>
              <td className="py-2 px-3">{sale.payment_method}</td>
              <td className="py-2 px-3 text-right font-semibold text-green-600">
                ${Number(sale.total || 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}