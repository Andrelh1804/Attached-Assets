import { db, leadsTable, contactsTable, ticketsTable, employeesTable, transactionsTable, workOrdersTable, techniciansTable, conversationsTable, messagesTable, automationsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Technicians
  await db.insert(techniciansTable).values([
    { name: "Carlos Santos", status: "available", specialization: "Redes e Fibra", ordersToday: 8, completedToday: 6, lat: -23.5505, lng: -46.6333, rating: 4.9 },
    { name: "Ana Lima", status: "en-route", specialization: "Instalacoes", ordersToday: 6, completedToday: 5, lat: -23.5640, lng: -46.6517, rating: 4.8 },
    { name: "Roberto Gomes", status: "busy", specialization: "Hardware e Infra", ordersToday: 5, completedToday: 4, lat: -23.5430, lng: -46.6150, rating: 4.7 },
    { name: "Juliana Faria", status: "available", specialization: "CFTV e Seguranca", ordersToday: 4, completedToday: 4, lat: -23.5560, lng: -46.6850, rating: 4.6 },
    { name: "Marcos Souza", status: "offline", specialization: "Eletrica", ordersToday: 0, completedToday: 0, lat: null, lng: null, rating: 4.5 },
  ]).onConflictDoNothing();

  // Leads
  await db.insert(leadsTable).values([
    { name: "TechSolution ISP", email: "contato@techsolution.com.br", company: "TechSolution", stage: "qualificacao", value: 48000, probability: 75, source: "outbound", aiScore: 87 },
    { name: "SolarBrasil Energia", email: "comercial@solarbrasil.com", company: "SolarBrasil", stage: "proposta", value: 32000, probability: 60, source: "inbound", aiScore: 72 },
    { name: "SecureNet Seguranca", email: "ti@securenet.com.br", company: "SecureNet", stage: "negociacao", value: 75000, probability: 80, source: "referral", aiScore: 91 },
    { name: "NetWork Pro", email: "admin@networkpro.com", company: "NetworkPro", stage: "prospeccao", value: 18000, probability: 30, source: "marketing", aiScore: 58 },
    { name: "Grupo Enertech", email: "ceo@enertech.com.br", company: "Enertech", stage: "fechado", value: 120000, probability: 100, source: "event", aiScore: 95 },
    { name: "InfoService Ltda", email: "vendas@infoservice.com", company: "InfoService", stage: "qualificacao", value: 22000, probability: 55, source: "inbound", aiScore: 68 },
    { name: "Telecomunicacoes MT", email: "diretoria@telecomt.com.br", company: "TelecoMT", stage: "proposta", value: 89000, probability: 65, source: "outbound", aiScore: 79 },
  ]).onConflictDoNothing();

  // Contacts
  await db.insert(contactsTable).values([
    { name: "Ricardo Almeida", email: "r.almeida@techsolution.com.br", phone: "(11) 98765-4321", company: "TechSolution", role: "CEO", tags: ["vip", "isp"] },
    { name: "Carla Mendes", email: "carla@solarbrasil.com", phone: "(11) 91234-5678", company: "SolarBrasil", role: "Diretora de Operacoes", tags: ["solar", "enterprise"] },
    { name: "Paulo Ferreira", email: "paulo.ti@securenet.com.br", phone: "(21) 99876-5432", company: "SecureNet", role: "Gerente TI", tags: ["seguranca"] },
    { name: "Mariana Costa", email: "m.costa@networkpro.com", phone: "(11) 93456-7890", company: "NetworkPro", role: "Gerente Comercial", tags: ["internet"] },
  ]).onConflictDoNothing();

  // Tickets
  await db.insert(ticketsTable).values([
    { title: "Queda de conexao em todos os pontos", priority: "critical", status: "open", category: "network", customerName: "TechSolution ISP", slaStatus: "warning", aiSuggestedResponse: "Identificamos queda na OLT. Estamos roteando o trafego. Tempo estimado: 30 min.", slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000) },
    { title: "Lentidao no servidor de arquivos", priority: "high", status: "in_progress", category: "hardware", customerName: "SecureNet", assignedTo: "Ana Lima", slaStatus: "ok", aiSuggestedResponse: "Realizando diagnostico de disco. Pode ser necessaria expansao de armazenamento.", slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000) },
    { title: "Configuracao de VLAN nao funciona", priority: "medium", status: "open", category: "network", customerName: "NetworkPro", slaStatus: "ok", slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { title: "Fatura do mes com valor errado", priority: "medium", status: "open", category: "billing", customerName: "SolarBrasil", slaStatus: "ok", slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000) },
    { title: "IP fixo perdido apos reinicializacao", priority: "high", status: "resolved", category: "network", customerName: "Grupo Enertech", assignedTo: "Carlos Santos", slaStatus: "ok", slaDeadline: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { title: "Instalacao de novo ponto de acesso Wi-Fi", priority: "low", status: "in_progress", category: "hardware", customerName: "InfoService", assignedTo: "Roberto Gomes", slaStatus: "ok", slaDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000) },
    { title: "Backup nao executando automaticamente", priority: "high", status: "open", category: "software", customerName: "TelecoMT", slaStatus: "warning", aiSuggestedResponse: "Verificar credenciais do agente de backup e espaco em disco.", slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000) },
  ]).onConflictDoNothing();

  // Employees
  await db.insert(employeesTable).values([
    { name: "Fernanda Oliveira", email: "f.oliveira@nexora.com.br", department: "Suporte", role: "Gerente de Suporte", status: "active", productivity: 97, goalsCompleted: 5, goalsTotal: 5, points: 520 },
    { name: "Lucas Martins", email: "l.martins@nexora.com.br", department: "Vendas", role: "Executivo Comercial Senior", status: "active", productivity: 94, goalsCompleted: 4, goalsTotal: 5, points: 468 },
    { name: "Camila Ferreira", email: "c.ferreira@nexora.com.br", department: "Suporte", role: "Analista de Suporte L2", status: "active", productivity: 91, goalsCompleted: 3, goalsTotal: 5, points: 420 },
    { name: "Bruno Alves", email: "b.alves@nexora.com.br", department: "TI", role: "Engenheiro de Redes", status: "active", productivity: 88, goalsCompleted: 4, goalsTotal: 5, points: 381 },
    { name: "Larissa Torres", email: "l.torres@nexora.com.br", department: "RH", role: "Analista de RH", status: "active", productivity: 85, goalsCompleted: 3, goalsTotal: 5, points: 320 },
    { name: "Diego Ramos", email: "d.ramos@nexora.com.br", department: "Financeiro", role: "Analista Financeiro", status: "active", productivity: 82, goalsCompleted: 2, goalsTotal: 5, points: 234 },
    { name: "Patricia Costa", email: "p.costa@nexora.com.br", department: "Operacoes", role: "Coordenadora de Operacoes", status: "active", productivity: 90, goalsCompleted: 4, goalsTotal: 5, points: 275 },
  ]).onConflictDoNothing();

  // Transactions
  await db.insert(transactionsTable).values([
    { type: "income", amount: 45800, description: "Mensalidade - TechSolution ISP", category: "subscription", date: new Date().toISOString().slice(0, 10), status: "completed" },
    { type: "income", amount: 28500, description: "Contrato anual - SolarBrasil", category: "sales", date: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10), status: "completed" },
    { type: "expense", amount: 12400, description: "Folha de pagamento - Parcial", category: "payroll", date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), status: "completed" },
    { type: "income", amount: 89000, description: "Projeto Enterprise - SecureNet", category: "service", date: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10), status: "completed" },
    { type: "expense", amount: 8200, description: "Infraestrutura Cloud AWS", category: "infrastructure", date: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10), status: "completed" },
    { type: "income", amount: 15800, description: "Servico de consultoria - NetworkPro", category: "service", date: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10), status: "pending" },
    { type: "expense", amount: 3500, description: "Marketing Digital - Google Ads", category: "marketing", date: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10), status: "completed" },
    { type: "income", amount: 120000, description: "Projeto Grupo Enertech - Fase 2", category: "sales", date: new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10), status: "completed" },
  ]).onConflictDoNothing();

  // Work Orders
  const techs = await db.select().from(techniciansTable);
  if (techs.length > 0) {
    await db.insert(workOrdersTable).values([
      { title: "Instalacao de Fibra Optica - Bloco A", priority: "high", status: "in_progress", technicianId: techs[0].id, technicianName: techs[0].name, customerName: "TechSolution ISP", address: "Rua das Acaias, 145 - Jardim Paulista, SP", scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000) },
      { title: "Manutencao Preventiva - Servidor Principal", priority: "medium", status: "pending", technicianId: techs[1]?.id ?? techs[0].id, technicianName: techs[1]?.name ?? techs[0].name, customerName: "SecureNet", address: "Av. Paulista, 1000 - Bela Vista, SP", scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { title: "Configuracao de Firewall Pfsense", priority: "critical", status: "pending", technicianId: techs[2]?.id ?? techs[0].id, technicianName: techs[2]?.name ?? techs[0].name, customerName: "SolarBrasil", address: "Rua Vergueiro, 3600 - Vila Mariana, SP", scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000) },
      { title: "Troca de ONU queimada", priority: "high", status: "completed", technicianId: techs[0].id, technicianName: techs[0].name, customerName: "NetworkPro", address: "Rua da Consolacao, 789 - Consolacao, SP", scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000), completedAt: new Date() },
    ]).onConflictDoNothing();
  }

  // Conversations
  const [conv1] = await db.insert(conversationsTable).values([
    { customerName: "Ricardo Almeida", channel: "whatsapp", status: "open", lastMessage: "Preciso de ajuda com a conexao", lastMessageAt: new Date(Date.now() - 5 * 60000), unreadCount: 2 },
    { customerName: "Carla Mendes", channel: "email", status: "open", lastMessage: "Quando posso esperar o tecnico?", lastMessageAt: new Date(Date.now() - 15 * 60000), unreadCount: 1 },
    { customerName: "Paulo Ferreira", channel: "chat", status: "resolved", lastMessage: "Obrigado, problema resolvido!", lastMessageAt: new Date(Date.now() - 60 * 60000), unreadCount: 0 },
    { customerName: "Mariana Costa", channel: "whatsapp", status: "open", lastMessage: "Boa tarde, tenho uma duvida sobre o plano", lastMessageAt: new Date(Date.now() - 30 * 60000), unreadCount: 3 },
  ]).returning();

  await db.insert(messagesTable).values([
    { conversationId: conv1.id, content: "Boa tarde! Minha conexao caiu ha 20 minutos. Podem verificar?", direction: "inbound", senderName: "Ricardo Almeida" },
    { conversationId: conv1.id, content: "Ola Ricardo! Ja verificamos e identificamos uma instabilidade na sua OLT. Nossa equipe esta trabalhando na resolucao. Tempo estimado: 20 minutos.", direction: "outbound", senderName: "Suporte Nexora" },
    { conversationId: conv1.id, content: "Ok, vou aguardar. Mas isso esta acontecendo muito ultimamente...", direction: "inbound", senderName: "Ricardo Almeida" },
  ]).onConflictDoNothing();

  // Automations
  await db.insert(automationsTable).values([
    { name: "SLA Alert — Chamado P1 Critico", description: "Notifica supervisor quando chamado P1 fica 1h sem atualizacao", trigger: "sla_breach", status: "active", executionsCount: 47 },
    { name: "Follow-up Proposta — 3 dias", description: "Envia e-mail automatico de follow-up apos 3 dias sem resposta", trigger: "lead_stage_change", status: "active", executionsCount: 128, lastExecutedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { name: "Confirmacao de Pagamento PIX", description: "Envia recibo por WhatsApp apos confirmacao de pagamento", trigger: "payment_received", status: "active", executionsCount: 312, lastExecutedAt: new Date(Date.now() - 30 * 60 * 1000) },
    { name: "Alocacao Automatica de Chamados", description: "Distribui novos chamados automaticamente por carga da equipe", trigger: "new_ticket", status: "active", executionsCount: 891, lastExecutedAt: new Date() },
    { name: "Relatorio Semanal Executivo", description: "Gera e envia relatorio de KPIs toda segunda-feira as 8h", trigger: "schedule", status: "active", executionsCount: 24, lastExecutedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { name: "Webhook CRM Externo", description: "Sincroniza leads com sistema legado via webhook", trigger: "webhook", status: "paused", executionsCount: 56 },
  ]).onConflictDoNothing();

  console.log("Seed completed!");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
