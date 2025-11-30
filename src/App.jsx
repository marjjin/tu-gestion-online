import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { useLocation } from "react-router-dom";

export default function App() {
  const location = window.location.pathname;
  const isLogin = location === "/" || location === "/login";
  return (
    <BrowserRouter>
      {!isLogin && <HamburgerMenu />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/dashboard/productos" />} />
      </Routes>
    </BrowserRouter>
  );
}
