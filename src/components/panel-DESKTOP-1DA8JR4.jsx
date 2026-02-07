import "../style/panel.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { Productos } from "./Productos/Productos";
import { ButtonCerrarSesion } from "./ButtonCerrarSesion";
import { HamburgerMenu } from "./HamburgerMenu";
import { supabase } from "../supabase"; // Asegúrate de importar supabase
import { Ventas } from "./Ventas/Ventas";

export function Panel({ email }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Definir las rutas para cada sección
  const menuOptions = [
    { key: "productos", label: "Productos", path: "/dashboard/productos" },
    { key: "ventas", label: "Ventas", path: "/dashboard/ventas" },
    { key: "clientes", label: "Clientes", path: "/dashboard/clientes" },
    { key: "reportes", label: "Reportes", path: "/dashboard/reportes" },
    {
      key: "configuracion",
      label: "Configuración",
      path: "/dashboard/configuracion",
    },
  ];

  // Determinar la sección activa según la URL
  const selected =
    menuOptions.find((opt) => location.pathname.includes(opt.key))?.key ||
    "productos";

  // Estado global de productos filtrados
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  // Función para logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="panel-container">
      <HamburgerMenu
        email={email}
        onSelect={(key) => {
          const opt = menuOptions.find((o) => o.key === key);
          if (opt) navigate(opt.path);
        }}
        onLogout={handleLogout}
      />
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
              onClick={() => navigate(option.path)}
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
          <div className="panel-logout-desktop">
            <ButtonCerrarSesion />
          </div>
        </header>
        <section className="panel-content">
          {selected === "productos" ? (
            <Productos
              productosFiltrados={productosFiltrados}
              setProductosFiltrados={setProductosFiltrados}
            />
          ) : selected === "ventas" ? (
            <Ventas productos={productosFiltrados} email={email} />
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
