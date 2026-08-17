import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Tags,
  TrendingUp,
  Truck,
  Warehouse,
} from "lucide-react";

const modules = [
  { title: "Productos", description: "Administra el catálogo y sus existencias.", href: "/products", icon: Package },
  { title: "Categorías", description: "Organiza los productos de tu empresa.", href: "/categories", icon: Tags },
  { title: "Proveedores", description: "Consulta y gestiona tus proveedores.", href: "/suppliers", icon: Truck },
  { title: "Inventario", description: "Revisa stock y registra movimientos.", href: "/inventory", icon: Warehouse },
  { title: "Compras", description: "Registra las compras de mercadería.", href: "/purchases", icon: ShoppingCart },
  { title: "Ventas", description: "Registra ventas y actualiza existencias.", href: "/sales", icon: TrendingUp },
  { title: "Reportes", description: "Analiza productos, movimientos y ventas.", href: "/reports", icon: BarChart3 },
];

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Menú principal</h1>
          <p className="mt-2 text-muted-foreground">Selecciona un módulo para administrar tu inventario.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href} className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary hover:bg-muted/50">
                <Icon className="mb-4 h-7 w-7 text-primary" />
                <h2 className="font-semibold group-hover:text-primary">{module.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
