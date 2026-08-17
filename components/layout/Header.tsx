import { Bell } from "lucide-react";
import { UserMenu } from './UserMenu'
export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <h2 className="text-xl font-semibold">
        InventoryPro
      </h2>

      <div className="flex items-center gap-5">
        <Bell className="cursor-pointer" />
<div className="flex items-center gap-4">
   {/* Tus notificaciones o búsqueda */}
   <UserMenu email="usuario@ejemplo.com" /> {/* En el paso 2 pasaremos el email real del servidor */}
</div>
        <div className="font-medium">
          Rodrigo
        </div>
      </div>
    </header>
  );
}
