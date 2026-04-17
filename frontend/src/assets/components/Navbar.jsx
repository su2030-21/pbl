import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      {/* LOGO */}
      <h2 style={styles.logo}>⚙️ Smart Conveyor</h2>

      {/* LINKS */}
      <div style={styles.links}>
        <Link
          to="/home"
          style={{
            ...styles.link,
            ...(isActive("/home") && styles.active),
          }}
        >
          🏠 Home
        </Link>

        <Link
          to="/upload"
          style={{
            ...styles.link,
            ...(isActive("/upload") && styles.active),
          }}
        >
          📤 Upload
        </Link>

        <Link
          to="/result"
          style={{
            ...styles.link,
            ...(isActive("/result") && styles.active),
          }}
        >
          📊 Dashboard
        </Link>

        <button onClick={logout} style={styles.logout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  logo: {
    margin: 0,
    color: "#00c6ff",
    fontWeight: "bold",
    letterSpacing: "1px",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  link: {
    textDecoration: "none",
    color: "white",
    padding: "8px 14px",
    borderRadius: "8px",
    transition: "0.3s",
  },

  active: {
    background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  },

  logout: {
    background: "linear-gradient(135deg, #ff4d4f, #d9363e)",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    transition: "0.3s",
  },
};