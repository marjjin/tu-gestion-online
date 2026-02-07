import "./modaleliminarventas.css";

export function ModalEliminarVentas({
  open,
  cantidad,
  onCancel,
  onConfirm,
  deleting,
}) {
  if (!open) return null;

  return (
    <div className="modal-eliminar-ventas">
      <div className="modal-eliminar-contenido">
        <h3>Eliminar ventas</h3>
        <p>
          Vas a eliminar {cantidad} venta{cantidad === 1 ? "" : "s"}. Esta
          accion no se puede deshacer.
        </p>
        <div className="modal-eliminar-botones">
          <button className="btn-cancelar" onClick={onCancel} disabled={deleting}>
            Cancelar
          </button>
          <button
            className="btn-confirmar"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
