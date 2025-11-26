import React from "react";
import "./modalEliminarProducto.css";

export function ModalEliminarProducto({ producto, onConfirm, onCancel }) {
  return (
    <div className="modal-eliminar-overlay">
      <div className="modal-eliminar-content">
        <h2>¿Eliminar producto?</h2>
        <p>
          ¿Estás seguro que deseas eliminar <b>{producto?.nombre}</b>?
        </p>
        <div className="modal-eliminar-actions">
          <button className="btn-eliminar" onClick={onConfirm}>
            Sí, eliminar
          </button>
          <button className="btn-cancelar" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
