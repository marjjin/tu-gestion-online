import { useState } from "react";
import { supabase } from "../../supabase";
import "./cargaMasivaProducto.css";
import { descargarPlantillaExcel } from "./descargarPlantillaExcel";
import * as XLSX from "xlsx";

export function CargaMasivaProductos() {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Procesa archivo Excel o CSV: nombre,categoria,precio,stock
  const handleArchivo = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return;
    setSubiendo(true);
    setMensaje("");
    // Detectar si es Excel
    if (archivo.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const productosRaw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Quitar encabezado y mapear
        const productos = productosRaw.slice(1).map((row) => {
          const [nombre, categoria, precio, stock] = row;
          return {
            nombre: nombre?.toString().trim(),
            categoria: categoria?.toString().trim(),
            precio: Number(precio),
            stock: Number(stock),
          };
        });
        const { error } = await supabase.from("productos").insert(productos);
        if (error) {
          setMensaje("Error al subir productos: " + error.message);
        } else {
          setMensaje("Productos cargados correctamente");
        }
        setSubiendo(false);
      };
      reader.readAsArrayBuffer(archivo);
    } else {
      // CSV
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const texto = evt.target.result;
        const lineas = texto.split("\n").filter(Boolean);
        const productos = lineas.map((linea) => {
          const [nombre, categoria, precio, stock] = linea.split(",");
          return {
            nombre: nombre?.trim(),
            categoria: categoria?.trim(),
            precio: Number(precio),
            stock: Number(stock),
          };
        });
        // Inserta productos en Supabase
        const { error } = await supabase.from("productos").insert(productos);
        if (error) {
          setMensaje("Error al subir productos: " + error.message);
        } else {
          setMensaje("Productos cargados correctamente");
        }
        setSubiendo(false);
      };
      reader.readAsText(archivo);
    }
  };

  return (
    <>
      <button className="carga-masiva-btn" onClick={() => setShowModal(true)}>
        Carga masiva
      </button>
      {showModal && (
        <div
          className="carga-masiva-modal-bg"
          onClick={() => setShowModal(false)}
        >
          <div
            className="carga-masiva-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Carga masiva de productos</h3>
            <button
              className="carga-masiva-btn"
              style={{ background: "#43a047", marginBottom: "1rem" }}
              onClick={descargarPlantillaExcel}
            >
              Descargar plantilla Excel
            </button>
            <form onSubmit={handleSubmit}>
              <input type="file" accept=".xlsx,.csv" onChange={handleArchivo} />
              <button
                type="submit"
                className="carga-masiva-btn"
                disabled={subiendo || !archivo}
              >
                {subiendo ? "Subiendo..." : "Cargar productos"}
              </button>
            </form>
            {mensaje && (
              <p
                className={
                  mensaje.includes("Error")
                    ? "carga-masiva-error"
                    : "carga-masiva-mensaje"
                }
              >
                {mensaje}
              </p>
            )}
            <div className="carga-masiva-ejemplo">
              <small>Formato recomendado: Excel (.xlsx) o CSV</small>
              <br />
              <small>Columnas: nombre, categoria, precio, stock</small>
              <br />
              <small>
                Ejemplo Excel: <b>plantilla_productos.xlsx</b>
              </small>
            </div>
            <button
              className="carga-masiva-btn"
              style={{ background: "#d32f2f", marginTop: "1rem" }}
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
