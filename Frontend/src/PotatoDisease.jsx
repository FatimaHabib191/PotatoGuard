import { useState, useRef, useCallback } from "react";

const API_URL = "http://localhost:8000/predict";

const DISEASE_INFO = {
  "Potato___Early_blight": {
    label: "Early Blight",
    color: "#B87D0A",
    bg: "#FFF8E6",
    border: "#F0C060",
    icon: "⚠",
    severity: "Moderate",
    description:
      "Caused by Alternaria solani, early blight produces dark, concentric ring lesions on older leaves. It thrives in warm, humid conditions and can significantly reduce yield if untreated.",
    treatment: [
      "Remove and destroy infected leaves immediately",
      "Apply copper-based or chlorothalonil fungicides",
      "Ensure adequate plant spacing for air circulation",
      "Avoid overhead irrigation; water at the base",
      "Rotate crops — avoid planting potatoes in the same spot for 2–3 years",
    ],
  },
  "Potato___Late_blight": {
    label: "Late Blight",
    color: "#B83232",
    bg: "#FFF0F0",
    border: "#F0A0A0",
    icon: "✕",
    severity: "Severe",
    description:
      "Caused by Phytophthora infestans, late blight is the pathogen responsible for the Irish Potato Famine. It spreads rapidly in cool, wet weather, producing water-soaked lesions that turn brown and destroy the entire plant.",
    treatment: [
      "Destroy infected plants immediately — do not compost",
      "Apply systemic fungicides (mancozeb, metalaxyl) preventively",
      "Plant resistant varieties where available",
      "Monitor fields daily during cool, wet periods",
      "Avoid wetting foliage; irrigate in the morning",
    ],
  },
  "Potato___healthy": {
    label: "Healthy",
    color: "#2D7A3A",
    bg: "#F0FAF2",
    border: "#80CC90",
    icon: "✓",
    severity: "None",
    description:
      "No signs of disease detected. This potato plant appears to be in good health with vibrant green foliage. Continue regular monitoring and preventive care to maintain plant health throughout the growing season.",
    treatment: [
      "Maintain regular watering and nutrient schedule",
      "Monitor weekly for early signs of disease or pest damage",
      "Apply preventive fungicide during high-risk weather",
      "Keep the growing area free of weeds",
      "Ensure proper soil drainage and crop rotation",
    ],
  },
};

