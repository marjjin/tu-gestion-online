import React, { useState } from "react";
import "./modalEditarProducto.css";

export function ModalEditarProducto({ producto, onSave, onCancel }) {
  const [nombre, setNombre] = useState(producto?.nombre || "");
  const [precio, setPrecio] = useState(producto?.precio || "");
  const [stock, setStock] = useState(producto?.stock || "");

  return (
    <div className="modal-editar-overlay">
      <div className="modal-editar-content">
        <h2>Editar producto</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ ...producto, nombre, precio, stock });
          }}
          className="form-editar-producto"
        >
          <label>
            Nombre:
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>
          <label>
            Precio:
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              min="0"
              step="0.01"
            />
          </label>
          <label>
            Stock:
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
            />
          </label>
          <div className="modal-editar-actions">
            <button type="submit" className="btn-guardar">
              Guardar cambios
            </button>
            <button type="button" className="btn-cancelar" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
