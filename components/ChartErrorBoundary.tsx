"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

// Si la gráfica falla al medir su tamaño en algún móvil concreto (es un
// problema conocido de recharts en el primer render), esto evita que se
// caiga TODO el dashboard — solo se rompe esta sección, con un mensaje
// en vez de una pantalla en blanco sin poder navegar.
export default class ChartErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Error al renderizar la gráfica:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