function ConfidenceBar({ value, color }) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#666" }}>Model confidence</span>
        <span style={{ fontSize: 14, fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div style={{ background: "#eee", borderRadius: 999, height: 8, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 999,
            transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>
    </div>
  );
}

function LeafScanZone({ onFile, isDragging, setIsDragging }) {
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) onFile(file);
    },
    [onFile, setIsDragging]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${isDragging ? "#2D7A3A" : "#C8DFC8"}`,
        borderRadius: 20,
        padding: "56px 32px",
        textAlign: "center",
        cursor: "pointer",
        background: isDragging ? "#F0FAF2" : "#FAFDF9",
        transition: "all 0.2s ease",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isDragging && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(45,122,58,0.05) 18px, rgba(45,122,58,0.05) 20px)",
            animation: "scan 1.2s linear infinite",
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>🌿</div>
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1A3A1C", margin: "0 0 8px" }}>
        Drop a leaf image here
      </p>
      <p style={{ color: "#6A8A6A", fontSize: 14, margin: "0 0 20px" }}>
        or click to browse — JPG, PNG supported
      </p>
      <div
        style={{
          display: "inline-block",
          background: "#1A3A1C",
          color: "#fff",
          fontSize: 13,
          fontWeight: 500,
          padding: "10px 24px",
          borderRadius: 999,
          letterSpacing: "0.02em",
        }}
      >
        Select Image
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ResultCard({ result, imageUrl }) {
  const info = DISEASE_INFO[result.class] || DISEASE_INFO["Potato___healthy"];
  return (
    <div
      style={{
        borderRadius: 20,
        overflow: "hidden",
        border: `1.5px solid ${info.border}`,
        background: "#fff",
        animation: "fadeUp 0.4s ease",
      }}
    >
      <div style={{ display: "flex", gap: 0 }}>
        {imageUrl && (
          <div style={{ width: 200, flexShrink: 0 }}>
            <img
              src={imageUrl}
              alt="Uploaded leaf"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        )}
        <div style={{ flex: 1, padding: "24px 28px", background: info.bg }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: info.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {info.icon}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: info.color,
              }}
            >
              {info.severity === "None" ? "No disease" : `${info.severity} risk`}
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 28,
              color: "#1A3A1C",
              margin: "4px 0 8px",
            }}
          >
            {info.label}
          </h2>
          <p style={{ fontSize: 14, color: "#4A6A4A", lineHeight: 1.6, margin: 0 }}>
            {info.description}
          </p>
          <ConfidenceBar value={result.confidence} color={info.color} />
        </div>
      </div>

      <div style={{ padding: "20px 28px" }}>
        <h3
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 17,
            color: "#1A3A1C",
            margin: "0 0 14px",
          }}
        >
          {result.class === "Potato___healthy" ? "Preventive Care Tips" : "Recommended Actions"}
        </h3>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {info.treatment.map((tip, i) => (
            <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: info.bg,
                  border: `1.5px solid ${info.border}`,
                  color: info.color,
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 1,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 14, color: "#3A5A3A", lineHeight: 1.55 }}>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = useCallback(async (file) => {
    setError(null);
    setResult(null);
    setImageUrl(URL.createObjectURL(file));
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(API_URL, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot reach the API server. Make sure it's running at localhost:8000."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setResult(null);
    setImageUrl(null);
    setError(null);
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: #F4F8F4; min-height: 100vh; }
        @keyframes scan {
          from { background-position: 0 0; }
          to { background-position: 0 40px; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F4F8F4" }}>
        {/* Header */}
        <header
          style={{
            background: "#1A3A1C",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28 }}>🥔</span>
          <div>
            <div
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 20,
                color: "#D4F0C4",
                lineHeight: 1.1,
              }}
            >
              PotatoGuard
            </div>
            <div style={{ fontSize: 12, color: "#80A880", letterSpacing: "0.05em" }}>
              AI-Powered Disease Detection
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "#80A880",
              background: "rgba(255,255,255,0.08)",
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Model: CNN · 3 Classes
          </div>
        </header>

        {/* Hero */}
        <div
          style={{
            background: "linear-gradient(180deg, #1A3A1C 0%, #2D5C30 60%, #F4F8F4 100%)",
            padding: "48px 32px 80px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#80C880",
              margin: "0 0 12px",
            }}
          >
            PlantVillage Dataset · TensorFlow
          </p>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(32px, 5vw, 52px)",
              color: "#F0FAF0",
              margin: "0 0 16px",
              lineHeight: 1.15,
            }}
          >
            Diagnose your potato plants
            <br />
            in seconds
          </h1>
          <p style={{ color: "#A0C8A0", fontSize: 16, margin: 0, maxWidth: 500, marginInline: "auto" }}>
            Upload a photo of a potato leaf. Our model detects Early Blight, Late Blight, or confirms healthy foliage — with actionable treatment advice.
          </p>
        </div>

        {/* Main Card */}
        <div
          style={{
            maxWidth: 760,
            marginInline: "auto",
            marginTop: -48,
            padding: "0 24px 64px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              boxShadow: "0 4px 40px rgba(0,0,0,0.10)",
              overflow: "hidden",
            }}
          >
            {/* Upload zone */}
            <div style={{ padding: 28 }}>
              {!result && !loading && (
                <LeafScanZone
                  onFile={handleFile}
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                />
              )}

              {/* Loading */}
              {loading && (
                <div style={{ textAlign: "center", padding: "56px 32px" }}>
                  {imageUrl && (
                    <div
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 16,
                        overflow: "hidden",
                        marginInline: "auto",
                        marginBottom: 24,
                        position: "relative",
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt="Uploading"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(45,122,58,0.2) 8px, rgba(45,122,58,0.2) 10px)",
                          animation: "scan 0.6s linear infinite",
                        }}
                      />
                    </div>
                  )}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      border: "3px solid #C8DFC8",
                      borderTopColor: "#2D7A3A",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      marginInline: "auto",
                      marginBottom: 16,
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 20,
                      color: "#1A3A1C",
                      margin: "0 0 6px",
                    }}
                  >
                    Scanning the leaf…
                  </p>
                  <p style={{ color: "#6A8A6A", fontSize: 14, margin: 0 }}>
                    Running inference on the model
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  style={{
                    background: "#FFF0F0",
                    border: "1.5px solid #F0A0A0",
                    borderRadius: 16,
                    padding: "20px 24px",
                    marginBottom: 20,
                  }}
                >
                  <p style={{ color: "#B83232", fontWeight: 600, margin: "0 0 4px" }}>
                    Something went wrong
                  </p>
                  <p style={{ color: "#8A4040", fontSize: 14, margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Result */}
              {result && !loading && (
                <ResultCard result={result} imageUrl={imageUrl} />
              )}
            </div>

            {/* Footer actions */}
            {(result || error) && (
              <div
                style={{
                  borderTop: "1px solid #F0F4F0",
                  padding: "16px 28px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={reset}
                  style={{
                    background: "#1A3A1C",
                    color: "#fff",
                    border: "none",
                    borderRadius: 999,
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Analyse another leaf
                </button>
              </div>
            )}
          </div>

          {/* Disease legend */}
          {!result && !loading && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginTop: 20,
              }}
            >
              {Object.entries(DISEASE_INFO).map(([key, info]) => (
                <div
                  key={key}
                  style={{
                    background: info.bg,
                    border: `1px solid ${info.border}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 6 }}>
                    {key === "Potato___healthy" ? "🌱" : key === "Potato___Early_blight" ? "🍂" : "💧"}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: info.color,
                      marginBottom: 3,
                    }}
                  >
                    {info.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#6A8A6A" }}>
                    {key === "Potato___healthy"
                      ? "No action needed"
                      : key === "Potato___Early_blight"
                      ? "Fungal — manageable"
                      : "Fungal-like — urgent"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
