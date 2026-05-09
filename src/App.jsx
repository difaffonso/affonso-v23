import React, { useState, useEffect } from "react";

// ── 1. CONFIGURAÇÕES GERAIS, TEMAS E ESTILOS ─────────────────
const G = {
  bg: "#EEF3F0", card: "#FFF", primary: "#1B5E4A", accent: "#E3EFE9", 
  accentDark: "#A8D5C0", text: "#162420", muted: "#6B8880", red: "#C0392B", 
  yellow: "#D68910", blue: "#1A5276", purple: "#6C3483", border: "#D5E8DF", 
  success: "#1E8449", orange: "#CA6F1E", gold: "#B7950B",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${G.bg}; color: ${G.text}; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: ${G.accentDark}; border-radius: 3px; }
  .fi { animation: fi .2s ease } @keyframes fi { from { opacity: 0; transform: translateY(5px) } to { opacity: 1; transform: none } }
  
  @media(min-width: 640px) { 
    .sidebar { width: 200px; flex-shrink: 0; position: sticky; top: 0; height: 100vh; } 
    .mobile-topbar, .bottom-nav { display: none !important; } 
  }
  @media(max-width: 639px) { 
    .sidebar { position: fixed; left: 0; top: 0; height: 100vh; z-index: 1000; width: 240px; transition: 0.3s; } 
    .sidebar.closed { transform: translateX(-100%); }
    .main-content { padding-bottom: 80px; }
  }
