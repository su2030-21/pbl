import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const uploadFile = () => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:5000/upload");

    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText);
      setResult(data);
      setUploading(false);
    };

    xhr.send(formData);
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>📤 Upload & Detect</h1>

      <div style={styles.container}>
        {/* LEFT: UPLOAD */}
        <div style={styles.uploadCard}>
          <h2>📁 Upload File</h2>

          <div
            style={styles.uploadBox}
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              type="file"
              hidden
              ref={inputRef}
              accept="image/*,video/*"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <p>Click or Drag File</p>
          </div>

          {preview && (
            <motion.div style={styles.previewBox}>
              {file.type.startsWith("image") ? (
                <img src={preview} style={styles.preview} />
              ) : (
                <video src={preview} controls style={styles.preview} />
              )}
            </motion.div>
          )}

          <motion.button
            style={styles.uploadBtn}
            whileHover={{ scale: 1.05 }}
            onClick={uploadFile}
            disabled={!file || uploading}
          >
            {uploading ? "Processing..." : "Upload & Detect"}
          </motion.button>
        </div>

        {/* RIGHT: RESULT */}
        <div style={styles.resultCard}>
          <h2>📊 Detection Result</h2>

          <AnimatePresence>
            {result ? (
              <motion.div
                style={styles.resultBox}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p>📸 File Count: {result.bottle_count}</p>
                <p>📊 Total Bottles: {result.total_bottles}</p>
                <p>📁 Total Files: {result.file_count}</p>

                <button
                  style={styles.dashboardBtn}
                  onClick={() => navigate("/results")}
                >
                  View Dashboard →
                </button>
              </motion.div>
            ) : (
              <p style={{ opacity: 0.6 }}>No result yet</p>
            )}
          </AnimatePresence>
        </div>
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

  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#00c6ff",
  },

  container: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    flexWrap: "wrap",
  },

  uploadCard: {
    width: "350px",
    padding: "20px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
  },

  resultCard: {
    width: "350px",
    padding: "20px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
  },

  uploadBox: {
    border: "2px dashed rgba(255,255,255,0.5)",
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "15px",
  },

  previewBox: {
    marginBottom: "15px",
  },

  preview: {
    width: "100%",
    borderRadius: "10px",
  },

  uploadBtn: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #00c6ff, #0072ff)",
    color: "white",
    cursor: "pointer",
  },

  resultBox: {
    background: "rgba(0,0,0,0.3)",
    padding: "15px",
    borderRadius: "10px",
  },

  dashboardBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#00c6ff",
    color: "white",
    cursor: "pointer",
  },
};