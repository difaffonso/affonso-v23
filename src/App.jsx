import { useState, useEffect } from "react";

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
const SC_BG = { confirmed: "#E8F5EE", pending: "#FEF3E2", done: "#F2F4F3", cancelled: "#FDECEA", missed: "#FDECEA", rescheduled:
