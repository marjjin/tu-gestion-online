import { useState } from "react";
import "./menuAccionesProducto.css";

export function MenuAccionesProducto({
  producto,
  onEditar,
  onEliminar,
  onDetalles,
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="menu-acciones-producto">
      <button
        className="menu-puntos-btn"
        onClick={() => setOpen((v) => !v)}
        title="Acciones"
      >
        {/* Icono de tres puntos verticales */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="6" r="2" fill="#2563eb" />
          <circle cx="12" cy="12" r="2" fill="#2563eb" />
          <circle cx="12" cy="18" r="2" fill="#2563eb" />
        </svg>
      </button>
      {open && (
        <div className="menu-acciones-lista">
          <button
            className="producto-btn editar"
            onClick={() => {
              setOpen(false);
              onEditar(producto);
            }}
          >
            Editar
          </button>
          <button
            className="producto-btn eliminar"
            onClick={() => {
              setOpen(false);
              onEliminar(producto);
            }}
          >
            Eliminar
          </button>
          <button
            className="producto-btn detalles"
            onClick={() => {
              setOpen(false);
              onDetalles(producto);
            }}
          >
            Detalles
          </button>
        </div>
      )}
    </div>
  );
}
