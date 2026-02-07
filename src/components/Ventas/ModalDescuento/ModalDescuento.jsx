import { useState, useRef, useEffect } from "react";
import "./modaldescuento.css";

export function ModalDescuento({ open, total, onAplicar, onClose }) {
  const [tipo, setTipo] = useState("monto"); // "monto" o "porcentaje"
  const [valor, setValor] = useState(0);
  const inputRef = useRef(null);

  // Calcular descuento antes del useEffect
  let descuento = 0;
  if (tipo === "monto") {
    descuento = Math.min(Number(valor), total);
  } else {
    descuento = Math.min((Number(valor) / 100) * total, total);
  }
  const totalConDescuento = Math.max(total - descuento, 0);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    if (!open) setValor(0);

    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose && onClose();
      } else if (e.key === "Enter") {
        if (descuento > 0) {
          e.preventDefault();
          onAplicar(descuento);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, descuento, onAplicar, onClose]);

  if (!open) return null;

  return (
    <div className="modaldescuento-overlay">
      <div className="modaldescuento-contenido">
        <h3>Aplicar descuento</h3>
        <div className="modaldescuento-total">
          <span>Total actual:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="modaldescuento-tipo">
          <label>
            <input
              type="radio"
              checked={tipo === "monto"}
              onChange={() => setTipo("monto")}
            />
            Monto ($)
          </label>
          <label>
            <input
              type="radio"
              checked={tipo === "porcentaje"}
              onChange={() => setTipo("porcentaje")}
            />
            Porcentaje (%)
          </label>
        </div>
        <input
          ref={inputRef}
          type="number"
          min="0"
          max={tipo === "monto" ? total : 100}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="modaldescuento-input"
          placeholder={tipo === "monto" ? "Monto $" : "%"}
        />
        <div className="modaldescuento-resultado">
          <span>Descuento: ${descuento.toFixed(2)}</span>
          <span>Total con descuento: ${totalConDescuento.toFixed(2)}</span>
        </div>
        <div className="modaldescuento-acciones">
          <button
            className="modaldescuento-aplicar"
            onClick={() => onAplicar(descuento)}
            disabled={descuento <= 0}
          >
            Aplicar
          </button>
          <button className="modaldescuento-cerrar" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
