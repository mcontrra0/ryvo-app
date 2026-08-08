"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, Role } from "@/lib/auth";

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== role) {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [role, router]);

  // Evita el parpadeo de contenido ajeno mientras se comprueba la sesión
  if (!allowed) return null;
  return <>{children}</>;
}
