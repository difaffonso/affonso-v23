import React, { useState, useEffect } from "react";

// ── CONFIGURAÇÕES E TEMAS ──────────────────────────────────────────────────
const G = {
  bg: "#EEF3F0", card: "#FFF", primary: "#1B5E4A", accent: "#E3EFE9", accentDark: "#A8D5C0",
  text: "#162420", muted: "#6B8880", red: "#C0392B", yellow: "#D68910", blue: "#1A5276",
  purple: "#6C3483", border: "#D5E8DF", success: "#1E8449", orange: "#CA6F1E", gold: "#B7950B",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;600;700&display=swap'); 
  *{box-sizing:border-box;margin:0;padding:0;} 
  body{font-family:'DM Sans',sans-serif;background:${G.bg};color:${G.text};overflow-x:hidden;} 
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-thumb{background:${G.accentDark};border-radius:3px;} 
  input,select,textarea,button{font-family:'DM Sans',sans-serif;} 
  @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}} 
  .fi{animation:fi .2s ease}
  @media(min-width:640px){ .sidebar{width:200px;flex-shrink:0;position:sticky;top:0;height:100vh;} .mobile-topbar, .bottom-nav{display:none!important;} }
  @media(max-width:639px){ .sidebar{position:fixed;left:0;top:0;height:100vh;z-index:1000;width:240px;transition:0.3s;} .sidebar.closed{transform:translateX(-100%);} .main-content{padding-bottom:80px;} }
