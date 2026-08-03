'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteProduct } from '@/app/actions/products'

export function DeleteProductButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) {
      await deleteProduct(id)
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}