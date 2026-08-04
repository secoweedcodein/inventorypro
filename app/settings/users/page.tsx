import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus } from 'lucide-react'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  // ✅ SOLUCIÓN: Verificar que el perfil exista antes de usarlo
  if (!profile) {
    redirect('/login')
  }

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      active,
      created_at,
      user_roles(role_id, roles(name))
    `)
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuarios de la Empresa</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los accesos de tu equipo
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invitar Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipo ({users?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Teléfono</th>
                  <th className="text-left py-3 px-4 font-medium">Rol</th>
                  <th className="text-center py-3 px-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u: any) => {
                  const roleName = u.user_roles?.[0]?.roles?.name || 'SIN ROL'
                  return (
                    <tr key={u.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Desde {new Date(u.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm">{u.email}</td>
                      <td className="py-3 px-4 text-sm">{u.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={roleName === 'OWNER' ? 'default' : 'secondary'}>
                          {roleName}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={u.active ? 'secondary' : 'destructive'}>
                          {u.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}