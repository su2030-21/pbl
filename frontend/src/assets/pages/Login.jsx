import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [user, setUser] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const validUser = users.find(
      (u) =>
        u.username === user.username &&
        u.password === user.password
    );

    if (!validUser) {
      alert("Invalid credentials!");
      return;
    }

    localStorage.setItem("username", user.username);
    navigate("/home");
  };

  return (
    <div style={styles.wrapper}>
      {/* Background */}
      <div style={styles.bg}></div>

      <motion.form
        onSubmit={handleLogin}
        style={styles.card}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2 style={styles.title}>🔐 Welcome Back</h2>

        <input
          type="text"
          placeholder="Username"
          required
          style={styles.input}
          onChange={(e) =>
            setUser({ ...user, username: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          required
          style={styles.input}
          onChange={(e) =>
            setUser({ ...user, password: e.target.value })
          }
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={styles.button}
        >
          Login
        </motion.button>

        <p style={styles.text}>
          Don’t have an account?{" "}
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </p>
      </motion.form>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },

  bg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    filter: "blur(80px)",
    zIndex: -1,
  },

  card: {
    width: "360px",
    padding: "30px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    color: "white",
  },

  title: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#00c6ff",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    background: "rgba(255,255,255,0.15)",
    color: "white",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #00c6ff, #0072ff)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },

  text: {
    textAlign: "center",
    color: "#ccc",
  },

  link: {
    color: "#00c6ff",
    fontWeight: "bold",
    textDecoration: "none",
  },
};