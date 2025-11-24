import { supabase } from "../supabase";

export function ButtonCerrarSesion() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button
      className="panel-logout"
      title="Cerrar sesión"
      onClick={handleLogout}
    >
      <svg
        width="32"
        height="32"
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
  );
}
