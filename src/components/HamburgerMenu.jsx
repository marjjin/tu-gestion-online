import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HamburgerMenu.css";
import logo from "../assets/logo.png";

export function HamburgerMenu({ email }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const menuOptions = [
    { key: "productos", label: "Productos", to: "/productos" },
    { key: "ventas", label: "Ventas", to: "/ventas" },
    { key: "clientes", label: "Clientes", to: "/clientes" },
    { key: "reportes", label: "Reportes", to: "/reportes" },
    { key: "configuracion", label: "Configuración", to: "/configuracion" },
  ];

  return (
    <nav className="hamburger-nav">
      <button
        className="hamburger-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        <span className="hamburger-icon">{open ? "✕" : "≡"}</span>
      </button>
      <img src={logo} alt="Logo" className="hamburger-logo" />
      <span className="hamburger-user">{email}</span>
      {open && (
        <div className="hamburger-menu-overlay" onClick={() => setOpen(false)}>
          <div
            className="hamburger-menu open"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            {menuOptions.map((opt) => (
              <Link key={opt.key} to={opt.to} onClick={() => setOpen(false)}>
                {opt.label}
              </Link>
            ))}
            <Link
              to="/logout"
              onClick={() => setOpen(false)}
              className="hamburger-logout"
            >
              Cerrar sesión
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
