import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Result() {
  const [data, setData] = useState({
    total_files: 0,
    total_bottles: 0,
    files: [],
  });

  const fetchData = () => {
    fetch("http://localhost:5000/results")
      .then((res) => res.json())
      .then((d) => setData(d));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const deleteFile = (name) => {
    fetch(`http://localhost:5000/delete/${name}`, {
      method: "DELETE",
    }).then(() => fetchData());
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.heading}>📊 Analytics Dashboard</h1>

      {/* KPI CARDS */}
      <div style={styles.kpiContainer}>
        <motion.div style={styles.kpiCard}>
          <h3>Total Files</h3>
          <h1>{data.total_files}</h1>
        </motion.div>

        <motion.div style={styles.kpiCard}>
          <h3>Total Bottles</h3>
          <h1>{data.total_bottles}</h1>
        </motion.div>

        <motion.div style={styles.kpiCard}>
          <h3>Avg / File</h3>
          <h1>
            {data.total_files > 0
              ? Math.round(data.total_bottles / data.total_files)
              : 0}
          </h1>
        </motion.div>
      </div>

      {/* ACTION */}
      <div style={styles.actions}>
        <button style={styles.refresh} onClick={fetchData}>
          🔄 Refresh
        </button>
      </div>

      {/* TABLE */}
      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span>File</span>
          <span>Count</span>
          <span>Action</span>
        </div>

        {data.files.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.6 }}>
            No uploads yet
          </p>
        ) : (
          data.files.map((f, i) => (
            <motion.div
              key={i}
              style={styles.row}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <strong>{f.name}</strong>
                <br />
                <small style={{ opacity: 0.6 }}>{f.date}</small>
              </div>

              <span style={styles.count}>🍾 {f.count}</span>

              <button
                style={styles.delete}
                onClick={() => deleteFile(f.name)}
              >
                Delete
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    padding: "30px",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    color: "white",
  },

  heading: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#00c6ff",
  },

  kpiContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  kpiCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "20px",
    borderRadius: "15px",
    textAlign: "center",
    minWidth: "180px",
    backdropFilter: "blur(10px)",
  },

  actions: {
    textAlign: "center",
    marginBottom: "20px",
  },

  refresh: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #00c6ff, #0072ff)",
    color: "white",
    cursor: "pointer",
  },

  table: {
    maxWidth: "700px",
    margin: "auto",
    background: "rgba(255,255,255,0.05)",
    padding: "15px",
    borderRadius: "12px",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold",
    marginBottom: "10px",
    opacity: 0.7,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.08)",
    padding: "12px",
    margin: "8px 0",
    borderRadius: "10px",
  },

  count: {
    fontWeight: "bold",
  },

  delete: {
    background: "#ff4d4f",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
};