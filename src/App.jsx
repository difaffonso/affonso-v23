import { useState, useEffect } from "react";

// =============================================================================
// CONSTANTES GLOBAIS DE ESTILO E CONFIGURAÇÃO
// =============================================================================
const G = {
  bg: "#EEF3F0", card: "#FFF", primary: "#1B5E4A", accent: "#E3EFE9", accentDark: "#A8D5C0",
  text: "#162420", muted: "#6B8880", red: "#C0392B", yellow: "#D68910", blue: "#1A5276",
  purple: "#6C3483", border: "#D5E8DF", success: "#1E8449", orange: "#CA6F1E", gold: "#B7950B",
};

const PERMS0 = {
  1: {
    label: "Dentista", color: "#1B5E4A",
    items: [
      { id: "agenda_own", label: "Ver sua agenda", val: true, fixed: true },
      { id: "prontuario", label: "Prontuário dos seus pacientes", val: true, fixed: true },
      { id: "anamnese", label: "Preencher anamnese do paciente", val: true, fixed: true },
      { id: "baixa", label: "Dar baixa nos procedimentos", val: true, fixed: true },
      { id: "historico", label: "Registrar atendimentos/histórico", val: true, fixed: true },
      { id: "receituario", label: "Emitir receituário", val: true, fixed: true },
      { id: "orcamento_own", label: "Criar orçamentos dos seus pacientes", val: true, fixed: true },
      { id: "relatorio_own", label: "Ver seu relatório de produção", val: true, fixed: true },
      { id: "lembretes_own", label: "Ver lembretes relacionados a você", val: true, fixed: true },
      { id: "implantes_own", label: "Ver seus casos de implantes", val: true, fixed: true },
      { id: "proteses_own", label: "Ver suas próteses", val: true, fixed: true },
      { id: "agenda_all", label: "Ver agenda de todos os dentistas", val: false, fixed: false },
      { id: "pats_all", label: "Acessar todos os pacientes", val: false, fixed: false },
      { id: "financeiro", label: "Ver financeiro dos pacientes", val: false, fixed: false },
      { id: "lembretes_all", label: "Ver todos os lembretes", val: false, fixed: false },
      { id: "relatorio_all", label: "Ver relatórios de todos dentistas", val: false, fixed: false },
      { id: "admin", label: "Acessar Administrativo", val: false, fixed: true },
    ]
  },
  2: {
    label: "Recepção / Secretária", color: "#E65100",
    items: [
      { id: "agenda_all", label: "Agendar e gerenciar consultas", val: true, fixed: true },
      { id: "pats_all", label: "Cadastrar e editar pacientes", val: true, fixed: true },
      { id: "anamnese", label: "Enviar anamnese por WhatsApp", val: true, fixed: true },
      { id: "wa", label: "Enviar WhatsApp aos pacientes", val: true, fixed: true },
      { id: "lembretes_all", label: "Gerenciar todos os lembretes", val: true, fixed: true },
      { id: "receituario", label: "Imprimir receituário", val: true, fixed: true },
      { id: "orcamento", label: "Criar e editar orçamentos", val: true, fixed: true },
      { id: "implantes", label: "Acessar próteses e implantes", val: true, fixed: true },
      { id: "financeiro", label: "Ver financeiro dos pacientes", val: true, fixed: false },
      { id: "relatorio_dent", label: "Ver relatório de dentistas", val: true, fixed: false },
      { id: "recebimentos", label: "Ver recebimentos dos dentistas", val: false, fixed: false },
      { id: "financeiro_geral", label: "Ver relatório financeiro geral", val: false, fixed: false },
      { id: "admin", label: "Acessar Administrativo", val: false, fixed: true },
    ]
  },
  3: {
    label: "Administrador", color: "#4A148C",
    items: [
      { id: "all", label: "Acesso total ao sistema", val: true, fixed: true },
      { id: "agenda_all", label: "Ver e editar todas as agendas", val: true, fixed: true },
      { id: "pats_all", label: "Todos os pacientes", val: true, fixed: true },
      { id: "financeiro_geral", label: "Financeiro geral da clínica", val: true, fixed: true },
      { id: "recebimentos", label: "Recebimentos e comissões dentistas", val: true, fixed: true },
      { id: "relatorios", label: "Todos os relatórios", val: true, fixed: true },
      { id: "orcamentos", label: "Todos os orçamentos", val: true, fixed: true },
      { id: "implantes", label: "Próteses e implantes", val: true, fixed: true },
      { id: "lembretes_all", label: "Todos os lembretes", val: true, fixed: true },
      { id: "funcionarios", label: "Gerenciar funcionários e logins", val: true, fixed: true },
      { id: "horarios", label: "Configurar horários dos dentistas", val: true, fixed: true },
      { id: "config", label: "Configurações do sistema", val: true, fixed: true },
      { id: "admin", label: "Acessar Administrativo", val: true, fixed: true },
    ]
  },
};

