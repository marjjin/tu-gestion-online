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
import "./botonFab.css";

export function Productos({ productosFiltrados, setProductosFiltrados }) {
  const [showModal, setShowModal] = useState(false);
  const [showCategorias, setShowCategorias] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productosFiltradosPorFiltro, setProductosFiltradosPorFiltro] =
    useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef();
  const [categorias, setCategorias] = useState([]);
  // Eliminado reloadProductos, solo actualizamos estado local

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
  const [showActionsModalMobile, setShowActionsModalMobile] = useState(false);

  // Estados para selección múltiple
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkPriceIncrease, setBulkPriceIncrease] = useState("");
  const [bulkProfitIncrease, setBulkProfitIncrease] = useState("");
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkUpdateSuccess, setBulkUpdateSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const handleAddProducto = (productoInsertado) => {
    // Solo actualizamos el estado local con el producto retornado por Supabase
    setProductos((prev) => {
      if (prev.some((p) => p.id === productoInsertado.id)) return prev;
      return [productoInsertado, ...prev];
    });
    setProductosFiltradosPorFiltro((prev) => {
      if (prev.some((p) => p.id === productoInsertado.id)) return prev;
      return [productoInsertado, ...prev];
    });
    setProductosFiltrados((prev) => {
      if (prev.some((p) => p.id === productoInsertado.id)) return prev;
      return [productoInsertado, ...prev];
    });
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

  // Manejo de selección múltiple
  const toggleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === productosFiltrados.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productosFiltrados.map((p) => p.id));
    }
  };

  // Aplicar cambios masivos
  const handleBulkUpdate = async () => {
    if (selectedProducts.length === 0) return;

    setLoading(true);
    const updates = [];

    for (const productId of selectedProducts) {
      const producto = productos.find((p) => p.id === productId);
      if (!producto) continue;

      const updateData = {};

      // Actualizar precio de costo si hay porcentaje
      if (bulkPriceIncrease && !isNaN(bulkPriceIncrease)) {
        const porcentaje = parseFloat(bulkPriceIncrease);
        const nuevoPrecioCosto = producto.precio * (1 + porcentaje / 100);
        updateData.precio = parseFloat(nuevoPrecioCosto.toFixed(2));

        // Recalcular precio final con el nuevo precio de costo y el porcentaje de ganancia actual
        if (producto.porcentaje_ganancia) {
          const nuevoPrecioFinal =
            nuevoPrecioCosto * (1 + producto.porcentaje_ganancia / 100);
          updateData.precio_final = parseFloat(nuevoPrecioFinal.toFixed(2));
        }
      }

      // Actualizar porcentaje de ganancia si hay cambio
      if (bulkProfitIncrease && !isNaN(bulkProfitIncrease)) {
        const porcentajeIncremento = parseFloat(bulkProfitIncrease);
        const porcentajeActual = producto.porcentaje_ganancia || 0;
        const nuevoPorcentaje = porcentajeActual + porcentajeIncremento;

        updateData.porcentaje_ganancia = parseFloat(nuevoPorcentaje.toFixed(2));

        // Recalcular precio final con el nuevo porcentaje
        const precioCostoFinal = updateData.precio || producto.precio;
        const nuevoPrecioFinal = precioCostoFinal * (1 + nuevoPorcentaje / 100);
        updateData.precio_final = parseFloat(nuevoPrecioFinal.toFixed(2));
      }

      // Actualizar categoría si está seleccionada
      if (bulkCategoryId) {
        updateData.categoria_id = bulkCategoryId;
      }

      if (Object.keys(updateData).length > 0) {
        updates.push({ id: productId, data: updateData });
      }
    }

    // Ejecutar updates en Supabase
    for (const update of updates) {
      const { data, error } = await supabase
        .from("productos")
        .update(update.data)
        .eq("id", update.id)
        .select();

      if (!error && data && data.length > 0) {
        // Actualizar estado local
        setProductos((prev) =>
          prev.map((p) => (p.id === update.id ? data[0] : p))
        );
        setProductosFiltradosPorFiltro((prev) =>
          prev.map((p) => (p.id === update.id ? data[0] : p))
        );
        setProductosFiltrados((prev) =>
          prev.map((p) => (p.id === update.id ? data[0] : p))
        );
      }
    }

    setLoading(false);
    setBulkUpdateSuccess(true);
  };

  // Cerrar modal y resetear todo
  const handleCloseBulkModal = () => {
    setShowBulkActions(false);
    setSelectedProducts([]);
    setBulkPriceIncrease("");
    setBulkProfitIncrease("");
    setBulkCategoryId("");
    setBulkUpdateSuccess(false);
  };

  return (
    <div className="productos-container">
      <div className="productos-header-flex">
        <h1 className="productos-title-left">Productos</h1>
        <div className="productos-actions-title-row">
          {/* Botones solo desktop/tablet */}
          <button
            className="productos-btn productos-btn-small productos-btn-desktop"
            onClick={() => setShowModal(true)}
          >
            Agregar producto
          </button>
          <button
            className="productos-btn productos-btn-small productos-btn-desktop"
            onClick={() => setShowCategorias(true)}
          >
            Categorías
          </button>

          <div className="productos-search-row-mobile">
            <input
              type="text"
              className="productos-search-input"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <ButtonFilter
              productos={productos}
              categorias={categorias}
              onFilter={setProductosFiltradosPorFiltro}
            />

            {/* Checkbox para seleccionar todos - inline con buscador */}
            <div className="productos-select-all-container">
              <label className="productos-select-all-label">
                <input
                  type="checkbox"
                  className="producto-checkbox"
                  checked={
                    productosFiltrados.length > 0 &&
                    selectedProducts.length === productosFiltrados.length
                  }
                  onChange={toggleSelectAll}
                />
                <span>Seleccionar todos</span>
              </label>
            </div>

            {/* Barra de acciones masivas inline */}
            {selectedProducts.length > 0 && (
              <div className="productos-bulk-actions-inline">
                <span className="bulk-selected-count-inline">
                  {selectedProducts.length} seleccionado(s)
                </span>
                <button
                  className="bulk-action-btn-inline"
                  onClick={() => setShowBulkActions(true)}
                >
                  Editar
                </button>
                <button
                  className="bulk-action-btn-inline bulk-cancel-inline"
                  onClick={() => setSelectedProducts([])}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Buscador y filtro debajo del título */}
      </div>

      {/* Botón flotante + solo mobile */}
      <button
        className="productos-fab-mobile"
        title="Acciones"
        onClick={() => setShowActionsModalMobile(true)}
      >
        +
      </button>
      {showActionsModalMobile && (
        <div
          className="productos-actions-modal-bg-mobile"
          onClick={() => setShowActionsModalMobile(false)}
        >
          <div
            className="productos-actions-modal-mobile"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowModal(true);
                setShowActionsModalMobile(false);
              }}
            >
              Agregar producto
            </button>
            <button
              onClick={() => {
                setShowCategorias(true);
                setShowActionsModalMobile(false);
              }}
            >
              Categorías
            </button>
          </div>
        </div>
      )}

      <div className="productos-list">
        {loading ? (
          <p>Cargando productos...</p>
        ) : productosFiltrados.length === 0 ? (
          <p>No se encontraron productos...</p>
        ) : (
          <div className="productos-listado">
            {productosFiltrados.map((prod, idx) => (
              <div className="producto-row" key={prod.id || idx}>
                <input
                  type="checkbox"
                  className="producto-checkbox"
                  checked={selectedProducts.includes(prod.id)}
                  onChange={() => toggleSelectProduct(prod.id)}
                  title="Seleccionar producto"
                />
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

      {/* Modal de acciones masivas */}
      {showBulkActions && (
        <div
          className="modal-overlay"
          onClick={bulkUpdateSuccess ? handleCloseBulkModal : undefined}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {bulkUpdateSuccess ? (
              // Pantalla de confirmación
              <>
                <div className="bulk-success-icon">✓</div>
                <h2>¡Cambios aplicados exitosamente!</h2>
                <p className="bulk-modal-subtitle">
                  Se han actualizado {selectedProducts.length} producto(s)
                </p>
                <div className="modal-actions">
                  <button
                    className="modal-btn modal-btn-primary"
                    onClick={handleCloseBulkModal}
                  >
                    Aceptar
                  </button>
                </div>
              </>
            ) : (
              // Formulario de edición
              <>
                <h2>Editar productos seleccionados</h2>
                <p className="bulk-modal-subtitle">
                  {selectedProducts.length} producto(s) seleccionado(s)
                </p>

                <div className="bulk-edit-form">
                  <label>
                    Aumentar/Disminuir precio de costo (%):
                    <input
                      type="number"
                      placeholder="Ej: 10 o -5"
                      value={bulkPriceIncrease}
                      onChange={(e) => setBulkPriceIncrease(e.target.value)}
                      step="0.01"
                    />
                    <small>
                      Ingresa un número positivo para aumentar o negativo para
                      disminuir el precio de costo
                    </small>
                  </label>

                  <label>
                    Aumentar/Disminuir ganancia (%):
                    <input
                      type="number"
                      placeholder="Ej: 5 o -3"
                      value={bulkProfitIncrease}
                      onChange={(e) => setBulkProfitIncrease(e.target.value)}
                      step="0.01"
                    />
                    <small>
                      Ingresa un número positivo para aumentar o negativo para
                      disminuir el porcentaje de ganancia
                    </small>
                  </label>

                  <label>
                    Cambiar categoría:
                    <select
                      value={bulkCategoryId}
                      onChange={(e) => setBulkCategoryId(e.target.value)}
                    >
                      <option value="">-- No cambiar --</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    className="modal-btn modal-btn-primary"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={
                      loading ||
                      (!bulkPriceIncrease &&
                        !bulkProfitIncrease &&
                        !bulkCategoryId)
                    }
                  >
                    {loading ? "Aplicando..." : "Aplicar cambios"}
                  </button>
                  <button
                    className="modal-btn modal-btn-secondary"
                    onClick={handleCloseBulkModal}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="modal-overlay" style={{ zIndex: 1001 }}>
          <div className="modal-content modal-confirm">
            <div className="confirm-icon">⚠️</div>
            <h2>¿Confirmar cambios masivos?</h2>
            <div className="confirm-details">
              <p>
                <strong>Productos a modificar:</strong>{" "}
                {selectedProducts.length}
              </p>
              {bulkPriceIncrease && (
                <p>
                  <strong>Precio de costo:</strong>{" "}
                  {parseFloat(bulkPriceIncrease) > 0 ? "+" : ""}
                  {bulkPriceIncrease}%
                </p>
              )}
              {bulkProfitIncrease && (
                <p>
                  <strong>Ganancia:</strong>{" "}
                  {parseFloat(bulkProfitIncrease) > 0 ? "+" : ""}
                  {bulkProfitIncrease}%
                </p>
              )}
              {bulkCategoryId && (
                <p>
                  <strong>Nueva categoría:</strong>{" "}
                  {categorias.find((c) => c.id === bulkCategoryId)?.nombre}
                </p>
              )}
            </div>
            <p className="confirm-warning">
              Esta acción modificará los productos seleccionados.
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-primary"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleBulkUpdate();
                }}
              >
                Sí, aplicar cambios
              </button>
              <button
                className="modal-btn modal-btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
              // Solo actualizamos el estado local, no recargamos desde Supabase
              setProductos((prev) =>
                prev.filter((p) => p.id !== modalEliminar.producto.id)
              );
              setProductosFiltradosPorFiltro((prev) =>
                prev.filter((p) => p.id !== modalEliminar.producto.id)
              );
              setProductosFiltrados((prev) =>
                prev.filter((p) => p.id !== modalEliminar.producto.id)
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
              // Solo actualizamos el estado local, no recargamos desde Supabase
              setProductos((prev) =>
                prev.map((p) => (p.id === editado.id ? data[0] : p))
              );
              setProductosFiltradosPorFiltro((prev) =>
                prev.map((p) => (p.id === editado.id ? data[0] : p))
              );
              setProductosFiltrados((prev) =>
                prev.map((p) => (p.id === editado.id ? data[0] : p))
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
