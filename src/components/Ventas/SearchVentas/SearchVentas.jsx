import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./searchventas.css";

export const SearchVentas = forwardRef(function SearchVentas(
  { productos, onSelect },
  ref
) {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const itemsRef = useRef([]);

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      if (inputRef.current) inputRef.current.focus();
    },
  }));

  // Parsear la búsqueda para cantidad*producto
  const parseQuery = (q) => {
    const match = q.match(/^([0-9]+(?:\.[0-9]+)?)\*(.+)$/);
    if (match) {
      return { cantidad: parseFloat(match[1]), texto: match[2].trim() };
    }
    return { cantidad: 1, texto: q.trim() };
  };

  const handleBuscar = (e) => {
    const value = e.target.value;
    setQuery(value);
    const { cantidad, texto } = parseQuery(value);
    setCantidad(cantidad);
    if (texto.length > 0) {
      const filtrados = productos.filter((p) =>
        p.nombre.toLowerCase().includes(texto.toLowerCase())
      );
      setResultados(filtrados);
      setModalOpen(true);
      setHighlighted(0);
    } else {
      setResultados([]);
      setModalOpen(false);
    }
  };

  const handleSelect = (producto) => {
    // Siempre pasar SOLO la cantidad del input, nunca arrastrar cantidad previa
    const { cantidad: _, ...productoSinCantidad } = producto;
    onSelect({ ...productoSinCantidad, cantidad });
    setModalOpen(false);
    setQuery("");
    setResultados([]);
    setCantidad(1);
    setHighlighted(0);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (!modalOpen || resultados.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => (prev + 1) % resultados.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(
        (prev) => (prev - 1 + resultados.length) % resultados.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(resultados[highlighted]);
    }
  };

  useEffect(() => {
    if (itemsRef.current[highlighted]) {
      itemsRef.current[highlighted].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlighted]);

  return (
    <div className="searchventas-container">
      <input
        type="text"
        className="searchventas-input"
        value={query}
        onChange={handleBuscar}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        placeholder="Ej: 2*fernet o 1.5*azúcar"
      />
      {modalOpen && (
        <div className="searchventas-modal">
          {resultados.length === 0 ? (
            <div className="searchventas-vacio">No hay resultados</div>
          ) : (
            resultados.map((prod, idx) => (
              <div
                key={prod.id}
                ref={(el) => (itemsRef.current[idx] = el)}
                className={
                  "searchventas-item" +
                  (highlighted === idx ? " highlighted" : "")
                }
                onClick={() => handleSelect(prod)}
                style={highlighted === idx ? { background: "#e0e7ff" } : {}}
              >
                {prod.nombre} <span>${prod.precio_final}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
});
