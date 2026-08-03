import { createSupplier } from '@/app/actions/suppliers'
import { SupplierForm } from '@/components/suppliers/SupplierForm'

export default function NewSupplierPage() {
  return (
    <div className="p-8">
      <SupplierForm
        action={createSupplier}
        submitLabel="Crear Proveedor"
      />
    </div>
  )
}