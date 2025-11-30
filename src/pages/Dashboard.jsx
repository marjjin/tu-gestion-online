import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Panel } from "../components/panel";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

export function Dashboard() {
  const [session, setSession] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Verificar sesión al montar
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
      } else {
        setSession(data.session);
      }
    });

    // Listener de cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          window.location.href = "/login";
        }
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!session) return <p>Cargando...</p>;

  return (
    <Routes>
      <Route path="/" element={<Panel email={session.user.email} />} />
      <Route path="/productos" element={<Panel email={session.user.email} />} />
      <Route path="/ventas" element={<Panel email={session.user.email} />} />
      <Route path="/clientes" element={<Panel email={session.user.email} />} />
      <Route path="/reportes" element={<Panel email={session.user.email} />} />
      <Route
        path="/configuracion"
        element={<Panel email={session.user.email} />}
      />
      <Route path="*" element={<Navigate to="/dashboard/productos" />} />
    </Routes>
  );
}
