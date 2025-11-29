import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import "./modalEditarProducto.css";

export function ModalEditarProducto({ producto, onSave, onCancel }) {
  const [nombre, setNombre] = useState(producto?.nombre || "");
  const [precio, setPrecio] = useState(producto?.precio || "");
  const [precioFinal, setPrecioFinal] = useState(producto?.precio_final || "");
  const [porcentaje, setPorcentaje] = useState(
    producto?.porcentaje_ganancia || ""
  );
  const [stock, setStock] = useState(producto?.stock || "");
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id || "");
  const [categorias, setCategorias] = useState([]);
  const [loadingCat, setLoadingCat] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategorias = async () => {
      setLoadingCat(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("No se pudo obtener el usuario");
        setLoadingCat(false);
        return;
      }
      const { data, error } = await supabase
        .from("categorias")
        .select()
        .eq("user_id", user.id);
      if (error) {
        setError(error.message || "Error al cargar categorías");
      } else {
        setCategorias(data || []);
      }
      setLoadingCat(false);
    };
    fetchCategorias();
  }, []);

  // Sincroniza porcentaje y precio final
  const handlePrecioFinalChange = (value) => {
    setPrecioFinal(value);
    if (precio && value) {
      const p =
        ((parseFloat(value) - parseFloat(precio)) / parseFloat(precio)) * 100;
      setPorcentaje(p.toFixed(2));
    } else {
      setPorcentaje("");
    }
  };
  const handlePorcentajeChange = (value) => {
    setPorcentaje(value);
    if (precio && value) {
      const pf = parseFloat(precio) * (1 + parseFloat(value) / 100);
      setPrecioFinal(pf.toFixed(2));
    } else {
      setPrecioFinal("");
    }
  };

  return (
    <div className="modal-editar-overlay">
      <div className="modal-editar-content">
        <h2>Editar producto</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!nombre || !categoriaId || !precio || !precioFinal || !stock) {
              setError("Todos los campos son obligatorios");
              return;
            }
            setError("");
            // Actualizar en Supabase
            const { data, error: err } = await supabase
              .from("productos")
              .update({
                nombre,
                precio,
                precio_final: precioFinal,
                porcentaje_ganancia: porcentaje,
                stock,
                categoria_id: categoriaId,
              })
              .eq("id", producto.id)
              .select();
            if (err) {
              setError(err.message || "Error al guardar cambios");
              return;
            }
            onSave({
              ...producto,
              nombre,
              precio,
              precio_final: precioFinal,
              porcentaje_ganancia: porcentaje,
              stock,
              categoria_id: categoriaId,
            });
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
            Categoría:
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              disabled={loadingCat || categorias.length === 0}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Precio de costo:
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              min="0"
              step="0.01"
            />
          </label>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
            <label
              style={{ display: "flex", flexDirection: "column", flex: 1 }}
            >
              Precio final:
              <input
                type="number"
                value={precioFinal}
                onChange={(e) => handlePrecioFinalChange(e.target.value)}
                min="0"
                step="0.01"
                style={{ width: "100px" }}
              />
            </label>
            <label
              style={{ display: "flex", flexDirection: "column", flex: 1 }}
            >
              % Ganancia:
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <input
                  type="number"
                  value={porcentaje}
                  onChange={(e) => handlePorcentajeChange(e.target.value)}
                  min="0"
                  step="0.01"
                  style={{ width: "100px" }}
                />
                <span style={{ fontWeight: 500, color: "#2563eb" }}>%</span>
              </div>
            </label>
          </div>
          <label>
            Stock:
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
            />
          </label>
          {error && <div className="error-msg">{error}</div>}
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