`;

// ── 2. AUXILIARES E COMPONENTES DE UI ────────────────────────
const fmt = d => d ? new Date(d + "T12:00").toLocaleDateString("pt-BR") : "—";
const cur = v => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().split("T")[0];

const Btn = ({ ch, onClick, v = "p", sm, style, dis }) => {
  const vs = {
    p: { background: G.primary, color: "#fff" },
    g: { background: "transparent", color: G.primary, border: `1.5px solid ${G.primary}` },
    r: { background: G.red, color: "#fff" },
    w: { background: "#25D366", color: "#fff" },
    y: { background: G.yellow, color: "#fff" },
    purp: { background: "#7B1FA2", color: "#fff" }
  };
  return (
    <button disabled={dis} onClick={onClick} style={{
      border: "none", borderRadius: 8, fontWeight: 700, cursor: dis ? "not-allowed" : "pointer",
      padding: sm ? "6px 12px" : "12px 20px", fontSize: sm ? 12 : 14, opacity: dis ? 0.5 : 1,
      display: "inline-flex", alignItems: "center", gap: 6, transition: "0.2s", ...vs[v], ...style
    }}>{ch}</button>
  );
};

// ── 3. MODAIS ESPECÍFICOS (CORREÇÃO DA LISTA DE ESPERA) ───────
function EsperaModal({ pats, dents, onSave, onClose }) {
  const [patId, setPatId] = useState("");
  const [dentId, setDentId] = useState("");
  const [proc, setProc] = useState("");
  const [valido, setValido] = useState("");
  const [dias, setDias] = useState([]);
  const DIAS_SEM = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const handleSave = () => {
    if (!patId || !dentId || !proc || !valido || dias.length === 0) {
      alert("Preencha todos os campos e selecione ao menos um dia.");
      return;
    }
    const p = pats.find(x => x.id === Number(patId));
    const d = dents.find(x => x.id === Number(dentId));

    onSave({
      id: Date.now(),
      patientId: Number(patId),
      patName: p ? p.name : "Paciente",
      dentId: Number(dentId),
      dentName: d ? d.name : "Dentista",
      proc,
      valido,
      dias: dias.map(i => DIAS_SEM[i]),
      status: "Aguardando"
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="fi" style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 450, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
        <div style={{ background: "#7B1FA2", padding: 18, color: "#fff", fontWeight: 700, fontSize: 16 }}>⏳ Nova Entrada na Lista de Espera</div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 15 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, display: "block", marginBottom: 5 }}>PACIENTE</label>
            <select value={patId} onChange={e => setPatId(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, border: `1.5px solid ${G.border}`, outline: "none" }}>
              <option value="">Selecionar Paciente...</option>
              {pats.map(p => <option key={p.id} value={p.id}>{p.name} ({p.folder})</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, display: "block", marginBottom: 5 }}>DENTISTA PREFERENCIAL</label>
            <select value={dentId} onChange={e => setDentId(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, border: `1.5px solid ${G.border}`, outline: "none" }}>
              <option value="">Qualquer Dentista</option>
              {dents.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, display: "block", marginBottom: 5 }}>PROCEDIMENTO</label>
              <input value={proc} onChange={e => setProc(e.target.value)} placeholder="Ex: Limpeza" style={{ width: "100%", padding: 12, borderRadius: 10, border: `1.5px solid ${G.border}`, outline: "none" }} />
            </div>
            <div style={{ flex: 1.5 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, display: "block", marginBottom: 5 }}>LIMITE</label>
              <input type="date" value={valido} onChange={e => setValido(e.target.value)} style={{ width: "100%", padding: 11, borderRadius: 10, border: `1.5px solid ${G.border}`, outline: "none" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, display: "block", marginBottom: 5 }}>DIAS DISPONÍVEIS</label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {DIAS_SEM.map((d, i) => (
                <button key={d} onClick={() => setDias(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                style={{ padding: "8px 10px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: dias.includes(i) ? "#7B1FA2" : "#eee", color: dias.includes(i) ? "#fff" : "#666" }}>{d}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
            <Btn ch="Cancelar" v="g" onClick={onClose} style={{ flex: 1 }} />
            <Btn ch="Salvar Espera" v="purp" onClick={handleSave} style={{ flex: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 4. VISÃO: DASHBOARD ──────────────────────────────────────
function Dashboard({ pats, appts, recs, espera, setView }) {
  const t = today();
  const hojeAppts = appts.filter(a => a.date === t);
  const finMes = recs.filter(r => r.date.startsWith(t.slice(0, 7))).reduce((acc, curr) => acc + Number(curr.paid), 0);

  return (
    <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header>
        <h1 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 32 }}>Affonso Odontologia</h1>
        <p style={{ color: G.muted }}>Bem-vindo ao painel de controle clínico.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15 }}>
        <div style={{ background: G.primary, color: "#fff", padding: 20, borderRadius: 15 }}>
          <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700 }}>PACIENTES</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{pats.length}</div>
        </div>
        <div style={{ background: G.blue, color: "#fff", padding: 20, borderRadius: 15 }}>
          <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700 }}>AGENDA HOJE</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{hojeAppts.length}</div>
        </div>
        <div style={{ background: "#7B1FA2", color: "#fff", padding: 20, borderRadius: 15 }}>
          <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700 }}>EM ESPERA</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{espera.length}</div>
        </div>
        <div style={{ background: G.success, color: "#fff", padding: 20, borderRadius: 15 }}>
          <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700 }}>RECEITA MÊS</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{cur(finMes)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        <section style={{ background: "#fff", borderRadius: 15, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
            <h3 style={{ fontWeight: 700 }}>⏳ Lista de Espera Ativa</h3>
            <Btn ch="+ Ver Todos" sm v="g" onClick={() => setView("espera")} />
          </div>
          {espera.length === 0 ? <p style={{ fontSize: 13, color: G.muted }}>Nenhum paciente aguardando vaga.</p> : 
            espera.slice(0, 3).map(e => (
              <div key={e.id} style={{ padding: "10px 0", borderBottom: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{e.patName}</div>
                  <div style={{ fontSize: 12, color: G.muted }}>{e.proc} • Pref: {e.dentName}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7B1FA2" }}>{e.dias.join(", ")}</div>
                  <div style={{ fontSize: 10, color: G.red }}>Vence: {fmt(e.valido)}</div>
                </div>
              </div>
            ))
          }
        </section>
      </div>
    </div>
  );
}

// ── 5. COMPONENTE RAIZ (ESTRUTURA COMPLETA) ───────────────────
export default function App() {
  const [user, setUser] = useState({ name: "Dr. Diego", level: 3 });
  const [view, setView] = useState("dash");
  const [sideOpen, setSideOpen] = useState(false);

  // Estados Globais
  const [pats, setPats] = useState([
    { id: 1, name: "Ana Maria Silva", folder: "F-102", phone: "11988887777" },
    { id: 2, name: "Carlos Eduardo", folder: "F-105", phone: "11977776666" }
  ]);
  const [dents, setDents] = useState([
    { id: 1, name: "Dr. Diego Affonso", color: "#1B5E4A" },
    { id: 2, name: "Dra. Mariana Souza", color: "#1A5276" }
  ]);
  const [appts, setAppts] = useState([]);
  const [recs, setRecs] = useState([]);
  const [espera, setEspera] = useState([]);
  const [showEspModal, setShowEspModal] = useState(false);

  // Navegação
  const NavItem = ({ id, label, icon }) => (
    <div onClick={() => { setView(id); setSideOpen(false); }} style={{
      padding: "12px 15px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
      background: view === id ? "rgba(255,255,255,0.15)" : "transparent",
      color: "#fff", fontWeight: view === id ? 700 : 400, fontSize: 13, marginBottom: 5, transition: "0.2s"
    }}>
      <span>{icon}</span> {label}
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* Sidebar Overlay */}
      {sideOpen && <div onClick={() => setSideOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 900 }} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sideOpen ? "open" : "closed"}`} style={{ background: `linear-gradient(180deg, ${G.primary}, #051A10)`, padding: 15 }}>
        <div style={{ padding: "10px 0 30px", textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>🦷</div>
          <div style={{ color: "#fff", fontFamily: "'Cormorant Garamond'", fontWeight: 700, fontSize: 18 }}>Affonso Odonto</div>
        </div>
        
        <NavItem id="dash" label="Dashboard" icon="🏠" />
        <NavItem id="agenda" label="Agenda" icon="📅" />
        <NavItem id="pats" label="Pacientes" icon="👥" />
        <NavItem id="espera" label="Lista de Espera" icon="⏳" />
        <NavItem id="fin" label="Financeiro" icon="💰" />
        
        <div style={{ marginTop: "auto", padding: 10, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
          <div style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{user.name}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 9 }}>Administrador</div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-content" style={{ flex: 1, padding: "20px", position: "relative" }}>
        
        {/* Mobile Header */}
        <div className="mobile-topbar" style={{ background: G.primary, color: "#fff", padding: 15, display: "flex", alignItems: "center", gap: 15, margin: "-20px -20px 20px" }}>
          <button onClick={() => setSideOpen(true)} style={{ background: "none", border: "none", color: "#fff", fontSize: 24 }}>☰</button>
          <div style={{ fontWeight: 700 }}>Affonso Odontologia</div>
        </div>

        {/* Views */}
        {view === "dash" && <Dashboard pats={pats} appts={appts} recs={recs} espera={espera} setView={setView} />}
        
        {view === "espera" && (
          <div className="fi">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 28 }}>Lista de Espera</h2>
              <Btn ch="+ Nova Vaga" v="purp" onClick={() => setShowEspModal(true)} />
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {espera.length === 0 ? <p style={{ color: G.muted }}>Nenhum paciente aguardando.</p> : 
                espera.map(e => (
                  <div key={e.id} style={{ background: "#fff", padding: 18, borderRadius: 15, borderLeft: `6px solid #7B1FA2`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#7B1FA2" }}>{e.patName}</div>
                      <div style={{ fontSize: 13, color: G.muted }}>{e.proc} • Dentista: {e.dentName}</div>
                      <div style={{ fontSize: 12, marginTop: 5, fontWeight: 700 }}>Disponibilidade: {e.dias.join(", ")}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Btn ch="✕" sm v="g" style={{ color: G.red, borderColor: G.red }} onClick={() => setEspera(prev => prev.filter(x => x.id !== e.id))} />
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Modais Ativados */}
        {showEspModal && (
          <EsperaModal 
            pats={pats} 
            dents={dents} 
            onClose={() => setShowEspModal(false)} 
            onSave={(item) => {
              setEspera(prev => [...prev, item]); // Garante o salvamento no sistema
              setShowEspModal(false); // Fecha o modal
            }} 
          />
        )}
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `1px solid ${G.border}`, display: "flex", justifyContent: "space-around", padding: "10px 0", zIndex: 800 }}>
        <button onClick={() => setView("dash")} style={{ background: "none", border: "none", fontSize: 20 }}>🏠</button>
        <button onClick={() => setView("agenda")} style={{ background: "none", border: "none", fontSize: 20 }}>📅</button>
        <button onClick={() => setView("espera")} style={{ background: "none", border: "none", fontSize: 20 }}>⏳</button>
        <button onClick={() => setView("fin")} style={{ background: "none", border: "none", fontSize: 20 }}>💰</button>
      </nav>
    </div>
  );
}