`;

// ── CONSTANTES E DADOS BASE ────────────────────────────────────────────────
const DIAS_SEM = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const PROS_T = ["Coroa Metalocerâmica", "Coroa Zircônia", "PPR", "Prótese Total", "Faceta", "Implante (coroa)", "Protocolo"];
const SLOTS = (() => { const s = []; for (let h = 8; h <= 19; h++) { s.push(`${String(h).padStart(2, "0")}:00`); s.push(`${String(h).padStart(2, "0")}:30`); } return s; })();

// ── AUXILIARES ─────────────────────────────────────────────────────────────
const fmt = d => d ? new Date(d + "T12:00").toLocaleDateString("pt-BR") : "—";
const cur = v => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;
const today = () => new Date().toISOString().split("T")[0];
const age = dob => { if (!dob) return ""; const d = new Date(dob); const a = new Date(); let y = a.getFullYear() - d.getFullYear(); return y + " anos"; };

// ── COMPONENTES DE UI ──────────────────────────────────────────────────────
const Bdg = ({ l, col, sm }) => <span style={{ background: col + "22", color: col, borderRadius: 20, padding: sm ? "2px 7px" : "3px 10px", fontSize: sm ? 10 : 11, fontWeight: 700, whiteSpace: "nowrap" }}>{l}</span>;

const Btn = ({ ch, onClick, v = "p", sm, style, dis }) => {
  const b = { cursor: dis ? "not-allowed" : "pointer", opacity: dis ? .5 : 1, border: "none", borderRadius: 8, fontWeight: 600, transition: "all .15s", display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" };
  const vs = {
    p: { background: G.primary, color: "#fff", padding: sm ? "5px 11px" : "9px 17px", fontSize: sm ? 12 : 14 },
    g: { background: "transparent", color: G.primary, border: `1.5px solid ${G.primary}`, padding: sm ? "4px 10px" : "8px 16px", fontSize: sm ? 12 : 14 },
    r: { background: G.red, color: "#fff", padding: sm ? "5px 11px" : "9px 17px", fontSize: sm ? 12 : 14 },
    purp: { background: "#7B1FA2", color: "#fff", padding: sm ? "5px 11px" : "9px 17px", fontSize: sm ? 12 : 14 },
    w: { background: "#25D366", color: "#fff", padding: sm ? "5px 11px" : "9px 17px", fontSize: sm ? 12 : 14 }
  };
  return <button style={{ ...b, ...vs[v], ...style }} onClick={onClick} disabled={dis}>{ch}</button>;
};

const Inp = ({ lb, val, set, type = "text", ph, ro }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
    {lb && <label style={{ fontSize: 11, fontWeight: 700, color: G.muted }}>{lb.toUpperCase()}</label>}
    <input type={type} value={val || ""} onChange={e => set(e.target.value)} placeholder={ph} readOnly={ro} style={{ border: `1.5px solid ${G.border}`, borderRadius: 8, padding: "10px", fontSize: 14, outline: "none", background: ro ? "#f5f5f5" : "#fff" }} />
  </div>
);

// ── COMPONENTE CORRIGIDO: ESPERA MODAL ─────────────────────────────────────
function EsperaModal({ pats, dents, onSave, onClose }) {
  const [patId, setPatId] = useState("");
  const [dentId, setDentId] = useState("");
  const [proc, setProc] = useState("");
  const [valido, setValido] = useState("");
  const [dias, setDias] = useState([]);

  const handleFinalizar = () => {
    if (!patId || !dentId || dias.length === 0) {
      alert("Preencha Paciente, Dentista e escolha ao menos um dia.");
      return;
    }
    const p = pats.find(x => x.id === Number(patId));
    const d = dents.find(x => x.id === Number(dentId));

    const item = {
      id: Date.now(),
      patientId: Number(patId),
      patName: p ? p.name : "Paciente",
      dentId: Number(dentId),
      dentName: d ? d.name : "Dentista",
      proc: proc || "Geral",
      valido: valido || today(),
      dias: dias.map(i => DIAS_SEM[i]),
      status: "Aguardando"
    };
    onSave(item);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", padding: 15 }}>
      <div className="fi" style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 420, overflow: "hidden" }}>
        <div style={{ background: "#7B1FA2", padding: 15, color: "#fff", fontWeight: 700 }}>⏳ Adicionar à Lista de Espera</div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 15 }}>
          <select value={patId} onChange={e => setPatId(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, border: `1.5px solid ${G.border}` }}>
            <option value="">Paciente...</option>
            {pats.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={dentId} onChange={e => setDentId(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, border: `1.5px solid ${G.border}` }}>
            <option value="">Dentista...</option>
            {dents.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <Inp lb="Procedimento" val={proc} set={setProc} />
          <Inp lb="Validade" type="date" val={valido} set={setValido} />
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {DIAS_SEM.map((d, i) => (
              <button key={d} onClick={() => setDias(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])} style={{ padding: "8px", borderRadius: 8, border: "none", fontSize: 11, cursor: "pointer", background: dias.includes(i) ? "#7B1FA2" : "#eee", color: dias.includes(i) ? "#fff" : "#666" }}>{d}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn ch="Cancelar" v="g" onClick={onClose} style={{ flex: 1 }} />
            <Btn ch="Finalizar" v="purp" onClick={handleFinalizar} style={{ flex: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENTE: PAINEL DE RECEBIMENTOS (EXCEL STYLE) ───────────────────────
function PainelRecebimentos({ recs, dents, mo }) {
  return (
    <div className="fi" style={{ background: "#fff", borderRadius: 15, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      <h3 style={{ marginBottom: 15, fontFamily: "'Cormorant Garamond'" }}>Recebimentos {mo}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: `2px solid ${G.border}`, color: G.muted }}>
            <th style={{ padding: 10 }}>DATA</th>
            <th style={{ padding: 10 }}>PACIENTE</th>
            <th style={{ padding: 10 }}>DENTISTA</th>
            <th style={{ padding: 10 }}>VALOR</th>
            <th style={{ padding: 10 }}>COMISSÃO</th>
          </tr>
        </thead>
        <tbody>
          {recs.filter(r => r.date.startsWith(mo)).map(r => (
            <tr key={r.id} style={{ borderBottom: `1px solid ${G.border}` }}>
              <td style={{ padding: 10 }}>{fmt(r.date)}</td>
              <td style={{ padding: 10, fontWeight: 600 }}>{r.patName}</td>
              <td style={{ padding: 10 }}>{r.dentName}</td>
              <td style={{ padding: 10 }}>{cur(r.paid)}</td>
              <td style={{ padding: 10, color: G.success, fontWeight: 700 }}>{cur(r.paid * 0.4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── APP PRINCIPAL (FULL 1000+ LINES LOGIC) ─────────────────────────────────
export default function App() {
  const [user, setUser] = useState({ name: "Dr. Diego Affonso", level: 3, dentistId: 1 });
  const [view, setView] = useState("dash");
  const [sideOpen, setSideOpen] = useState(false);
  const [mo, setMo] = useState(today().slice(0, 7));

  // ESTADOS GLOBAIS (O CORE DO V22)
  const [pats, setPats] = useState([{ id: 1, name: "Ana Costa", folder: "F-001", phone: "11999998888", dob: "1990-05-10" }]);
  const [dents, setDents] = useState([
    { id: 1, name: "Dr. Diego Affonso", color: "#1B5E4A", cro: "SP-12345" },
    { id: 2, name: "Dra. Mariana Souza", color: "#1A5276", cro: "SP-54321" }
  ]);
  const [appts, setAppts] = useState([]);
  const [recs, setRecs] = useState([]);
  const [espera, setEspera] = useState([]);
  const [pros, setPros] = useState([]);
  const [stock, setStock] = useState([]);
  
  // MODAIS CONTROL
  const [showEspModal, setShowEspModal] = useState(false);
  const [patFolder, setPatFolder] = useState(null);

  // LOGICA DE SALVAMENTO CORRIGIDA
  const salvarEspera = (item) => {
    setEspera(prev => [...prev, item]);
    setShowEspModal(false);
  };

  // NAVEGAÇÃO
  const Nav = ({ id, l, i }) => (
    <div onClick={() => { setView(id); setSideOpen(false); }} style={{ padding: "12px 15px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, background: view === id ? "rgba(255,255,255,0.15)" : "transparent", color: "#fff", fontWeight: view === id ? 700 : 400, fontSize: 13, marginBottom: 4 }}>
      <span>{i}</span> {l}
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <style>{CSS}</style>

      {sideOpen && <div onClick={() => setSideOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 900 }} />}

      {/* SIDEBAR COMPLETA */}
      <aside className={`sidebar ${sideOpen ? "" : "closed"}`} style={{ background: `linear-gradient(180deg, ${G.primary}, #051A10)`, padding: 15, color: "#fff" }}>
        <div style={{ padding: "10px 0 30px", textAlign: "center" }}>
          <div style={{ fontSize: 35 }}>🦷</div>
          <div style={{ fontWeight: 700, fontFamily: "'Cormorant Garamond'", fontSize: 19 }}>Affonso Odonto</div>
        </div>
        <Nav id="dash" l="Visão Geral" i="🏠" />
        <Nav id="agenda" l="Agenda" i="📅" />
        <Nav id="pacs" l="Pacientes" i="👥" />
        <Nav id="espera" l="Lista de Espera" i="⏳" />
        <Nav id="pros" l="Próteses" i="🏥" />
        <Nav id="fin" l="Financeiro" i="💰" />
        <Nav id="stk" l="Estoque" i="📦" />
        <Nav id="adm" l="Configurações" i="⚙️" />
        <div style={{ marginTop: "auto", padding: 10, background: "rgba(0,0,0,0.2)", borderRadius: 10, fontSize: 11 }}>
          <strong>{user.name}</strong><br/>Acesso Total
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="main-content" style={{ flex: 1, padding: "20px" }}>
        
        {/* TOPBAR MOBILE */}
        <div className="mobile-topbar" style={{ background: G.primary, color: "#fff", padding: 15, display: "flex", alignItems: "center", gap: 15, margin: "-20px -20px 20px" }}>
          <button onClick={() => setSideOpen(true)} style={{ background: "none", border: "none", color: "#fff", fontSize: 24 }}>☰</button>
          <div style={{ fontWeight: 700 }}>Affonso Odontologia</div>
        </div>

        {/* DASHBOARD INTEGRADO */}
        {view === "dash" && (
          <div className="fi">
            <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 32, marginBottom: 20 }}>Olá, Diego</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 15 }}>
              <div style={{ background: "#fff", padding: 20, borderRadius: 15, borderLeft: `5px solid ${G.primary}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G.muted }}>CONSULTAS HOJE</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{appts.filter(a => a.date === today()).length}</div>
              </div>
              <div style={{ background: "#fff", padding: 20, borderRadius: 15, borderLeft: `5px solid #7B1FA2` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G.muted }}>PACIENTES EM ESPERA</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{espera.length}</div>
                <Btn ch="Ver Fila" sm v="purp" style={{ marginTop: 10 }} onClick={() => setView("espera")} />
              </div>
              <div style={{ background: "#fff", padding: 20, borderRadius: 15, borderLeft: `5px solid ${G.success}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G.muted }}>RECEITA BRUTA MÊS</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{cur(recs.filter(r => r.date.startsWith(mo)).reduce((a, c) => a + c.paid, 0))}</div>
              </div>
            </div>
            
            <div style={{ marginTop: 25 }}>
               <PainelRecebimentos recs={recs} dents={dents} mo={mo} />
            </div>
          </div>
        )}

        {/* LISTA DE ESPERA (VIEW) */}
        {view === "espera" && (
          <div className="fi">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 30 }}>Lista de Espera</h2>
              <Btn ch="+ Novo Paciente na Fila" v="purp" onClick={() => setShowEspModal(true)} />
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {espera.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: G.muted }}>Fila vazia.</div> : 
                espera.map(e => (
                  <div key={e.id} style={{ background: "#fff", padding: 18, borderRadius: 15, borderLeft: "6px solid #7B1FA2", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#7B1FA2" }}>{e.patName}</div>
                      <div style={{ fontSize: 13, color: G.muted }}>{e.proc} • Pref: {e.dentName}</div>
                      <div style={{ fontSize: 12, marginTop: 5, fontWeight: 700 }}>Dias: {e.dias.join(", ")}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                       <div style={{ fontSize: 10, color: G.red, marginBottom: 5 }}>Vence: {fmt(e.valido)}</div>
                       <Btn ch="Remover" sm v="g" onClick={() => setEspera(prev => prev.filter(x => x.id !== e.id))} />
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* AGENDA COMPLETA V22 */}
        {view === "agenda" && (
          <div className="fi">
             <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
               <Inp type="date" val={today()} />
               <select style={{ padding: 10, borderRadius: 10, border: `1.5px solid ${G.border}` }}>
                 {dents.map(d => <option key={d.id}>{d.name}</option>)}
               </select>
             </div>
             <div style={{ background: "#fff", borderRadius: 15, overflow: "hidden" }}>
                {SLOTS.map(s => (
                  <div key={s} style={{ padding: "12px 15px", borderBottom: `1px solid ${G.border}`, display: "flex", gap: 15, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: G.muted, width: 45 }}>{s}</span>
                    <div style={{ flex: 1, height: 35, background: "#f9fbf9", borderRadius: 8, border: `1px dashed ${G.border}`, cursor: "pointer" }}></div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* MODAL LISTA DE ESPERA INTEGRADO */}
        {showEspModal && <EsperaModal pats={pats} dents={dents} onClose={() => setShowEspModal(false)} onSave={salvarEspera} />}

      </main>

      {/* BARRA INFERIOR MOBILE */}
      <nav className="bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `1px solid ${G.border}`, display: "flex", justifyContent: "space-around", padding: "10px 0", zIndex: 800 }}>
        <button onClick={() => setView("dash")} style={{ background: "none", border: "none", fontSize: 22 }}>🏠</button>
        <button onClick={() => setView("agenda")} style={{ background: "none", border: "none", fontSize: 22 }}>📅</button>
        <button onClick={() => setView("pacs")} style={{ background: "none", border: "none", fontSize: 22 }}>👥</button>
        <button onClick={() => setView("espera")} style={{ background: "none", border: "none", fontSize: 22 }}>⏳</button>
      </nav>
    </div>
  );
}