const MOTIVOS_REM = ["Desistiu do tratamento", "Mudou de clínica", "Problema financeiro", "Sem retorno (não responde)", "Outros"];
const WA_TOKEN = "EAASoAO9Ee4ABRTNwUDnXlghZCcevkhVNHyiAqhGerNbze52YXkqvBONwFF6cd99nMZBxg5BNicySfOl0ejRR6948F0EVyIMsZCmceUQwksoGtOLQqD6So8CoD9fCC6CU4AnBw7LCFmQkDmPQ7ONukHChhKYrVrogIeAi8cnLfrlpxVU3hgOnY0zhVQmAX9gaVKe0AysKqrSooV209UDHQTyoaO1k49j4m0pph6VTW4KlkyziYhfX8nxGaNVkd7qkxZARtEkgaeQaXzpV3kXsucHF";
const WA_PHONE_ID = "1149169951604986";

const WA_API = async function (to, msg) {
  var phone = to.replace(/[^0-9]/g, "");
  if (phone.length === 11) phone = "55" + phone;
  else if (phone.length === 10) phone = "5511" + phone;
  try {
    var r = await fetch("https://graph.facebook.com/v18.0/" + WA_PHONE_ID + "/messages", {
      method: "POST",
      headers: { "Authorization": "Bearer " + WA_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: phone, type: "text", text: { body: msg } })
    });
    var d = await r.json();
    if (d.error) { console.error("WA error:", d.error.message); return false; }
    return true;
  } catch (e) { console.error("WA fetch error:", e); return false; }
};

