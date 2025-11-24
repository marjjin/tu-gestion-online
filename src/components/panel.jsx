import "../style/panel.css";
import { useState } from "react";
import logo from "../assets/logo.png";

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
        <h2 className="panel-logo-text">Tu Gestión Online</h2>
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
          <button className="panel-logout" title="Cerrar sesión">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 17L21 12L16 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12H9"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 19V21C12 21.5523 11.5523 22 11 22H5C4.44772 22 4 21.5523 4 21V3C4 2.44772 4.44772 2 5 2H11C11.5523 2 12 2.44772 12 3V5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </header>
        <section className="panel-content">
          <h1>{menuOptions.find((o) => o.key === selected)?.label}</h1>
          <p>Contenido de la sección {selected}.</p>
        </section>
      </main>
    </div>
  );
}
