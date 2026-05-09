import React, { useState, useEffect } from "react";

// ── CONFIGURAÇÕES GERAIS E TEMA ──────────────────────────────
const G = {
  bg: "#EEF3F0", card: "#FFF", primary: "#1B5E4A", accent: "#E3EFE9", 
  accentDark: "#A8D5C0", text: "#162420", muted: "#6B8880", red: "#C0392B", 
  yellow: "#D68910", blue: "#1A5276", purple: "#6C3483", border: "#D5E8DF", 
  success: "#1E8449", orange: "#CA6F1E", gold: "#B7950B",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${G.bg}; color: ${G.text}; }
  input, select, textarea, button { font-family: 'DM Sans', sans-serif; }
  .fi { animation: fi .2s ease } @keyframes fi { from { opacity: 0; transform: translateY(5px) } to { opacity: 1; transform: none } }
  @media(min-width: 640px) { .sidebar { width: 195px; flex-shrink: 0; position: relative; } .mobile-topbar, .bottom-nav { display: none !important; } }
  @media(max-width: 639px) { .sidebar { position: fixed; left: 0; top: 0; height: 100vh; z-index: 1000; width: 240px; transition: 0.3s; } .sidebar.closed { transform: translateX(-100%); } }
`;

// ── COMPONENTES ATÔMICOS (UI) ────────────────────────────────
const Btn = ({ ch, onClick, v = "p", sm, style, dis }) => {
  const vs = {
    p: { background: G.primary, color: "#fff" },
    g: { background: "transparent", color: G.primary, border: `1.5px solid ${G.primary}` },
    r: { background: G.red, color: "#fff" },
    w: { background: "#25D366", color: "#fff" },
    y: { background: G.yellow, color: "#fff" }
  };
  return (
    <button 
      disabled={dis} 
      onClick={onClick} 
      style={{
        border: "none", borderRadius: 8, fontWeight: 600, cursor: dis ? "not-allowed" : "pointer",
        padding: sm ? "5px 11px" : "10px 18px", fontSize: sm ? 12 : 14, opacity: dis ? 0.5 : 1,
        display: "inline-flex", alignItems: "center", gap: 6, ...vs[v], ...style
      }}
    >
      {ch}
    </button>
  );
};

const Inp = ({ lb, val, set, type = "text", ph, ro }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
    {lb && <label style={{ fontSize: 11, fontWeight: 700, color: G.muted }}>{lb.toUpperCase()}</label>}
    <input 
      type={type} value={val || ""} onChange={e => set(e.target.value)} 
      placeholder={ph} readOnly={ro}
      style={{ border: `1.5px solid ${G.border}`, borderRadius: 8, padding: "10px", fontSize: 14, outline: "none" }}
    />
  </div>
);

// ── COMPONENTE CORRIGIDO: LISTA DE ESPERA ─────────────────────
function EsperaModal({ pats, dents, onSave, onClose }) {
  const [patId, setPatId] = useState("");
  const [dentId, setDentId] = useState("");
  const [proc, setProc] = useState("");
  const [tempo, setTempo] = useState("60");
  const [valido, setValido] = useState("");
  const [dias, setDias] = useState([]);
  const [slots, setSlots] = useState([]);

  const DIAS_SEM = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const handleSave = () => {
    // Validação crucial para evitar o erro de não finalizar
    if (!patId || !dentId || slots.length === 0) {
      alert("Selecione o paciente, o dentista e adicione os horários de preferência.");
      return;
    }

    const selecionado = pats.find(p => p.id === Number(patId));
    const dentista = dents.find(d => d.id === Number(dentId));

    const novaEntrada = {
      id: Date.now(),
      patientId: Number(patId),
      patName: selecionado ? selecionado.name : "Paciente não encontrado",
      dentId: Number(dentId),
      dentName: dentista ? dentista.name : "Dentista",
      proc,
      tempo: Number(tempo),
      valido,
      slots,
      criado: new Date().toISOString().split("T")[0]
    };

    onSave(novaEntrada);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 450, overflow: "hidden" }}>
        <div style={{ background: "#7B1FA2", padding: "16px", color: "#fff", fontWeight: 700 }}>⏳ Adicionar à Lista de Espera</div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
          
          <label style={{ fontSize: 11, fontWeight: 700 }}>PACIENTE</label>
          <select value={patId} onChange={e => setPatId(e.target.value)} style={{ padding: "10px", borderRadius: 8, border: `1.5px solid ${G.border}` }}>
            <option value="">Selecione o paciente...</option>
            {pats.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <label style={{ fontSize: 11, fontWeight: 700 }}>DENTISTA</label>
          <select value={dentId} onChange={e => setDentId(e.target.value)} style={{ padding: "10px", borderRadius: 8, border: `1.5px solid ${G.border}` }}>
            <option value="">Selecione o dentista...</option>
            {dents.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <Inp lb="Procedimento" val={proc} set={setProc} ph="Ex: Implante" />
          <Inp lb="Validade do Lembrete" type="date" val={valido} set={setValido} />

          <div style={{ background: "#f9f9f9", padding: 10, borderRadius: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700 }}>HORÁRIOS DE PREFERÊNCIA</label>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
              {DIAS_SEM.map((d, i) => (
                <button 
                  key={d} 
                  onClick={() => setDias(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                  style={{ padding: "6px 10px", borderRadius: 6, border: "none", fontSize: 12, background: dias.includes(i) ? "#7B1FA2" : "#eee", color: dias.includes(i) ? "#fff" : "#333" }}
                >
                  {d}
                </button>
              ))}
            </div>
            <Btn 
              ch="+ Adicionar Período" sm v="g" style={{ marginTop: 10, width: "100%" }}
              onClick={() => {
                if(dias.length === 0) return alert("Selecione os dias");
                setSlots([...slots, { dias }]);
                setDias([]);
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Btn ch="Cancelar" v="g" onClick={onClose} style={{ flex: 1 }} />
            <Btn ch="Salvar na Lista" onClick={handleSave} style={{ flex: 1, background: "#7B1FA2" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL (ESTRUTURA) ───────────────────────────
export default function App() {
  const [user, setUser] = useState({ name: "Admin", level: 3 });
  const [view, setView] = useState("dash");
  const [pats, setPats] = useState([{ id: 1, name: "Ana Costa", folder: "F-001" }]);
  const [dents, setDents] = useState([{ id: 1, name: "Dr. Diego", color: "#1B5E4A" }]);
  const [espera, setEspera] = useState([]);
  const [showEspModal, setShowEspModal] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* Sidebar Simples */}
      <div className="sidebar" style={{ background: G.primary, color: "#fff", padding: 20 }}>
        <h2 style={{ marginBottom: 20, fontFamily: 'Cormorant Garamond' }}>Affonso Odonto</h2>
        <div onClick={() => setView("dash")} style={{ cursor: "pointer", padding: "10px 0" }}>🏠 Home</div>
        <div onClick={() => setShowEspModal(true)} style={{ cursor: "pointer", padding: "10px 0", color: "#E3EFE9" }}>⏳ Lista de Espera</div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, padding: 25 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond' }}>{view === "dash" ? "Dashboard" : "Lista de Espera"}</h1>
        
        {/* Lista de Espera Ativa no Dashboard */}
        <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
          {espera.length === 0 && <p>Nenhum paciente aguardando.</p>}
          {espera.map(e => (
            <div key={e.id} style={{ background: "#fff", padding: 15, borderRadius: 12, borderLeft: `5px solid #7B1FA2`, boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 700 }}>{e.patName}</div>
              <div style={{ fontSize: 13, color: G.muted }}>{e.proc} com {e.dentName}</div>
              <div style={{ fontSize: 11, marginTop: 5, color: "#7B1FA2" }}>Válido até: {e.valido}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Corrigido */}
      {showEspModal && (
        <EsperaModal 
          pats={pats} 
          dents={dents} 
          onClose={() => setShowEspModal(false)}
          onSave={(item) => {
            setEspera([...espera, item]);
            setShowEspModal(false);
          }}
        />
      )}
    </div>
  );
}
