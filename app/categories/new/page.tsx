import { createCategory } from '@/app/actions/categories'
import { CategoryForm } from '@/components/categories/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div className="p-8">
      <CategoryForm
        action={createCategory}
        submitLabel="Crear Categoría"
      />
    </div>
  )
}