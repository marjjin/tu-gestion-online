import { useState, useEffect } from "react";
import { FetchVentas } from "./FetchVentas/FetchVentas";
import { ModalVenta } from "./ModalVenta/ModalVenta";
import { ModalCobrar } from "./ModalCobrar/ModalCobrar";
import { useDescuentoModal } from "./ModalDescuento/useDescuentoModal.jsx";
import { supabase } from "../../supabase";
import "./venta.css";

export function Ventas({ productos, email }) {
  const [userId, setUserId] = useState(null);
  const descuentoModal = useDescuentoModal();
  const [productosActualizados, setProductosActualizados] = useState(productos);
  // Estado global para el cliente seleccionado
  const [cliente, setCliente] = useState(null);

  const actualizarProductos = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return;
    const { data, error } = await supabase
      .from("productos")
      .select()
      .eq("user_id", user.id);
    if (!error && data) {
      setProductosActualizados(data);
    }
  };
  const [turnoAbierto, setTurnoAbierto] = useState(false);
  const [modalVentaAbierto, setModalVentaAbierto] = useState(false);
  const [modalCobrarAbierto, setModalCobrarAbierto] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [turnoId, setTurnoId] = useState(null);

  // Estados para productos seleccionados y total (lógica a implementar luego)
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const total = productosSeleccionados.reduce(
    (acc, prod) => acc + prod.precio_final * prod.cantidad,
    0
  );

  // Tipos de venta (puedes luego traerlos de la configuración)
  const tiposDeVenta = ["Efectivo", "Tarjeta", "Transferencia", "Cuenta DNI"];

  // Consultar turno abierto al cargar
  useEffect(() => {
    let cancel = false;
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancel && data?.user?.id) setUserId(data.user.id);
    };
    getUserId();
    const fetchTurno = async () => {
      const { data, error } = await supabase
        .from("turnos")
        .select("id")
        .eq("abierto", true)
        .order("fecha_apertura", { ascending: false })
        .limit(1)
        .single();
      if (data && data.id) {
        setTurnoAbierto(true);
        setTurnoId(data.id);
      } else {
        setTurnoAbierto(false);
        setTurnoId(null);
      }
    };
    fetchTurno();
    actualizarProductos(); // Cargar productos al montar el componente
    return () => {
      cancel = true;
    };
  }, []);

  // Abrir turno
  const handleAbrirTurno = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return;
    const { data, error } = await supabase
      .from("turnos")
      .insert({ user_id: user.id, abierto: true })
      .select()
      .single();
    if (data && data.id) {
      setTurnoAbierto(true);
      setTurnoId(data.id);
    }
  };

  // Cerrar turno
  const handleCerrarTurno = async () => {
    if (!turnoId) return;
    await supabase
      .from("turnos")
      .update({ abierto: false, fecha_cierre: new Date().toISOString() })
      .eq("id", turnoId);
    setTurnoAbierto(false);
    setTurnoId(null);
  };

  return (
    <div className="ventas-container">
      <div className="ventas-header">
        <h2>Ventas</h2>
        {!turnoAbierto ? (
          <button className="btn-abrir-turno" onClick={handleAbrirTurno}>
            Abrir turno
          </button>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="btn-abrir-turno"
              onClick={() => setModalVentaAbierto(true)}
            >
              Realizar venta
            </button>
            <button className="btn-cerrar-turno" onClick={handleCerrarTurno}>
              Cerrar turno
            </button>
          </div>
        )}
      </div>
      <div className="ventas-listado">
        <div className="ventas-lista-titulos">
          <span>Hora</span>
          <span>Cliente</span>
          <span>Total</span>
        </div>
        {userId ? (
          <FetchVentas turnoId={turnoId} userId={userId} />
        ) : (
          <div className="ventas-lista-cuerpo">Cargando ventas...</div>
        )}
      </div>
      <ModalVenta
        open={modalVentaAbierto}
        onClose={() => setModalVentaAbierto(false)}
        productos={productosActualizados}
        onAgregarProducto={(producto) => {
          setProductosSeleccionados((prev) => {
            // Limpiar cualquier cantidad previa del producto
            const { cantidad, ...productoSinCantidad } = producto;
            const cantidadASumar = typeof cantidad === "number" ? cantidad : 1;
            const idx = prev.findIndex((p) => p.id === producto.id);
            if (idx !== -1) {
              const copia = [...prev];
              copia[idx] = {
                ...productoSinCantidad,
                cantidad: prev[idx].cantidad + cantidadASumar,
              };
              return copia;
            }
            return [
              ...prev,
              { ...productoSinCantidad, cantidad: cantidadASumar },
            ];
          });
        }}
        productosSeleccionados={productosSeleccionados}
        onEliminarProducto={(id) => {
          setProductosSeleccionados((prev) => prev.filter((p) => p.id !== id));
        }}
        total={total}
        descuento={descuentoModal.descuento}
        onDescuento={descuentoModal.abrir}
        onCobrar={() => setModalCobrarAbierto(true)}
        // NUEVO: Estado y setter de cliente
        cliente={cliente}
        setCliente={setCliente}
      />
      {descuentoModal.render(total)}
      <ModalCobrar
        open={modalCobrarAbierto}
        tiposDeVenta={tiposDeVenta}
        onSelectTipo={(tipo) => {
          setTipoSeleccionado(tipo);
          // No cerrar el modal, solo seleccionar el tipo
        }}
        onClose={() => setModalCobrarAbierto(false)}
        onFinalizar={async () => {
          // Guardar la venta normalizada en Supabase
          const user =
            supabase.auth.getUser && (await supabase.auth.getUser()).data.user;
          // 1. Insertar la venta (sin productos)
          const venta = {
            total: total - (descuentoModal.descuento || 0),
            tipo_pago: tipoSeleccionado,
            user_id: user?.id,
            created_at: new Date().toISOString(),
            descuento: descuentoModal.descuento || 0,
            turno_id: turnoId,
            cliente_id: cliente?.id || null,
          };
          const { data: ventaInsertada, error: errorVenta } = await supabase
            .from("ventas")
            .insert([venta])
            .select()
            .single();
          if (errorVenta) {
            alert(
              "Error al guardar venta: " +
                (errorVenta?.message || JSON.stringify(errorVenta))
            );
            return;
          }
          // 2. Insertar los productos en detalle_ventas
          const detalles = productosSeleccionados.map((prod) => ({
            venta_id: ventaInsertada.id,
            producto_id: prod.id,
            cantidad: prod.cantidad,
            precio_unitario: prod.precio_final,
            subtotal: prod.precio_final * prod.cantidad,
            created_at: new Date().toISOString(),
          }));
          const { error: errorDetalles } = await supabase
            .from("detalle_ventas")
            .insert(detalles);
          if (errorDetalles) {
            alert(
              "Error al guardar detalles: " +
                (errorDetalles?.message || JSON.stringify(errorDetalles))
            );
            return;
          }
          setModalCobrarAbierto(false);
          setProductosSeleccionados([]);
          setTipoSeleccionado(null);
          setCliente(null);
          // Cerrar el modal de descuento si está abierto
          if (typeof descuentoModal.cerrar === "function") {
            descuentoModal.cerrar();
          }
          // Aquí podrías mostrar un mensaje de éxito
        }}
      />
    </div>
  );
}
