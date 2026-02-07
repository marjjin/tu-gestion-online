import React, { useState } from "react";
import { ModalDescuento } from "../ModalDescuento/ModalDescuento";

export function useDescuentoModal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [descuento, setDescuento] = useState(0);

  const abrir = () => setModalAbierto(true);
  const cerrar = () => setModalAbierto(false);
  const reset = () => setDescuento(0);
  const aplicar = (valor) => {
    setDescuento(valor);
    cerrar();
  };

  const render = (total) => (
    <ModalDescuento
      open={modalAbierto}
      total={total}
      onAplicar={aplicar}
      onClose={cerrar}
    />
  );

  return { descuento, abrir, cerrar, reset, render };
}
