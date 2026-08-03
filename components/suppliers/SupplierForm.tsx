'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useActionState } from 'react'

interface SupplierFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>
  initialData?: {
    id?: string
    name: string
    contact_name?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    notes?: string | null
  }
  submitLabel: string
}

export function SupplierForm({ action, initialData, submitLabel }: SupplierFormProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null })

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{submitLabel}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {initialData?.id && (
            <input type="hidden" name="id" value={initialData.id} />
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={initialData?.name || ''}
              placeholder="Ej: Distribuidora ABC"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_name">Persona de contacto</Label>
            <Input
              id="contact_name"
              name="contact_name"
              defaultValue={initialData?.contact_name || ''}
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData?.email || ''}
                placeholder="contacto@proveedor.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={initialData?.phone || ''}
                placeholder="+52 55 1234 5678"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={initialData?.address || ''}
              placeholder="Dirección completa del proveedor"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={initialData?.notes || ''}
              placeholder="Notas adicionales sobre el proveedor"
              rows={3}
            />
          </div>
          {state?.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">{state.error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}