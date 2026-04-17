import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar({ username, logout }) {
  return (
    <div style={styles.navbar}>
      <h2 style={styles.logo}>⚙️ Smart Conveyor</h2>
      <div style={styles.user}>
        👤 {username}
        <button onClick={logout} style={styles.logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const runningRef = useRef(false);
  const pausedRef = useRef(false);

  const [currentCount, setCurrentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState("Not Detected");

  useEffect(() => {
    if (!username) navigate("/login");
  }, []);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.play();
      runningRef.current = true;
      pausedRef.current = false;
      detectLoop();
    };
  };

  const pauseCamera = () => {
    pausedRef.current = true;
  };

  const stopCamera = () => {
    const tracks = videoRef.current.srcObject?.getTracks();
    tracks?.forEach((t) => t.stop());
    runningRef.current = false;
    pausedRef.current = false;
  };

  const detectLoop = async () => {
    if (!runningRef.current || pausedRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("frame", blob, "frame.jpg");

      const res = await fetch("http://localhost:5000/detect-frame", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setCurrentCount(data.current_count);
      setTotalCount(data.session_total);
      setStatus(data.status);

      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 3;
      ctx.font = "14px Arial";
      ctx.fillStyle = "#00ffcc";

      data.boxes.forEach((b) => {
        ctx.strokeRect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1);
        ctx.fillText(b.label, b.x1, b.y1 - 5);
      });
    }, "image/jpeg");

    setTimeout(detectLoop, 400);
  };

  const logout = () => {
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div style={styles.wrapper}>
      <Navbar username={username} logout={logout} />

      <h1 style={styles.title}>🎥 Live Bottle Detection</h1>

      <div style={styles.container}>
        {/* VIDEO SECTION */}
        <div style={styles.videoCard}>
          <div style={{ position: "relative" }}>
            <video ref={videoRef} autoPlay style={styles.video} />
            <canvas ref={canvasRef} style={styles.canvas} />
          </div>

          <div style={styles.controls}>
            <button style={styles.start} onClick={startCamera}>▶ Start</button>
            <button style={styles.pause} onClick={pauseCamera}>⏸ Pause</button>
            <button style={styles.stop} onClick={stopCamera}>⛔ Stop</button>
          </div>
        </div>

        {/* STATS PANEL */}
        <div style={styles.stats}>
          <motion.div style={styles.statCard}>
            <h3>🍾 Current</h3>
            <p>{currentCount}</p>
          </motion.div>

          <motion.div style={styles.statCard}>
            <h3>📊 Total</h3>
            <p>{totalCount}</p>
          </motion.div>

          <motion.div style={styles.statCard}>
            <h3>🔍 Status</h3>
            <p style={{ color: status === "Detected" ? "#00ffcc" : "#ff4d4f" }}>
              {status}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    color: "white",
    padding: "20px",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  logo: {
    color: "#00c6ff",
  },

  user: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logout: {
    background: "#ff4d4f",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
  },

  container: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  videoCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "15px",
    borderRadius: "15px",
    backdropFilter: "blur(10px)",
  },

  video: {
    width: "500px",
    borderRadius: "10px",
  },

  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "500px",
  },

  controls: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "10px",
  },

  start: {
    background: "#00c853",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },

  pause: {
    background: "#ffab00",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },

  stop: {
    background: "#d32f2f",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },

  stats: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  statCard: {
    background: "rgba(255,255,255,0.1)",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    minWidth: "150px",
  },
};