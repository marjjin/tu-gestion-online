import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import "./agregarproducto.css";
export function AgregarProducto({ onClose, onAdd }) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precioCosto, setPrecioCosto] = useState(""); // Usado para el input, pero se guarda en 'precio'
  const [precioFinal, setPrecioFinal] = useState("");
  const [porcentaje, setPorcentaje] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserAndCategorias = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("No se pudo obtener el usuario");
        setLoading(false);
        return;
      }
      setUserId(user.id);
      const { data, error } = await supabase
        .from("categorias")
        .select()
        .eq("user_id", user.id);
      if (error) {
        setError(error.message || "Error al cargar categorías");
        console.error("Supabase error:", error);
      } else {
        setCategorias(data || []);
      }
      setLoading(false);
    };
    fetchUserAndCategorias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !categoria || !precioCosto || !precioFinal || !stock) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (isNaN(precioCosto) || isNaN(precioFinal) || isNaN(stock)) {
      setError("Precios y stock deben ser números");
      return;
    }
    setError("");
    // Buscar la categoría seleccionada por nombre
    const categoriaObj = categorias.find((cat) => cat.nombre === categoria);
    if (!categoriaObj) {
      setError("Categoría inválida");
      return;
    }
    // Guardar en Supabase
    const { data, error: err } = await supabase
      .from("productos")
      .insert([
        {
          nombre,
          categoria_id: categoriaObj.id,
          precio: parseFloat(precioCosto), // Guardar como 'precio'
          precio_final: parseFloat(precioFinal),
          porcentaje_ganancia: parseFloat(porcentaje),
          stock: parseInt(stock),
          user_id: userId,
        },
      ])
      .select();
    if (err || !data || !data.length) {
      setError((err && err.message) || "Error al guardar producto");
      return;
    }
    onAdd(data[0]);
    onClose();
  };

  // Sincroniza porcentaje y precio final
  const handlePrecioFinalChange = (value) => {
    setPrecioFinal(value);
    if (precioCosto && value) {
      const p =
        ((parseFloat(value) - parseFloat(precioCosto)) /
          parseFloat(precioCosto)) *
        100;
      setPorcentaje(p.toFixed(2));
    } else {
      setPorcentaje("");
    }
  };
  const handlePorcentajeChange = (value) => {
    setPorcentaje(value);
    if (precioCosto && value) {
      const pf = parseFloat(precioCosto) * (1 + parseFloat(value) / 100);
      setPrecioFinal(pf.toFixed(2));
    } else {
      setPrecioFinal("");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agregar producto</h2>
        <form onSubmit={handleSubmit} className="form-agregar-producto">
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
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={loading || categorias.length === 0}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Precio de costo:
            <input
              type="number"
              value={precioCosto}
              onChange={(e) => setPrecioCosto(e.target.value)}
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
          <div className="modal-actions">
            <button type="submit" className="btn-agregar">
              Agregar
            </button>
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
