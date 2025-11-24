import { useEffect, useState } from "react";
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
        {error && <div className="error-msg">{error}</div>}
        <ul className="categorias-list">
          {categorias.length === 0 ? (
            <li className="categorias-vacio">No hay categorías.</li>
          ) : (
            categorias.map((cat, idx) => (
              <li key={cat.id || idx} className="categoria-item">
                {editIdx === idx ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="input-edit"
                    />
                    <button className="btn-guardar" onClick={handleSaveEdit}>
                      Guardar
                    </button>
                    <button
                      className="btn-cancelar"
                      onClick={() => setEditIdx(null)}
                    >
                      Cancelar
                    </button>
                  </>
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
                      onClick={() => handleDelete(idx)}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </li>
            ))
          )}
        </ul>
        <div className="modal-actions">
          <button className="btn-cancelar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
