import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import "./fetchventas.css";

export function FetchVentas({
  turnoId,
  userId,
  selectedIds = [],
  onToggleSelect,
  refreshKey = 0,
}) {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchVentas = async () => {
      setLoading(true);
      let query = supabase
        .from("ventas")
        .select("id,total,created_at,turno_id,cliente:cliente_id(nombre)");
      if (turnoId) {
        query = query.eq("turno_id", turnoId);
      } else {
        // Si no hay turno, filtrar solo ventas del día actual
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const inicioDia = hoy.toISOString();
        const finDia = new Date(
          hoy.getTime() + 24 * 60 * 60 * 1000 - 1,
        ).toISOString();
        query = query.gte("created_at", inicioDia).lte("created_at", finDia);
      }
      query = query.eq("user_id", userId);
      query = query.order("created_at", { ascending: false });
      const { data: ventasData, error } = await query;
      if (!error) setVentas(ventasData || []);
      setLoading(false);
    };
    fetchVentas();
  }, [turnoId, userId, refreshKey]);

  if (loading)
    return <div className="ventas-lista-cuerpo">Cargando ventas...</div>;

  if (!ventas.length)
    return (
      <div className="ventas-lista-cuerpo">
        <p className="ventas-vacio">No hay ventas registradas hoy.</p>
      </div>
    );

  // Agrupar ventas por turno_id
  const ventasPorTurno = ventas.reduce((acc, venta) => {
    const key = venta.turno_id || "sin_turno";
    if (!acc[key]) acc[key] = [];
    acc[key].push(venta);
    return acc;
  }, {});

  // Para mostrar el rango horario, necesitamos obtener la hora de la primera y última venta de cada turno
  const renderTurno = (turnoId, ventasTurno) => {
    if (!ventasTurno.length) return null;
    // Ordenar por fecha ascendente para rango
    const ordenadas = [...ventasTurno].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );
    const inicio = new Date(ordenadas[0].created_at);
    const fin = new Date(ordenadas[ordenadas.length - 1].created_at);
    const formatoHora = (d) =>
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return (
      <>
        <div
          style={{
            borderTop: "1px solid #e0e0e0",
            margin: "18px 0 8px 0",
            padding: "6px 0",
            color: "#888",
            fontSize: 14,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ flex: 1, borderBottom: "1px solid #e0e0e0" }}></span>
          <span style={{ whiteSpace: "nowrap" }}>
            Turno{" "}
            {turnoId !== "sin_turno"
              ? `de ${formatoHora(inicio)} a ${formatoHora(fin)}`
              : "(Sin turno)"}
          </span>
          <span style={{ flex: 1, borderBottom: "1px solid #e0e0e0" }}></span>
        </div>
        {ventasTurno.map((venta) => (
          <div className="venta-row" key={venta.id}>
            <span className="venta-col-seleccion">
              <input
                type="checkbox"
                className="venta-checkbox"
                checked={selectedIds.includes(venta.id)}
                onChange={() => onToggleSelect && onToggleSelect(venta.id)}
              />
            </span>
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
            <span>
              {venta.cliente?.nombre ? venta.cliente.nombre : "Sin cliente"}
            </span>
            <span>${venta.total}</span>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="ventas-lista-cuerpo">
      {Object.entries(ventasPorTurno).map(([turnoId, ventasTurno]) =>
        renderTurno(turnoId, ventasTurno),
      )}
    </div>
  );
}
