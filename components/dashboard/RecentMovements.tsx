import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface Movement {
  id: string
  product_name: string
  type: string
  quantity: number
  created_at: string
}

interface RecentMovementsProps {
  movements: Movement[]
}

export function RecentMovements({ movements }: RecentMovementsProps) {
  const getMovementIcon = (type: string) => {
    if (type === 'VENTA' || type === 'AJUSTE_SALIDA' || type === 'MERMA') {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />
    }
    if (type === 'COMPRA' || type === 'AJUSTE_ENTRADA' || type === 'DEVOLUCION') {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />
    }
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getMovementColor = (type: string) => {
    if (type === 'VENTA' || type === 'AJUSTE_SALIDA' || type === 'MERMA') {
      return 'text-red-600'
    }
    if (type === 'COMPRA' || type === 'AJUSTE_ENTRADA' || type === 'DEVOLUCION') {
      return 'text-green-600'
    }
    return 'text-gray-600'
  }

  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay movimientos registrados aún
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movements.map((movement) => (
            <div key={movement.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg">
                  {getMovementIcon(movement.type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{movement.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(movement.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${getMovementColor(movement.type)}`}>
                  {movement.type === 'VENTA' || movement.type === 'AJUSTE_SALIDA' || movement.type === 'MERMA' ? '-' : '+'}
                  {movement.quantity}
                </p>
                <p className="text-xs text-muted-foreground">{movement.type}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}