const ANAM_LINK = "https://claude.ai/public/artifacts/134f3434-6997-4396-ab62-3d37bae9d44e";
const UCOLS = ["#1B5E4A", "#6C3483", "#1A5276", "#CA6F1E", "#C0392B", "#148F77", "#D68910"];
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{font-family:'DM Sans',sans-serif;background:${G.bg};color:${G.text};} ::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-thumb{background:${G.accentDark};border-radius:3px;} input,select,textarea,button{font-family:'DM Sans',sans-serif;} @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}} .fi{animation:fi .2s ease}`;

const PAY = ["Dinheiro", "PIX", "Cartão Crédito", "Cartão Débito", "Convênio", "Cheque"];
const SL = { confirmed: "Confirmado", pending: "Pendente", done: "Realizado", cancelled: "Cancelado", missed: "Faltou", rescheduled: "Desmarcado" };
const SC = { confirmed: "#2E7D4F", pending: "#E07B20", done: "#6B8880", cancelled: "#C0392B", missed: "#C0392B", rescheduled: "#7F8C8D" };
const SC_BG = { confirmed: "#E8F5EE", pending: "#FEF3E2", done: "#F2F4F3", cancelled: "#FDECEA", missed: "#FDECEA", rescheduled: "#F2F3F4" };
const PROS_T = ["Coroa Metalocerâmica", "Coroa Zircônia", "Coroa Porcelana", "PPR", "PPF", "Prótese Total", "Faceta", "Inlay/Onlay", "Implante (coroa)", "Protocolo", "Outro"];
const PROS_SL = { waiting: "Aguardando", returned: "Retornou", placed: "Instalada", remake: "Refazer" };
const PROS_SC = { waiting: G.yellow, returned: G.blue, placed: G.success, remake: G.red };
const IMPL_ST = ["Extração", "Enxerto", "Implante", "Prótese", "Controle"];

const SLOTS = (() => {
  const s = [];
  for (let h = 8; h <= 19; h++) {
    if (h === 8) s.push("08:30");
    else {
      s.push(`${String(h).padStart(2, "0")}:00`);
      if (h < 19) s.push(`${String(h).padStart(2, "0")}:30`);
    }
  }
  return s;
})();

const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const EXPENSE_CATS = ["Aluguel", "Água", "Luz", "Internet", "Telefone", "Salários", "Material", "Equipamento", "Manutenção", "Contabilidade", "Outros"];

// ── Seeds ──────────────────────────────────────────────────
const USERS0 = [
  { id: 1, name: "Dr. Diego Affonso", role: "Admin", level: 3, login: "admin", pass: "1234", dentistId: 1, color: UCOLS[0], active: true },
  { id: 2, name: "Fernanda", role: "Recepcionista", level: 2, login: "fernanda", pass: "1234", dentistId: null, color: UCOLS[1], active: true },
  { id: 3, name: "Dra. Mariana Souza", role: "Dentista", level: 1, login: "mariana", pass: "1234", dentistId: 2, color: UCOLS[2], active: true },
];

const DENTS0 = [
  { id: 1, name: "Dr. Diego Affonso", color: UCOLS[0], specialty: "Clínico Geral", commission: 40, cro: "SP-72.278", dias: [1, 2, 3, 4, 5], entrada: "08:00", saida: "18:00", almoco: { ini: "12:00", fim: "13:00" } },
  { id: 2, name: "Dra. Mariana Souza", color: UCOLS[2], specialty: "Ortodontia", commission: 40, cro: "SP-00000", dias: [1, 2, 3, 4, 5], entrada: "08:00", saida: "18:00", almoco: { ini: "12:00", fim: "13:00" } },
  { id: 3, name: "Dr. Pedro Lima", color: UCOLS[3], specialty: "Implantodontia", commission: 40, cro: "SP-00000", dias: [1, 3, 5], entrada: "08:00", saida: "18:00", almoco: { ini: "12:00", fim: "13:00" } },
];

const LABS0 = [
  { id: 1, name: "Lab Dental Souza", phone: "1133334444", contact: "João Souza" },
  { id: 2, name: "Studio Protético Alves", phone: "1144445555", contact: "Carlos Alves" },
];

const PROCS0 = [
  { id: 1, name: "Consulta", price: 150 }, { id: 2, name: "Limpeza", price: 180 }, { id: 3, name: "Restauração", price: 280 },
  { id: 4, name: "Canal", price: 900 }, { id: 5, name: "Extração", price: 250 }, { id: 6, name: "Cirurgia", price: 600 },
  { id: 7, name: "Clareamento", price: 700 }, { id: 8, name: "Implante", price: 3500 }, { id: 9, name: "Ortodontia", price: 300 },
  { id: 10, name: "Prótese", price: 1200 }, { id: 11, name: "Radiografia", price: 80 },
];

const PROS_PROCS0 = [
  { id: 1, name: "Instalação de Coroa" }, { id: 2, name: "Instalação de Prótese Total" },
  { id: 3, name: "Instalação de Faceta" }, { id: 4, name: "Ajuste de Prótese" }, { id: 5, name: "Cimentação" },
];

const PATS0 = [
  {
    id: 1, name: "Ana Costa", dob: "1990-04-29", genero: "F", phone: "11998123456", email: "ana@email.com", cpf: "123.456.789-00", rg: "", blood: "A+", allergy: "Nenhuma", insurance: "Unimed", notes: "Paciente hipertensa em uso de captopril.", folder: "F-0001", rx: "RX-2024-001", nf: "", obs: "",
    anamnese: { hypertension: false, diabetes: false, heartDisease: false, bleeding: false, allergicMeds: "", otherConditions: "Hipertensão arterial", medications: "Captopril 25mg", pregnant: false, smoking: false, notes: "" }
  },
  {
    id: 2, name: "Bruno Martins", dob: "1985-07-22", genero: "M", phone: "11976543210", email: "bruno@email.com", cpf: "987.654.321-00", rg: "", blood: "O-", allergy: "Penicilina", insurance: "", notes: "", folder: "F-0002", rx: "RX-2024-002", nf: "", obs: "ALÉRGICO A PENICILINA — verificar antes de medicar",
    anamnese: { hypertension: false, diabetes: true, heartDisease: false, bleeding: false, allergicMeds: "Penicilina", otherConditions: "Diabetes tipo 2", medications: "Metformina", pregnant: false, smoking: false, notes: "" }
  },
  {
    id: 3, name: "Carla Lima", dob: "2001-11-05", genero: "F", phone: "11912345678", email: "", cpf: "456.789.123-00", rg: "", blood: "B+", allergy: "Nenhuma", insurance: "", notes: "", folder: "F-0003", rx: "RX-2024-003", nf: "", obs: "",
    anamnese: { hypertension: false, diabetes: false, heartDisease: false, bleeding: false, osteoporosis: false, kidneyDisease: false, liverDisease: false, thyroid: false, epilepsy: false, cancer: false, pregnant: false, smoking: false, allergicMeds: "", otherConditions: "", medications: "", notes: "" }
  },
];

const APPTS0 = [
  { id: 1, patientId: 1, dentistId: 1, date: "2026-04-29", time: "08:30", procedure: "Limpeza", treatment: "Profilaxia semestral", status: "confirmed", notes: "", value: 180, payment: "PIX" },
  { id: 2, patientId: 2, dentistId: 1, date: "2026-04-29", time: "10:00", procedure: "Restauração", treatment: "Restauração dente 36", status: "pending", notes: "", value: 280, payment: "Dinheiro" },
  { id: 3, patientId: 3, dentistId: 2, date: "2026-04-30", time: "14:00", procedure: "Ortodontia", treatment: "Ativação de aparelho", status: "confirmed", notes: "", value: 300, payment: "Cartão Crédito" },
  { id: 4, patientId: 1, dentistId: 1, date: "2026-05-05", time: "09:00", procedure: "Clareamento", treatment: "", status: "pending", notes: "", value: 700, payment: "PIX" },
];

const RECS0 = [
  { id: 1, patientId: 1, date: "2026-03-10", procedure: "Limpeza", tooth: "Geral", dentistId: 1, obs: "Sem intercorrências", rx: "", paid: 180, payment: "PIX", closed: true, inst: 1, instM: [] },
  { id: 2, patientId: 2, date: "2026-04-28", procedure: "Cirurgia", tooth: "38", dentistId: 1, obs: "Extração siso inferior esquerdo", rx: "Amoxicilina 500mg", paid: 600, payment: "Cartão Crédito", closed: true, inst: 3, instM: ["2026-05", "2026-06", "2026-07"] },
  { id: 3, patientId: 3, date: "2025-10-29", procedure: "Limpeza", tooth: "Geral", dentistId: 1, obs: "Controle semestral", rx: "", paid: 180, payment: "Dinheiro", closed: true, inst: 1, instM: [] },
];

const TREATS0 = [{ id: 1, patientId: 2, name: "Tratamento de Canal", items: [{ desc: "1ª Sessão", value: 400, paid: true, paidDate: "2026-03-20" }, { desc: "2ª Sessão", value: 400, paid: false }, { desc: "Obturação", value: 300, paid: false }], start: "2026-03-20", payments: [{ id: 1, date: "2026-03-20", value: 400, method: "PIX", note: "1ª parcela" }] }];

const BUDGETS0 = [{ id: 1, patientId: 1, date: "2026-03-01", items: [{ d: "Clareamento", v: 600 }, { d: "Limpeza", v: 180 }], status: "approved", notes: "", disc: 0, attach: "" }];

const PROS0 = [
  { id: 1, patientId: 1, dentistId: 1, labId: 1, type: "Coroa Metalocerâmica", proc: "Instalação de Coroa", tooth: "16", sent: "2026-04-10", due: "2026-04-29", returned: "", status: "waiting", notes: "Cor A2", price: 350 },
  { id: 2, patientId: 2, dentistId: 1, labId: 1, type: "Coroa Zircônia", proc: "Instalação de Coroa", tooth: "21", sent: "2026-04-15", due: "2026-04-29", returned: "", status: "waiting", notes: "Cor B1", price: 580 },
];

const REMS0 = [{ id: 1, title: "Confirmar consulta Ana", desc: "Ligar para confirmar", date: "2026-04-29", priority: "high", done: false, patientId: 1, assignedUserId: 2 }];

const STOCK0 = [
  { id: 1, name: "Luvas P (cx)", qty: 5, unit: "cx", min: 2, price: 28.5, movs: [{ t: "in", q: 10, date: "2026-04-01", note: "Compra" }] },
  { id: 2, name: "Resina Composta A2", qty: 8, unit: "un", min: 3, price: 89, movs: [{ t: "in", q: 10, date: "2026-04-01", note: "Compra" }] },
];

const IMPL0 = [
  { id: 1, patientId: 1, notes: "Implante unitário dente 16", months: { "2026-02": { "Cirurgia": "IMPLANTE", "Obs.": "Extraído fev" }, "2026-04": { "Implante": "IMPLANTE" }, "2026-07": { "Prótese": "PRÓTESE" } } },
  { id: 2, patientId: 2, notes: "Dente 21", months: { "2026-03": { "Enxerto": "ENXERTO" }, "2026-05": { "Implante": "IMPLANTE" } } },
];

const EXPENSES0 = {
  clinic: [
    { id: 1, date: "2026-04-05", cat: "Aluguel", desc: "Aluguel consultório abril", value: 3500, paid: true },
    { id: 2, date: "2026-04-10", cat: "Água", desc: "Conta água março", value: 120, paid: true },
    { id: 3, date: "2026-04-10", cat: "Luz", desc: "Conta luz março", value: 280, paid: false },
  ],
  personal: [
    { id: 1, date: "2026-04-01", cat: "Moradia", desc: "Aluguel residencial", value: 2200, paid: true },
    { id: 2, date: "2026-04-15", cat: "Alimentação", desc: "Supermercado", value: 650, paid: true },
  ]
};

// ── Helpers ────────────────────────────────────────────────
const fmt = d => d ? new Date(d + "T12:00").toLocaleDateString("pt-BR") : "—";
const today = () => new Date().toISOString().split("T")[0];
const yest = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split("T")[0]; };
const tom = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; };
const cur = v => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;
const nid = a => a.length ? Math.max(...a.map(x => x.id)) + 1 : 1;
const mkLog = function (logs, setLogs, user, tipo, desc, patName) {
  var entry = { id: Date.now(), ts: new Date().toISOString(), user: user && user.name || "Sistema", tipo: tipo, desc: desc, patName: patName || "" };
  setLogs(function (prev) { return [entry, ...prev].slice(0, 500); });
};
const isBday = d => { if (!d) return false; return d.slice(5) === today().slice(5); };
const mo6 = d => { const x = new Date(d + "T12:00"); x.setMonth(x.getMonth() + 6); return x.toISOString().split("T")[0]; };
const calcNet = (v, p) => p === "Cartão Crédito" ? v * 0.965 : p === "Cartão Débito" ? v * 0.98 : v;
const wa = (ph, msg) => { const n = (ph || "").replace(/\D/g, ""); const u = "https://wa.me/" + (n.startsWith("55") ? n : "55" + n) + "?text=" + encodeURIComponent(msg); const a = document.createElement("a"); a.href = u; a.target = "_blank"; document.body.appendChild(a); a.click(); document.body.removeChild(a); };
const age = dob => { if (!dob) return ""; const d = new Date(dob + "T12:00"); const a = new Date(); let y = a.getFullYear() - d.getFullYear(); if (a.getMonth() < d.getMonth() || (a.getMonth() === d.getMonth() && a.getDate() < d.getDate())) y--; return y + " anos"; };
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

// ── UI Atoms ───────────────────────────────────────────────
const Bdg = ({ l, col, sm }) => <span style={{ background: col + "22", color: col, borderRadius: 20, padding: sm ? "2px 7px" : "3px 10px", fontSize: sm ? 10 : 11, fontWeight: 700, whiteSpace: "nowrap" }}>{l}</span>;

const Btn = ({ ch, onClick, v = "p", sm, style, dis }) => {
  const b = { cursor: dis ? "not-allowed" : "pointer", opacity: dis ? 0.5 : 1, border: "none", borderRadius: 8, fontFamily: "'DM Sans'", fontWeight: 600, transition: "all .15s", display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" };
  const vs = { p: { background: G.primary, color: "#fff", padding: sm ? "5px 11px" : "9px 17px", fontSize: sm ? 12 : 14 }, g: { background: "transparent", color: G.primary, border: `1.5px solid ${G.primary}`, padding: sm ? "4px 10px" : "8px 16px", fontSize: sm ? 12 : 14 }, r: { background: G.red, color: "#fff", padding: sm ? "5px 11px" : "9px 17px", fontSize: sm ? 12 : 14 }, y: { background: G.yellow, color: "#fff", padding: sm ? "5px 11px" : "9px 17px", fontSize: sm ? 12 : 14 }, w: { background: "#25D366", color: "#fff", padding: sm ? "5px 11px" : "9px 17px", fontSize: sm ? 12 : 14 }, f: { background: G.accent, color: G.primary, padding: sm ? "5px 11px" : "9px 17px", fontSize: sm ? 12 : 14 } };
  return <button style={{ ...b, ...vs[v], ...style }} onClick={onClick} disabled={dis}>{ch}</button>;
};

const Inp = ({ lb, val, set, type = "text", ph, ro, style, min, max }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
    {lb && <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: ".4px" }}>{lb}</label>}
    <input value={val || ""} onChange={e => set && set(e.target.value)} type={type} placeholder={ph} readOnly={ro} min={min} max={max}
      style={{ border: `1.5px solid ${G.border}`, borderRadius: 8, padding: "8px 11px", fontSize: 14, outline: "none", color: G.text, background: ro ? "#f7f9f8" : "#fff" }} />
  </div>
);

const Txt = ({ lb, val, set, rows = 3, ro, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
    {lb && <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: ".4px" }}>{lb}</label>}
    <textarea value={val || ""} onChange={e => set && set(e.target.value)} rows={rows} readOnly={ro}
      style={{ border: `1.5px solid ${G.border}`, borderRadius: 8, padding: "8px 11px", fontSize: 14, outline: "none", color: G.text, background: ro ? "#f7f9f8" : "#fff", resize: "vertical" }} />
  </div>
);

const Sel = ({ lb, val, set, opts, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
    {lb && <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: ".4px" }}>{lb}</label>}
    <select value={val || ""} onChange={e => set(e.target.value)} style={{ border: `1.5px solid ${G.border}`, borderRadius: 8, padding: "8px 11px", fontSize: 14, outline: "none", color: G.text, background: "#fff" }}>
      {opts.map(o => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}
    </select>
  </div>
);

const R2 = ({ a, b, gap = 11 }) => <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>{a}{b}</div>;
const R3 = ({ a, b, c, gap = 11 }) => <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap }}>{a}{b}{c}</div>;
const Div = ({ lb }) => <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "5px 0" }}>{lb && <span style={{ fontSize: 10, fontWeight: 700, color: G.muted, textTransform: "uppercase", whiteSpace: "nowrap" }}>{lb}</span>}<div style={{ flex: 1, height: 1, background: G.border }} /></div>;
const SC2 = ({ save, cancel, lbl = "Salvar" }) => <div style={{ display: "flex", gap: 9, justifyContent: "flex-end", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${G.border}` }}><Btn ch="Cancelar" v="g" onClick={cancel} /><Btn ch={lbl} onClick={save} /></div>;

