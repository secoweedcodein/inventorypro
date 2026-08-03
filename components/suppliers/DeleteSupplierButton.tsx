'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteSupplier } from '@/app/actions/suppliers'

export function DeleteSupplierButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (confirm('¿Eliminar este proveedor?')) {
      await deleteSupplier(id)
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}