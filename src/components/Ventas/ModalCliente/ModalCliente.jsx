import { useState, useEffect } from "react";
import { supabase } from "../../../supabase";
import "./modalcliente.css";

export function ModalCliente({ open, cliente, onGuardar, onClose }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [dni, setDni] = useState("");
  const [resultados, setResultados] = useState([]);
  const [clienteExistente, setClienteExistente] = useState(null);
  const [buscando, setBuscando] = useState(false);

  // Limpiar campos si no hay cliente seleccionado al abrir el modal
  useEffect(() => {
    if (open) {
      if (cliente) {
        setNombre(cliente.nombre || "");
        setEmail(cliente.email || "");
        setTelefono(cliente.telefono || "");
        setDireccion(cliente.direccion || "");
        setDni(cliente.dni || "");
        setClienteExistente(cliente);
      } else {
        setNombre("");
        setEmail("");
        setTelefono("");
        setDireccion("");
        setDni("");
        setClienteExistente(null);
      }
      setResultados([]);
    }
  }, [open, cliente]);

  // Buscar clientes por nombre/email/telefono
  useEffect(() => {
    if (!open || nombre.trim().length < 2) {
      setResultados([]);
      setClienteExistente(null);
      return;
    }
    setBuscando(true);
    const buscar = setTimeout(async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, email, telefono, direccion, dni")
        .ilike("nombre", `%${nombre.trim()}%`);
      if (!error && data && data.length > 0) {
        setResultados(data);
        // Si hay coincidencia exacta, marcar como existente
        const exacto = data.find(
          (c) => c.nombre.toLowerCase() === nombre.trim().toLowerCase()
        );
        setClienteExistente(exacto || null);
      } else {
        setResultados([]);
        setClienteExistente(null);
      }
      setBuscando(false);
    }, 400);
    return () => clearTimeout(buscar);
  }, [nombre, open]);

  if (!open) return null;

  return (
    <div className="modalcliente-overlay">
      <div className="modalcliente-contenido">
        <h3>Seleccionar o agregar cliente</h3>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="modalcliente-input"
            autoComplete="off"
          />
          {buscando && (
            <div
              style={{ position: "absolute", right: 10, top: 10, fontSize: 12 }}
            >
              Buscando...
            </div>
          )}
          {resultados.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 40,
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: 6,
                zIndex: 10,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {resultados.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: 8,
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onClick={() => {
                    setNombre(c.nombre);
                    setEmail(c.email || "");
                    setTelefono(c.telefono || "");
                    setDireccion(c.direccion || "");
                    setDni(c.dni || "");
                    setClienteExistente(c);
                    setResultados([]);
                  }}
                >
                  {c.nombre}{" "}
                  {c.email && (
                    <span style={{ color: "#888", fontSize: 12 }}>
                      ({c.email})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <input
          type="email"
          placeholder="Email (opcional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="modalcliente-input"
        />
        <input
          type="text"
          placeholder="Teléfono (opcional)"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="modalcliente-input"
        />
        <input
          type="text"
          placeholder="Dirección (opcional)"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          className="modalcliente-input"
        />
        <input
          type="text"
          placeholder="DNI (opcional)"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          className="modalcliente-input"
        />
        <div className="modalcliente-acciones">
          <button
            className="modalcliente-guardar"
            onClick={async () => {
              if (clienteExistente) {
                onGuardar(clienteExistente);
              } else {
                // Guardar en Supabase
                const user =
                  supabase.auth.getUser &&
                  (await supabase.auth.getUser()).data.user;
                const { data, error } = await supabase
                  .from("clientes")
                  .insert({
                    nombre,
                    email,
                    telefono,
                    direccion,
                    dni,
                    user_id: user?.id,
                  })
                  .select()
                  .single();
                if (!error && data) {
                  onGuardar(data);
                } else {
                  alert(
                    "Error al guardar cliente: " +
                      (error?.message || JSON.stringify(error))
                  );
                }
              }
            }}
            disabled={!nombre.trim()}
          >
            {clienteExistente ? "Aceptar" : "Guardar cliente"}
          </button>
          <button className="modalcliente-cerrar" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
