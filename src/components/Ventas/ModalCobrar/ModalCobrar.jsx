import { useEffect, useRef, useState } from "react";
import "./modalcobrar.css";

export function ModalCobrar({
  open,
  tiposDeVenta,
  onSelectTipo,
  onClose,
  onFinalizar,
}) {
  const modalRef = useRef(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Manejar atajos en el modal de confirmación
  useEffect(() => {
    if (!showConfirm) return;
    const handleConfirmShortcuts = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setShowConfirm(false);
        onFinalizar && onFinalizar();
      } else if (e.key === "0") {
        e.preventDefault();
        setShowConfirm(false);
      }
    };
    window.addEventListener("keydown", handleConfirmShortcuts);
    return () => window.removeEventListener("keydown", handleConfirmShortcuts);
  }, [showConfirm, onFinalizar]);

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
      if (e.key >= "1" && e.key <= String(tiposDeVenta.length)) {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        if (tiposDeVenta[idx]) {
          setTipoSeleccionado(tiposDeVenta[idx]);
          onSelectTipo && onSelectTipo(tiposDeVenta[idx]);
        }
      } else if (e.key === "0") {
        e.preventDefault();
        onClose && onClose();
      } else if (e.key === "Enter") {
        if (tipoSeleccionado) {
          e.preventDefault();
          setShowConfirm(true);
        }
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
  }, [open, tiposDeVenta, onSelectTipo, onClose, tipoSeleccionado]);

  if (!open) return null;
  return (
    <div className="modalcobrar-overlay">
      <div className="modalcobrar-contenido" ref={modalRef}>
        <h3>Seleccionar tipo de pago</h3>
        <div className="modalcobrar-tipos">
          {tiposDeVenta.map((tipo, idx) => (
            <button
              key={tipo}
              className={`modalcobrar-tipo-btn${
                tipoSeleccionado === tipo ? " selected" : ""
              }`}
              onClick={() => {
                setTipoSeleccionado(tipo);
                onSelectTipo && onSelectTipo(tipo);
              }}
              style={
                tipoSeleccionado === tipo
                  ? {
                      boxShadow: "0 0 0 3px #28a745",
                      border: "2px solid #28a745",
                    }
                  : {}
              }
            >
              {`${idx + 1}. ${tipo}`}
            </button>
          ))}
        </div>
        <button className="modalcobrar-cerrar" onClick={onClose}>
          0. Cancelar
        </button>
        <button
          className="modalcobrar-finalizar"
          style={{
            background: tipoSeleccionado ? "#28a745" : "#aaa",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 32px",
            fontSize: "1.1rem",
            marginTop: 18,
            cursor: tipoSeleccionado ? "pointer" : "not-allowed",
            width: "100%",
            opacity: tipoSeleccionado ? 1 : 0.7,
          }}
          disabled={!tipoSeleccionado}
          onClick={() => tipoSeleccionado && setShowConfirm(true)}
        >
          Finalizar venta
        </button>
        <div style={{ marginTop: 8, fontSize: 13, color: "#555" }}>
          Atajos: 1-4 para tipo de pago, 0 para cancelar, Enter para finalizar
        </div>
      </div>
      {showConfirm && (
        <div className="modalcobrar-overlay">
          <div className="modalcobrar-contenido" style={{ minWidth: 320 }}>
            <h3>¿Deseas finalizar la venta?</h3>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                marginTop: 24,
              }}
            >
              <button
                style={{
                  background: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 24px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowConfirm(false);
                  onFinalizar && onFinalizar();
                }}
              >
                Sí, finalizar
              </button>
              <button
                style={{
                  background: "#888",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 24px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
