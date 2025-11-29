import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../../supabase";
import { AgregarProducto } from "./AgregarProducto";
import { CrudCategorias } from "./CrudCategorias";
import { MenuAccionesProducto } from "./MenuAccionesProdcuto";
import { ModalEliminarProducto } from "./ModalEliminarProducto";
import { ModalEditarProducto } from "./ModalEditarProducto";
import { ModalDetallesProducto } from "./ModalDetallesProducto";
import { ButtonFilter } from "./ButtonFilter";
import "./productos.css";

export function Productos() {
  const [showModal, setShowModal] = useState(false);
  const [showCategorias, setShowCategorias] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productosFiltradosPorFiltro, setProductosFiltradosPorFiltro] =
    useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef();
  const [categorias, setCategorias] = useState([]);

  // Estados para los modales CRUD
  const [modalEliminar, setModalEliminar] = useState({
    open: false,
    producto: null,
  });
  const [modalEditar, setModalEditar] = useState({
    open: false,
    producto: null,
  });
  const [modalDetalles, setModalDetalles] = useState({
    open: false,
    producto: null,
  });

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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const { data: categoriasData, error: catError } = await supabase
        .from("categorias")
        .select()
        .eq("user_id", user.id);
      if (!prodError) {
        setProductos(productosData || []);
        setProductosFiltradosPorFiltro(productosData || []);
        setProductosFiltrados(productosData || []);
      }
      if (!catError) setCategorias(categoriasData || []);
      setLoading(false);
    };
    fetchUserAndData();
  }, []);

  const handleAddProducto = async (nuevoProducto) => {
    // Guardar en Supabase
    const { data, error } = await supabase
      .from("productos")
      .insert([{ ...nuevoProducto, user_id: userId }])
      .select();
    if (!error && data && data.length > 0) {
      // Actualiza el estado sin refrescar
      setProductos((prev) => [data[0], ...prev]);
      setProductosFiltrados((prev) => [data[0], ...prev]);
    }
  };

  // Helper para obtener el nombre de la categoría
  const getCategoriaNombre = useCallback(
    (id) => {
      const cat = categorias.find((c) => c.id === id);
      return cat ? cat.nombre : id;
    },
    [categorias]
  );

  // Buscador con debounce sobre productos filtrados por filtro
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!busqueda.trim()) {
        setProductosFiltrados(productosFiltradosPorFiltro);
        return;
      }
      const filtro = busqueda.trim().toLowerCase();
      setProductosFiltrados(
        productosFiltradosPorFiltro.filter(
          (prod) =>
            prod.nombre?.toLowerCase().includes(filtro) ||
            getCategoriaNombre(prod.categoria_id)
              ?.toLowerCase()
              .includes(filtro) ||
            String(prod.precio).includes(filtro)
        )
      );
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [busqueda, productosFiltradosPorFiltro, getCategoriaNombre]);

  return (
    <div className="productos-container">
      <div className="productos-header-flex">
        <h1 className="productos-title-left">Productos</h1>
        <div className="productos-actions-title-row">
          <button
            className="productos-btn productos-btn-small"
            onClick={() => setShowModal(true)}
          >
            Agregar producto
          </button>
          <button
            className="productos-btn productos-btn-small"
            onClick={() => setShowCategorias(true)}
          >
            Categorías
          </button>
          <div className="productos-search-bar productos-search-inline">
            <input
              type="text"
              className="productos-search-input"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {/* Renderizar el botón de filtro con modal */}
            <ButtonFilter
              productos={productos}
              categorias={categorias}
              onFilter={setProductosFiltradosPorFiltro}
            />
          </div>
        </div>
      </div>
      <div className="productos-list">
        {loading ? (
          <p>Cargando productos...</p>
        ) : productosFiltrados.length === 0 ? (
          <p>No se encontraron productos...</p>
        ) : (
          <div className="productos-listado">
            {productosFiltrados.map((prod, idx) => (
              <div className="producto-row" key={prod.id || idx}>
                <span className="producto-nombre-listado">{prod.nombre}</span>
                <span className="producto-categoria-listado">
                  {getCategoriaNombre(prod.categoria_id)}
                </span>
                <span className="producto-precio-listado">${prod.precio}</span>
                <span
                  className="producto-precio-listado"
                  style={{ color: "#059669", fontWeight: 600 }}
                >
                  Final: ${prod.precio_final ?? "-"}
                </span>
                <span
                  className="producto-precio-listado"
                  style={{ color: "#2563eb", fontWeight: 600 }}
                >
                  % {prod.porcentaje_ganancia ?? "-"}
                </span>
                <span className="producto-stock-listado">
                  Stock: {prod.stock}
                </span>
                <div className="producto-actions-listado">
                  <MenuAccionesProducto
                    producto={prod}
                    onEditar={(producto) =>
                      setModalEditar({ open: true, producto })
                    }
                    onEliminar={(producto) =>
                      setModalEliminar({ open: true, producto })
                    }
                    onDetalles={(producto) =>
                      setModalDetalles({ open: true, producto })
                    }
                  />
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

      {/* Modales CRUD */}
      {modalEliminar.open && (
        <ModalEliminarProducto
          producto={modalEliminar.producto}
          onConfirm={async () => {
            // Eliminar en Supabase
            const { error } = await supabase
              .from("productos")
              .delete()
              .eq("id", modalEliminar.producto.id);
            if (!error) {
              setProductos(
                productos.filter((p) => p.id !== modalEliminar.producto.id)
              );
            }
            setModalEliminar({ open: false, producto: null });
          }}
          onCancel={() => setModalEliminar({ open: false, producto: null })}
        />
      )}
      {modalEditar.open && (
        <ModalEditarProducto
          producto={modalEditar.producto}
          onSave={async (editado) => {
            // Editar en Supabase
            const { data, error } = await supabase
              .from("productos")
              .update({
                nombre: editado.nombre,
                precio: editado.precio,
                precio_final: editado.precio_final,
                porcentaje_ganancia: editado.porcentaje_ganancia,
                stock: editado.stock,
                categoria_id: editado.categoria_id,
                detalles: editado.detalles,
              })
              .eq("id", editado.id)
              .select();
            if (!error && data && data.length > 0) {
              setProductos(
                productos.map((p) => (p.id === editado.id ? data[0] : p))
              );
            }
            setModalEditar({ open: false, producto: null });
          }}
          onCancel={() => setModalEditar({ open: false, producto: null })}
        />
      )}
      {modalDetalles.open && (
        <ModalDetallesProducto
          producto={{
            ...modalDetalles.producto,
            categoria_nombre: getCategoriaNombre(
              modalDetalles.producto?.categoria_id
            ),
          }}
          onClose={() => setModalDetalles({ open: false, producto: null })}
        />
      )}
    </div>
  );
}
