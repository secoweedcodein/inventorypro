'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteCategory } from '@/app/actions/categories'

export function DeleteCategoryButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      await deleteCategory(id)
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}