const Modal = ({ open, close, title, ch, wide, xl }) => {
  if (!open) return null;
  return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
    <div style={{ background: G.card, borderRadius: 18, width: "100%", maxWidth: xl ? 980 : wide ? 720 : 520, maxHeight: "94vh", overflowY: "auto", boxShadow: "0 16px 48px rgba(0,0,0,.22)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${G.border}`, position: "sticky", top: 0, background: G.card, zIndex: 1 }}>
        <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 20 }}>{title}</span>
        <button onClick={close} style={{ border: "none", background: "none", fontSize: 24, cursor: "pointer", color: G.muted }}>×</button>
      </div>
      <div style={{ padding: 20 }}>{ch}</div>
    </div>
  </div>;
};

const DatePick = ({ lb, val, set }) => {
  const p = val ? val.split("-") : ["", "", ""];
  const [y, sy] = useState(p[0]); const [m, sm] = useState(p[1]); const [d, sd] = useState(p[2]);
  useEffect(() => { if (y && m && d) set(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`); }, [y, m, d]);
  const yrs = []; for (let yr = 1930; yr <= new Date().getFullYear(); yr++) yrs.push(yr);
  return <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {lb && <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: ".4px" }}>{lb}</label>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 5 }}>
      <input placeholder="DD" maxLength={2} value={d} onChange={e => sd(e.target.value)} style={{ border: `1.5px solid ${G.border}`, borderRadius: 8, padding: "8px 6px", fontSize: 13, outline: "none", textAlign: "center" }} />
      <input placeholder="MM" maxLength={2} value={m} onChange={e => sm(e.target.value)} style={{ border: `1.5px solid ${G.border}`, borderRadius: 8, padding: "8px 6px", fontSize: 13, outline: "none", textAlign: "center" }} />
      <select value={y} onChange={e => sy(e.target.value)} style={{ border: `1.5px solid ${G.border}`, borderRadius: 8, padding: "8px 5px", fontSize: 12, outline: "none", background: "#fff" }}>
        <option value="">Ano</option>
        {yrs.reverse().map(yr => <option key={yr} value={yr}>{yr}</option>)}
      </select>
    </div>
  </div>;
};

// Auto reminders
const autoRems = (pats, recs, appts) => {
  const t = today(), y = yest(), tm = tom(); const out = [];
  pats.forEach(p => {
    if (isBday(p.dob)) out.push({ id: `b${p.id}`, title: `🎂 Aniversário — ${p.name}`, desc: "Hoje é aniversário! Enviar parabéns.", date: t, priority: "medium", done: false, patientId: p.id, type: "bday" });
    const lr = recs.filter(r => r.patientId === p.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (lr && mo6(lr.date) <= t) out.push({ id: `s${p.id}`, title: `📅 Semestral — ${p.name}`, desc: `Último atend: ${fmt(lr.date)}`, date: t, priority: "medium", done: false, patientId: p.id, type: "semi" });
    const surg = recs.find(r => r.patientId === p.id && r.procedure === "Cirurgia" && r.date === y);
    if (surg) out.push({ id: `c${p.id}`, title: `🔴 Pós-Cirurgia — ${p.name}`, desc: `Cirurgia ontem (D.${surg.tooth}).`, date: t, priority: "high", done: false, patientId: p.id, type: "surg" });
  });
  appts.filter(a => a.date === y && (a.status === "missed" || a.status === "cancelled" || a.status === "rescheduled")).forEach(a => {
    const p = pats.find(x => x.id === a.patientId); if (!p) return;
    out.push({ id: `m${a.id}`, title: `📵 Remarcar — ${p.name}`, desc: `${SL[a.status]} em ${fmt(a.date)} às ${a.time}`, date: t, priority: "high", done: false, patientId: p.id, type: "miss" });
  });
  appts.filter(a => a.date === tm && a.status === "confirmed").forEach(a => {
    const p = pats.find(x => x.id === a.patientId); if (!p) return;
    out.push({ id: `t${a.id}`, title: `📲 Confirmar amanhã — ${p.name}`, desc: `${a.procedure} às ${a.time}`, date: t, priority: "medium", done: false, patientId: p.id, type: "conf", apptId: a.id });
  });
  return out;
};

// ══════════════════════════════════════════════════════════
// PATIENT FOLDER — full modal with tabs like the photo
// ══════════════════════════════════════════════════════════
function PatSearch({ lb, val, set, pats, optional }) {
  var sel = pats.find(function (p) { return p.id === Number(val); });
  var [q, setQ] = useState("");
  var [open, setOpen] = useState(false);
  var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); };
  var res = q.length >= 1 ? pats.filter(function (p) {
    var nq = norm(q);
    return norm(p.name).indexOf(nq) >= 0 ||
      (p.folder || "").indexOf(q) >= 0 ||
