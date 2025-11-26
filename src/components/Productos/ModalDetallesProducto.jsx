import React from "react";
import "./modalDetallesProducto.css";

export function ModalDetallesProducto({ producto, onClose }) {
  return (
    <div className="modal-detalles-overlay">
      <div className="modal-detalles-content">
        <h2>Detalles del producto</h2>
        {producto ? (
          <div className="detalles-lista">
            <p>
              <b>Nombre:</b> {producto.nombre}
            </p>
            <p>
              <b>Precio:</b> ${producto.precio}
            </p>
            <p>
              <b>Stock:</b> {producto.stock}
            </p>
            <p>
              <b>Categoría:</b>{" "}
              {producto.categoria_nombre || producto.categoria_id}
            </p>
            {producto.detalles ? (
              <p>
                <b>Detalles:</b> {producto.detalles}
              </p>
            ) : (
              <p className="sin-detalles">No posee detalles</p>
            )}
          </div>
        ) : (
          <p className="sin-detalles">No posee detalles</p>
        )}
        <div className="modal-detalles-actions">
          <button className="btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
