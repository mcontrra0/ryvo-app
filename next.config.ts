import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acceder al servidor de desarrollo desde otros dispositivos
  // de tu misma red wifi (el móvil, por ejemplo) — sin esto, Next.js
  // bloquea por seguridad los recursos de desarrollo (hot-reload) que
  // no vienen de localhost, y la página deja de reaccionar a los clics.
  //
  // Si tu IP local cambia (revísala con `ipconfig` en PowerShell),
  // actualiza el valor aquí.
  allowedDevOrigins: ["192.168.1.34"],
};

export default nextConfig;
