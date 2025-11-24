import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import "./agregarProducto.css";
export function AgregarProducto({ onClose, onAdd }) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precio, setPrecio] = useState("");
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
    if (!nombre || !categoria || !precio || !stock) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (isNaN(precio) || isNaN(stock)) {
      setError("Precio y stock deben ser números");
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
    const { error: err } = await supabase.from("productos").insert([
      {
        nombre,
        categoria_id: categoriaObj.id,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        user_id: userId,
      },
    ]);
    if (err) {
      setError(err.message || "Error al guardar producto");
      return;
    }
    onAdd({
      nombre,
      categoria,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      categoria_id: categoriaObj.id,
    });
    onClose();
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
