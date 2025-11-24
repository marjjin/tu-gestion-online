import { useEffect, useState } from "react";

import { supabase } from "../../supabase";
import { AgregarProducto } from "./AgregarProducto";
import { CrudCategorias } from "./CrudCategorias";
import "./productos.css";

export function Productos() {
  const [showModal, setShowModal] = useState(false);
  const [showCategorias, setShowCategorias] = useState(false);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserAndData = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      const { data: productosData, error: prodError } = await supabase
        .from("productos")
        .select()
        .eq("user_id", user.id);
      const { data: categoriasData, error: catError } = await supabase
        .from("categorias")
        .select()
        .eq("user_id", user.id);
      if (!prodError) setProductos(productosData || []);
      if (!catError) setCategorias(categoriasData || []);
      setLoading(false);
    };
    fetchUserAndData();
  }, []);

  const handleAddProducto = (nuevoProducto) => {
    setProductos([...productos, nuevoProducto]);
  };

  // Helper para obtener el nombre de la categoría
  const getCategoriaNombre = (id) => {
    const cat = categorias.find((c) => c.id === id);
    return cat ? cat.nombre : id;
  };
  // ...existing code...

  return (
    <div className="productos-container">
      <h1 className="productos-title">Productos</h1>
      <div className="productos-actions">
        <button className="productos-btn" onClick={() => setShowModal(true)}>
          Agregar producto
        </button>
        <button
          className="productos-btn"
          onClick={() => setShowCategorias(true)}
        >
          Categorías
        </button>
        <button className="productos-btn">Editar producto</button>
        <button className="productos-btn">Eliminar producto</button>
        <button className="productos-btn">Ver detalles</button>
      </div>
      <div className="productos-list">
        {loading ? (
          <p>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p>Aquí se mostrarán los productos...</p>
        ) : (
          <div className="productos-cards">
            {productos.map((prod, idx) => (
              <div className="producto-card" key={prod.id || idx}>
                <div className="producto-header">
                  <span className="producto-nombre">{prod.nombre}</span>
                  <span className="producto-categoria">
                    {getCategoriaNombre(prod.categoria_id)}
                  </span>
                </div>
                <div className="producto-info">
                  <span className="producto-precio">${prod.precio}</span>
                  <span className="producto-stock">Stock: {prod.stock}</span>
                </div>
                <div className="producto-actions">
                  <button className="producto-btn editar">Editar</button>
                  <button className="producto-btn eliminar">Eliminar</button>
                  <button className="producto-btn detalles">Detalles</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && (
        <AgregarProducto
          onClose={() => setShowModal(false)}
          onAdd={handleAddProducto}
        />
      )}
      {showCategorias && (
        <CrudCategorias onClose={() => setShowCategorias(false)} />
      )}
    </div>
  );
}
