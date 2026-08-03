import AppLayout from "@/components/layout/AppLayout";

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">
          Bienvenido a InventoryPro
        </h1>

        <p className="text-gray-500">
          Tu sistema profesional de gestión de inventario.
        </p>
      </div>
    </AppLayout>
  );
}