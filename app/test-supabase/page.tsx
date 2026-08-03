import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  
  // Probar conexión
  const { data, error } = await supabase.from('companies').select('count').limit(1)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test de Conexión Supabase</h1>
      <div className="space-y-4">
        <div>
          <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NO DEFINIDA'}
        </div>
        <div>
          <strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NO DEFINIDA'}
        </div>
        <div>
          <strong>Resultado:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2">
            {JSON.stringify({ data, error }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}