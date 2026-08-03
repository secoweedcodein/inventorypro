'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react'
import { updateProfile, type ActionState } from '@/app/actions/settings'

// 2. Definimos el estado inicial con el tipo correcto
const initialState: ActionState = { error: null, success: false }

export function ProfileForm({ initialData }: { initialData: any }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Nombre</Label>
          <Input id="first_name" name="first_name" required defaultValue={initialData.first_name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Apellido</Label>
          <Input id="last_name" name="last_name" required defaultValue={initialData.last_name} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required defaultValue={initialData.email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" defaultValue={initialData.phone} />
      </div>
      
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600 font-medium">✅ Perfil actualizado correctamente</p>}
      
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </form>
  )
}