import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HamburgerMenu.css";
import logo from "../assets/logo.png";

export function HamburgerMenu({ email, onSelect, onLogout }) {
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
    { key: "productos", label: "Productos" },
    { key: "ventas", label: "Ventas" },
    { key: "clientes", label: "Clientes" },
    { key: "reportes", label: "Reportes" },
    { key: "configuracion", label: "Configuración" },
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
              <button
                key={opt.key}
                className="hamburger-menu-btn"
                onClick={() => {
                  onSelect(opt.key);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => {
                if (onLogout) onLogout();
                setOpen(false);
              }}
              className="hamburger-logout"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
