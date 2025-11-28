import "./buttonFilter.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useState } from "react";

export function ButtonFilter({ onFilter, productos, categorias }) {
  const [open, setOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState("");
  const [ordenAsc, setOrdenAsc] = useState(true);
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(0);
  const [precioSel, setPrecioSel] = useState([0, 0]);

  // Evitar que los valores del slider se superpongan apenas se mueven
  const handleSliderChange = (values) => {
    let [min, max] = values;
    // Evita que los valores se superpongan completamente
    if (max - min < 1) {
      // No actualiza el estado si están juntos
      return;
    }
    setPrecioSel([min, max]);
  };
  const [searchCat, setSearchCat] = useState("");

  // Calcular rango de precios al abrir
  const handleOpen = () => {
    if (productos.length > 0) {
      const precios = productos.map((p) => p.precio);
      const min = Math.min(...precios);
      const max = Math.max(...precios);
      setPrecioMin(min);
      setPrecioMax(max);
      setPrecioSel([min, max]);
    }
    setOpen(true);
  };

  // Aplicar filtro
  const handleApply = () => {
    let filtrados = productos;
    // Filtrar por categorías
    if (selectedCategorias.length > 0) {
      filtrados = filtrados.filter((p) =>
        selectedCategorias.includes(p.categoria_id)
      );
    }
    // Filtrar por rango de precio
    filtrados = filtrados.filter(
      (p) => p.precio >= precioSel[0] && p.precio <= precioSel[1]
    );
    // Ordenar
    if (selectedOrden === "alfabetico") {
      filtrados = [...filtrados].sort((a, b) =>
        ordenAsc
          ? a.nombre.localeCompare(b.nombre)
          : b.nombre.localeCompare(a.nombre)
      );
    } else if (selectedOrden === "stock") {
      filtrados = [...filtrados].sort((a, b) =>
        ordenAsc ? a.stock - b.stock : b.stock - a.stock
      );
    } else if (selectedOrden === "precio") {
      filtrados = [...filtrados].sort((a, b) =>
        ordenAsc ? a.precio - b.precio : b.precio - a.precio
      );
    }
    onFilter(filtrados);
    setOpen(false);
  };

  // Toggle categoría
  const toggleCategoria = (id) => {
    setSelectedCategorias((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Filtrar categorías por búsqueda
  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(searchCat.toLowerCase())
  );

  return (
    <>
      <button
        className="productos-filter-btn"
        onClick={handleOpen}
        title="Filtrar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="#2563eb"
            d="M3 6a1 1 0 0 1 1-1h16a1 1 0 0 1 .8 1.6l-5.6 7.47V19a1 1 0 0 1-1.45.89l-3-1.5A1 1 0 0 1 10 17.5v-2.43L4.2 6.6A1 1 0 0 1 3 6zm3.38 1l5.12 6.82a1 1 0 0 1 .2.6v2.68l1 .5v-3.18a1 1 0 0 1 .2-.6L17.62 7H6.38z"
          />
        </svg>
      </button>
      {open && (
        <div className="filter-modal-overlay" onClick={() => setOpen(false)}>
          <div
            className="filter-modal filter-modal-animate"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="filter-modal-header">
              <span className="filter-modal-icon">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                  <path
                    fill="#2563eb"
                    d="M3 6a1 1 0 0 1 1-1h16a1 1 0 0 1 .8 1.6l-5.6 7.47V19a1 1 0 0 1-1.45.89l-3-1.5A1 1 0 0 1 10 17.5v-2.43L4.2 6.6A1 1 0 0 1 3 6zm3.38 1l5.12 6.82a1 1 0 0 1 .2.6v2.68l1 .5v-3.18a1 1 0 0 1 .2-.6L17.62 7H6.38z"
                  />
                </svg>
              </span>
              <h2 className="filter-modal-title">
                Filtrar y ordenar productos
              </h2>
            </div>
            <div className="filter-modal-section">
              <div className="filter-section-title">Ordenar</div>
              <div className="filter-options">
                {["alfabetico", "stock", "precio"].map((orden) => (
                  <button
                    key={orden}
                    className={`filter-option-btn${
                      selectedOrden === orden ? " selected" : ""
                    }`}
                    onClick={() => {
                      if (selectedOrden === orden) {
                        setSelectedOrden("");
                      } else {
                        setSelectedOrden(orden);
                      }
                    }}
                  >
                    <span className="filter-option-icon">
                      {orden === "alfabetico"
                        ? "🔤"
                        : orden === "stock"
                        ? "📦"
                        : "💲"}
                    </span>
                    <span>
                      {orden === "alfabetico"
                        ? "Alfabéticamente"
                        : orden === "stock"
                        ? "Stock"
                        : "Precio"}
                    </span>
                    {selectedOrden === orden && (
                      <button
                        type="button"
                        className="filter-order-btn"
                        style={{
                          transform: ordenAsc
                            ? "rotate(0deg)"
                            : "rotate(180deg)",
                          transition: "transform 0.2s",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrdenAsc((a) => !a);
                        }}
                        title={ordenAsc ? "Ascendente" : "Descendente"}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 4v16m0 0l-6-6m6 6l6-6"
                            stroke="#2563eb"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-modal-section">
              <div className="filter-section-title">Categoría</div>
              <input
                type="text"
                className="filter-category-search"
                placeholder="Buscar categoría..."
                value={searchCat}
                onChange={(e) => setSearchCat(e.target.value)}
              />
              <div className="filter-category-list filter-category-list-scroll">
                {categoriasFiltradas.map((cat) => (
                  <label key={cat.id} className="filter-category-item">
                    <input
                      type="checkbox"
                      checked={selectedCategorias.includes(cat.id)}
                      onChange={() => toggleCategoria(cat.id)}
                    />
                    <span>{cat.nombre}</span>
                  </label>
                ))}
                {categoriasFiltradas.length === 0 && (
                  <div className="filter-category-empty">No hay categorías</div>
                )}
              </div>
            </div>
            <div className="filter-modal-section">
              <div className="filter-section-title">Precio</div>
              <div className="filter-price-slider-row price-slider-rc">
                {precioSel[1] - precioSel[0] < 3000 ? (
                  <div
                    className="price-slider-label-thumb"
                    style={{
                      left: `${
                        (((precioSel[0] + precioSel[1]) / 2 - precioMin) /
                          (precioMax - precioMin)) *
                        100
                      }%`,
                      zIndex: 20,
                    }}
                  >
                    <span className="price-slider-label">
                      ${precioSel[0]} — ${precioSel[1]} ARS
                    </span>
                  </div>
                ) : (
                  <>
                    <div
                      className="price-slider-label-thumb"
                      style={{
                        left: `${
                          ((precioSel[0] - precioMin) /
                            (precioMax - precioMin)) *
                          100
                        }%`,
                      }}
                    >
                      <span className="price-slider-label">
                        ${precioSel[0]} ARS
                      </span>
                    </div>
                    <div
                      className="price-slider-label-thumb"
                      style={{
                        left: `${
                          ((precioSel[1] - precioMin) /
                            (precioMax - precioMin)) *
                          100
                        }%`,
                      }}
                    >
                      <span className="price-slider-label">
                        ${precioSel[1]} ARS
                      </span>
                    </div>
                  </>
                )}
                <Slider
                  range
                  min={precioMin}
                  max={precioMax}
                  value={precioSel}
                  onChange={handleSliderChange}
                  allowCross={false}
                  className="price-slider-rc"
                />
              </div>
            </div>
            <div className="filter-modal-actions">
              <button className="filter-modal-btn" onClick={handleApply}>
                Aplicar
              </button>
              <button
                className="filter-modal-btn filter-modal-btn-cancel"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
