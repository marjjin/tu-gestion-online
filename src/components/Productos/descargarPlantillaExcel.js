// Utilidad para generar y descargar un archivo Excel (.xlsx) en el navegador
import * as XLSX from "xlsx";

export function descargarPlantillaExcel() {
  // Datos de ejemplo para la plantilla
  const datos = [
    ["nombre", "categoria", "precio", "stock"],
    ["Coca Cola", "comida", 120, 50],
    ["Gomitas", "gomitas", 80, 100],
  ];
  // Crear hoja de cálculo
  const ws = XLSX.utils.aoa_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Productos");
  // Generar archivo y descargar
  XLSX.writeFile(wb, "plantilla_productos.xlsx");
}
