import { useRef, useEffect, useState } from "react";
import { ModalCliente } from "../ModalCliente/ModalCliente";
import "./modalventa.css";
import { SearchVentas } from "../SearchVentas/SearchVentas";

export function ModalVenta({
  open,
  onClose,
  productos,
  onAgregarProducto,
  productosSeleccionados,
  onEliminarProducto,
  total,
  descuento,
  onDescuento,
  onCobrar,
  onFocusCliente, // Nuevo prop para F3
  cliente,
  setCliente,
}) {
  const searchRef = useRef(null);
  const descuentoBtnRef = useRef(null);
  const cobrarBtnRef = useRef(null);
  const modalRef = useRef(null);
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focusInput && searchRef.current.focusInput();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    const focusableEls = modal
      ? Array.from(modal.querySelectorAll(focusableSelectors))
      : [];
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    if (firstEl) firstEl.focus();

    const handleShortcuts = (e) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current &&
          searchRef.current.focusInput &&
          searchRef.current.focusInput();
      } else if (e.key === "F3") {
        e.preventDefault();
        setModalClienteAbierto(true);
      } else if (e.key === "F4") {
        e.preventDefault();
        onDescuento && onDescuento();
      } else if (e.key === "F5") {
        e.preventDefault();
        cobrarBtnRef.current && cobrarBtnRef.current.focus();
        cobrarBtnRef.current && cobrarBtnRef.current.click();
      } else if (e.key === "Tab") {
        if (!focusableEls.length) return;
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [open, onFocusCliente]);

  if (!open) return null;
  return (
    <div className="modalventa-overlay">
      <div className="modalventa-contenido" ref={modalRef}>
        <h3>Realizar venta</h3>
        <SearchVentas
          productos={productos}
          onSelect={onAgregarProducto}
          ref={searchRef}
        />
        <div className="modalventa-listado">
          <table className="modalventa-tabla">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Precio Venta</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productosSeleccionados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="modalventa-vacio">
                    No hay productos agregados.
                  </td>
                </tr>
              ) : (
                productosSeleccionados.map((prod) => (
                  <tr key={prod.id}>
                    <td>{prod.nombre}</td>
                    <td>${prod.precio_final}</td>
                    <td>{prod.cantidad}</td>
                    <td>${prod.precio_final * prod.cantidad}</td>
                    <td>
                      <button
                        onClick={() => onEliminarProducto(prod.id)}
                        className="modalventa-eliminar"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="modalventa-total">
          <span>Total:</span>
          <span>${(total - (descuento || 0)).toFixed(2)}</span>
        </div>
        <div
          className="modalventa-descuento"
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <button
            ref={descuentoBtnRef}
            className="modalventa-descuento-btn"
            onClick={onDescuento}
          >
            Aplicar descuento
          </button>
          <button
            className="modalventa-cliente-btn"
            onClick={() => setModalClienteAbierto(true)}
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              background: "#007bff",
              color: "#fff",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Cliente
          </button>
          {descuento > 0 ? (
            <span>Descuento aplicado: ${descuento.toFixed(2)}</span>
          ) : null}
          {cliente?.nombre && (
            <span
              style={{
                color: "#007bff",
                fontWeight: 500,
                marginLeft: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Cliente: {cliente.nombre}
              <button
                onClick={() => {
                  setCliente(null);
                  setModalClienteAbierto(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#e74c3c",
                  fontWeight: "bold",
                  fontSize: 18,
                  cursor: "pointer",
                  marginLeft: 2,
                  lineHeight: 1,
                }}
                title="Quitar cliente"
              >
                ×
              </button>
            </span>
          )}
        </div>
        <div
          className="modalventa-acciones"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#555",
            }}
          >
            F2: Buscar producto &nbsp;|&nbsp; F3: Cliente &nbsp;|&nbsp; F4:
            Descuento &nbsp;|&nbsp; F5: Cobrar
          </span>
          <button
            ref={cobrarBtnRef}
            className="modalventa-confirmar"
            onClick={onCobrar}
          >
            Cobrar
          </button>
          <button className="modalventa-cerrar" onClick={onClose}>
            Cancelar
          </button>
        </div>
        <ModalCliente
          open={modalClienteAbierto}
          cliente={cliente}
          onGuardar={(nuevoCliente) => {
            setCliente(nuevoCliente);
            setModalClienteAbierto(false);
          }}
          onClose={() => setModalClienteAbierto(false)}
        />
      </div>
    </div>
  );
}
