'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react'
import { updateCompany, type ActionState } from '@/app/actions/settings'

const initialState: ActionState = { error: null, success: false }

export function CompanyForm({ initialData }: { initialData: { name: string } }) {
  const [state, formAction, isPending] = useActionState(updateCompany, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la Empresa</Label>
        <Input id="name" name="name" required defaultValue={initialData.name} />
      </div>
      
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600 font-medium">✅ Empresa actualizada correctamente</p>}
      
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </form>
  )
}