'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useActionState } from 'react'

interface CategoryFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>
  initialData?: {
    id?: string
    name: string
    description: string | null
  }
  submitLabel: string
}

export function CategoryForm({ action, initialData, submitLabel }: CategoryFormProps) {
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
              placeholder="Ej: Electrónicos"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description || ''}
              placeholder="Descripción opcional de la categoría"
              rows={3}
            />
          </div>
          {state?.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">{state.error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}