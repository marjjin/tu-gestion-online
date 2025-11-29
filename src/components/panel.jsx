import "../style/panel.css";
import { useState } from "react";
import logo from "../assets/logo.png";
import { Productos } from "./Productos/Productos";
import { ButtonCerrarSesion } from "./ButtonCerrarSesion";

const menuOptions = [
  { key: "productos", label: "Productos" },
  { key: "ventas", label: "Ventas" },
  { key: "clientes", label: "Clientes" },
  { key: "reportes", label: "Reportes" },
  { key: "configuracion", label: "Configuración" },
];

export function Panel({ email }) {
  const [selected, setSelected] = useState("productos");

  return (
    <div className="panel-container">
      <aside className="panel-sidebar">
        <img src={logo} alt="Logo" className="panel-logo-img" />
        <h2 className="panel-logo-text">Gestion Live</h2>
        <nav>
          {menuOptions.map((option) => (
            <button
              key={option.key}
              className={`panel-menu-btn${
                selected === option.key ? " active" : ""
              }`}
              onClick={() => setSelected(option.key)}
            >
              {option.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="panel-main">
        <header className="panel-header minimal">
          <div className="panel-header-left">
            <img src={logo} alt="Logo" className="panel-header-logo" />
            <span className="panel-user">{email}</span>
          </div>
          <ButtonCerrarSesion />
        </header>
        <section className="panel-content">
          {selected === "productos" ? (
            <Productos />
          ) : (
            <>
              <h1>{menuOptions.find((o) => o.key === selected)?.label}</h1>
              <p>Contenido de la sección {selected}.</p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
