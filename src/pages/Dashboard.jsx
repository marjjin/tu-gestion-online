import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Panel } from "../components/Panel";

export function Dashboard() {
  const [session, setSession] = useState(null);

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

  return <Panel email={session.user.email} />;
}
