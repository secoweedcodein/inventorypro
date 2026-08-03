'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface SalesReportChartProps {
  data: { date: string; total: number; count: number }[]
}

export function SalesReportChart({ data }: SalesReportChartProps) {
  const formattedData = data.map(d => ({
    ...d,
    fecha: new Date(d.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="fecha" />
        <YAxis />
                <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          // Tipamos el Tooltip indicando que el valor es un número y el nombre un string
          formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Total']}
        />

        <Legend />
        <Bar dataKey="total" fill="hsl(var(--primary))" name="Ventas ($)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}