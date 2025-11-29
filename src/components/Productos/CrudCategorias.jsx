import { useEffect, useState, useRef } from "react";
import { supabase } from "../../supabase";
import "./crudCategorias.css";

export function CrudCategorias({ onClose }) {
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [searchCat, setSearchCat] = useState("");
  const [debouncedSearchCat, setDebouncedSearchCat] = useState("");
  const debounceTimeout = useRef();
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);

  // Cargar categorías desde Supabase al abrir el modal
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

  // Editar categoría en Supabase
  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditValue(categorias[idx].nombre);
    setError("");
  };

  const handleAdd = async () => {
    if (!nuevaCategoria.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (categorias.some((cat) => cat.nombre === nuevaCategoria.trim())) {
      setError("La categoría ya existe");
      return;
    }
    setError("");
    setLoading(true);
    const { data, error: err } = await supabase
      .from("categorias")
      .insert([{ nombre: nuevaCategoria.trim(), user_id: userId }])
      .select();
    if (err) {
      setError(err.message || "Error al agregar");
      console.error("Supabase error:", err);
    } else setCategorias([...categorias, ...data]);
    setNuevaCategoria("");
    setLoading(false);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (
      categorias.some((cat) => cat.nombre === editValue.trim()) &&
      editValue.trim() !== categorias[editIdx].nombre
    ) {
      setError("La categoría ya existe");
      return;
    }
    setError("");
    setLoading(true);
    const id = categorias[editIdx].id;
    const { error: err } = await supabase
      .from("categorias")
      .update({ nombre: editValue.trim() })
      .eq("id", id);
    if (err) {
      setError(err.message || "Error al editar");
      console.error("Supabase error:", err);
    } else {
      const updated = [...categorias];
      updated[editIdx].nombre = editValue.trim();
      setCategorias(updated);
      setEditIdx(null);
      setEditValue("");
    }
    setLoading(false);
  };

  // Eliminar categoría en Supabase
  const handleDelete = async (idx) => {
    setError("");
    setLoading(true);
    const id = categorias[idx].id;
    const { error: err } = await supabase
      .from("categorias")
      .delete()
      .eq("id", id);
    if (err) {
      setError(err.message || "Error al eliminar");
      console.error("Supabase error:", err);
    } else setCategorias(categorias.filter((_, i) => i !== idx));
    setLoading(false);
  };

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchCat(searchCat);
    }, 400);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchCat]);

  // Filtrar categorías por búsqueda debounced
  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(debouncedSearchCat.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Categorías</h2>
        <div className="categorias-form">
          <input
            type="text"
            placeholder="Nueva categoría"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
          />
          <button className="btn-agregar" onClick={handleAdd}>
            Agregar
          </button>
        </div>
        <input
          type="text"
          className="categorias-search"
          placeholder="Buscar categoría..."
          value={searchCat}
          onChange={(e) => setSearchCat(e.target.value)}
          style={{
            marginBottom: "8px",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1.5px solid #dbeafe",
            fontSize: "1rem",
            width: "100%",
          }}
        />
        {error && <div className="error-msg">{error}</div>}
        <ul className="categorias-list-scroll categorias-list">
          {categoriasFiltradas.length === 0 ? (
            <li className="categorias-vacio">No hay categorías.</li>
          ) : (
            categoriasFiltradas.map((cat, idx) => (
              <li key={cat.id || idx} className="categoria-item">
                {editIdx === idx ? (
                  <div className="categoria-edit-row">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="input-edit"
                    />
                    <div className="edit-btn-group">
                      <button className="btn-guardar" onClick={handleSaveEdit}>
                        Guardar
                      </button>
                      <button
                        className="btn-cancelar"
                        onClick={() => setEditIdx(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span>{cat.nombre}</span>
                    <button
                      className="btn-editar"
                      onClick={() => handleEdit(idx)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => setConfirmDeleteIdx(idx)}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </li>
            ))
          )}
        </ul>

        {/* Modal de confirmación de borrado */}
        {confirmDeleteIdx !== null && (
          <div className="modal-confirm-overlay">
            <div className="modal-confirm-content">
              <h3>¿Eliminar categoría?</h3>
              <p>
                ¿Seguro que deseas eliminar "
                {categoriasFiltradas[confirmDeleteIdx]?.nombre || ""}"?
              </p>
              <div className="modal-confirm-actions">
                <button
                  className="btn-eliminar"
                  onClick={() => {
                    setConfirmDeleteIdx(null);
                    handleDelete(confirmDeleteIdx);
                  }}
                >
                  Sí, eliminar
                </button>
                <button
                  className="btn-cancelar"
                  onClick={() => setConfirmDeleteIdx(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-cancelar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
