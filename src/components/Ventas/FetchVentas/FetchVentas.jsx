import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import "./fetchventas.css";

export function FetchVentas({ turnoId }) {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      let query = supabase
        .from("ventas")
        .select("id,total,created_at,cliente:cliente_id(nombre)");
      if (turnoId) {
        query = query.eq("turno_id", turnoId);
      }
      query = query.order("created_at", { ascending: false });
      const { data: ventasData, error } = await query;
      if (!error) setVentas(ventasData || []);
      setLoading(false);
    };
    fetchVentas();
  }, [turnoId]);

  if (loading)
    return <div className="ventas-lista-cuerpo">Cargando ventas...</div>;

  if (!ventas.length)
    return (
      <div className="ventas-lista-cuerpo">
        <p className="ventas-vacio">No hay ventas registradas hoy.</p>
      </div>
    );

  return (
    <div className="ventas-lista-cuerpo">
      {ventas.map((venta) => (
        <div className="venta-row" key={venta.id}>
          <span>
            {venta.created_at
              ? new Date(venta.created_at).toLocaleDateString()
              : "-"}
          </span>
          <span>
            {venta.created_at
              ? new Date(venta.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"}
          </span>
          <span>{venta.cliente?.nombre || "-"}</span>
          <span>${venta.total}</span>
        </div>
      ))}
    </div>
  );
}
