"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "pt-BR";

const LOCALE_STORAGE_KEY = "cp_locale";
const DEFAULT_LOCALE: Locale = "pt-BR";

const translations = {
  "pt-BR": {
    "app.title": "Gerador de Plano de Conteúdo",
    "app.subtitle": "Gerencie gerações de planos de conteúdo",
    "app.createGeneration": "Criar geração",
    "nav.language": "Idioma",
    "nav.language.en": "Inglês",
    "nav.language.ptBr": "Português (Brasil)",
    "nav.general": "Geral",
    "nav.medical": "Médico",
    "sidebar.generations": "Gerações",
    "generations.loading": "Carregando...",
    "generations.error": "Erro: {error}",
    "generations.loadError": "Falha ao carregar gerações",
    "generations.retry": "Tentar novamente",
    "generations.empty.title": "Nenhuma geração ainda.",
    "generations.empty.subtitle": "Crie a primeira!",
    "generations.publications.one": "{count} publicação",
    "generations.publications.other": "{count} publicações",
    "generations.details": "Detalhes da Geração",
    "posts.selectGeneration": "Selecione uma geração à esquerda",
    "posts.loading": "Carregando posts...",
    "posts.error": "Erro: {error}",
    "posts.loadError": "Falha ao carregar itens",
    "posts.updateStatusError": "Falha ao atualizar o status do item. Tente novamente.",
    "posts.updateItemError": "Falha ao atualizar o item: {error}",
    "posts.count.one": "{count} post",
    "posts.count.other": "{count} posts",
    "posts.view.table": "Tabela",
    "posts.view.calendar": "Calendário",
    "posts.settings": "Configurações",
    "posts.search": "Pesquisar nas publicações...",
    "generations.search": "Pesquisar planos...",
    "settings.tableView": "Visualização da tabela",
    "settings.calendarView": "Visualização do calendário",
    "settings.format": "Formato",
    "settings.status": "Status",
    "settings.publishDate": "Data de publicação",
    "settings.undatedSection": "Seção sem data",
    "table.empty.title": "Nenhum item de plano de conteudo ainda.",
    "table.empty.subtitle": "Gere um plano de conteúdo para ver itens aqui.",
    "table.columns.title": "Título",
    "table.columns.format": "Formato",
    "table.columns.status": "Status",
    "table.columns.publishDate": "Data de publicação",
    "table.columns.painPoint": "Ponto de dor",
    "table.columns.cta": "Chamada para ação",
    "table.columns.contentOutline": "Esboço de conteúdo",
    "table.columns.actions": "Ações",
    "table.actions.view": "Ver",
    "table.actions.comingSoon": "Ações em breve",
    "table.filter.all": "Todos",
    "table.filter.approval": "Filtro",
    "table.selectAll": "Selecionar todos os itens",
    "table.selectItem": "Selecionar {title}",
    "modal.title": "Editar item",
    "modal.labels.title": "Título",
    "modal.labels.format": "Formato",
    "modal.labels.status": "Status",
    "modal.labels.publishDate": "Data prevista de publicação",
    "modal.labels.painPoint": "Ponto de dor",
    "modal.labels.contentOutline": "Esboço de conteúdo",
    "modal.labels.cta": "Chamada para ação",
    "modal.cancel": "Cancelar",
    "modal.save": "Salvar",
    "modal.saving": "Salvando...",
    "modal.processing": "Processando...",
    "status.rascunho": "Rascunho",
    "status.aprovado": "Aprovado",
    "status.gerado": "Gerado",
    "calendar.view.month": "Mes",
    "calendar.view.week": "Semana",
    "calendar.today": "Hoje",
    "calendar.more": "+{count} mais",
    "calendar.noPublishDate": "Sem data de publicacao",
    "calendar.onlyApproved": "Apenas itens aprovados sao exibidos no calendario",
    "generationModal.title": "Gerar plano de conteudo",
    "generationModal.createError": "Falha ao criar geracao: {error}",
    "generationModal.createErrorFallback": "Falha ao criar geracao",
    "generationModal.genericError": "Erro: {error}",
    "form.labels.title": "Título do plano",
    "form.labels.specialization": "Especialização",
    "form.labels.purpose": "Objetivo da publicação",
    "form.labels.contentType": "Tipo de conteúdo",
    "form.labels.numberOfPublications": "Número de publicações",
    "form.labels.context": "Contexto / desejos",
    "form.placeholder.context":
      "Informe qualquer contexto adicional, requisitos específicos ou desejos para seu plano de conteúdo...",
    "form.submit.generate": "Gerar plano de conteúdo",
    "form.submit.generating": "Gerando...",
    "form.errors.titleRequired": "O título do plano é obrigatório",
    "form.errors.specializationRequired": "Especialização obrigatória",
    "form.errors.purposeRequired": "Objetivo da publicação obrigatório",
    "form.errors.contentTypeRequired": "Tipo de conteúdo obrigatório",
    "form.errors.publicationsRange": "Número de publicações deve ser entre 1 e 15",
    "options.specialization.digitalMarketing": "Marketing Digital",
    "options.specialization.saas": "SaaS",
    "options.specialization.ecommerce": "E-commerce",
    "options.specialization.healthcare": "Saúde",
    "options.specialization.education": "Educação",
    "options.specialization.finance": "Finanças",
    "options.specialization.technology": "Tecnologia",
    "options.specialization.realEstate": "Imóveis",
    "options.purpose.leadGeneration": "Geração de leads",
    "options.purpose.brandAwareness": "Reconhecimento de marca",
    "options.purpose.thoughtLeadership": "Liderança de pensamento",
    "options.purpose.customerEducation": "Educação do cliente",
    "options.purpose.productLaunch": "Lançamento de produto",
    "options.purpose.customerRetention": "Retenção de clientes",
    "options.purpose.communityBuilding": "Construção de comunidade",
    "options.contentType.educational": "Educacional",
    "options.contentType.promotional": "Promocional",
    "options.contentType.entertainment": "Entretenimento",
    "options.contentType.caseStudy": "Estudo de caso",
    "options.contentType.howToGuide": "Guia passo a passo",
    "options.contentType.newsUpdates": "Notícias e atualizações",
    "options.contentType.comparison": "Comparação",
    "options.contentType.review": "Análise",
    "ui.close": "Fechar",
    "ui.closeModal": "Fechar modal",
    "ui.delete": "Excluir",
    "ui.confirm": "Confirmar",
    "ui.selectOption": "Selecione uma opção",
    "generations.all": "Todas as Gerações",

    // Auth
    "auth.login.title": "Entrar no sistema",
    "auth.login.subtitle": "Digite seu e-mail e senha para acessar o aplicativo",
    "auth.login.email": "E-mail",
    "auth.login.password": "Senha",
    "auth.login.button": "Entrar",
    "auth.login.buttonLoading": "Entrando...",
    "auth.login.error": "Erro de autenticação. Verifique seu e-mail e senha.",
    "auth.login.testCredentials": "Credenciais de teste:",

    // Medical Content Generator
    "medical.app.title": "Wellmaker",
    "medical.app.subtitle": "Planejamento inteligente para profissionais de saúde no Instagram",
    "medical.app.createPlan": "Criar Novo Plano",
    "medical.app.generatedPlans": "Planos Gerados",
    "generations.delete.confirm": "Tem certeza que deseja excluir esta geração e todas as suas publicações? Esta ação não pode ser desfeita.",
    "posts.delete.confirm": "Tem certeza que deseja excluir esta publicação?",

    // Medical Modal
    "medical.modal.title": "Criar Novo Plano de Conteúdo",
    "nav.user.logout": "Sair",
    "nav.user.role.admin": "Administrador",
    "nav.user.role.member": "Membro",
    "medical.form.title": "Planejamento de Conteúdo Médico para Instagram",
    "medical.form.poweredBy": "Desenvolvido por Google Gemini 1.5 Pro",

    // Form Fields
    "medical.form.planTitle": "Título do Plano",
    "medical.form.specialization": "Especialização",
    "medical.form.month": "Mês",
    "medical.form.goals": "Objetivos",
    "medical.form.goalsDescription": "Selecione e ordene por prioridade. O primeiro objetivo será o driver principal.",
    "medical.form.selectedGoals": "Objetivos Selecionados (em ordem de prioridade):",
    "medical.form.formatsAndQuantity": "Formatos e Quantidade",
    "medical.form.totalPublications": "Total de publicações:",
    "medical.form.autoDistribute": "Distribuir automaticamente",
    "medical.form.totalPublicationsLimit": "Limite Total de Publicações",
    "medical.form.totalPublicationsLimitDesc": "Número máximo de postagens a serem geradas para este plano",
    "medical.form.healthCalendar": "Usar Calendário de Saúde para datas especiais",
    "medical.form.upcomingDates": "Próximas Datas Relevantes:",
    "medical.form.additionalContext": "Contexto Adicional",
    "medical.form.reset": "Limpar",
    "medical.form.generate": "Gerar Plano",
    "medical.form.generating": "Gerando...",
    "medical.form.validationWarning": "Preencha Especialização, Mês e Objetivos para ativar a geração",

    // Specializations
    "medical.specialization.mammography": "Mamografia/Mastologia",
    "medical.specialization.dentistry": "Odontologia",
    "medical.specialization.gynecology": "Ginecologia e Obstetrícia",
    "medical.specialization.dermatology": "Dermatologia",
    "medical.specialization.pediatrics": "Pediatria",
    "medical.specialization.cardiology": "Cardiologia",
    "medical.specialization.orthopedics": "Ortopedia",
    "medical.specialization.ophthalmology": "Oftalmologia",
    "medical.specialization.endocrinology": "Endocrinologia",
    "medical.specialization.nutrology": "Nutrologia/Nutrição",

    // Months
    "medical.month.january": "Janeiro",
    "medical.month.february": "Fevereiro",
    "medical.month.march": "Março",
    "medical.month.april": "Abril",
    "medical.month.may": "Maio",
    "medical.month.june": "Junho",
    "medical.month.july": "Julho",
    "medical.month.august": "Agosto",
    "medical.month.september": "Setembro",
    "medical.month.october": "Outubro",
    "medical.month.november": "Novembro",
    "medical.month.december": "Dezembro",

    // Goals
    "medical.goal.conversion": "Conversão",
    "medical.goal.conversion.desc": "Foco em gerar leads e conversões",
    "medical.goal.authority": "Autoridade",
    "medical.goal.authority.desc": "Estabelecer expertise e credibilidade",
    "medical.goal.growth": "Crescimento",
    "medical.goal.growth.desc": "Aumentar alcance e seguidores",
    "medical.goal.education": "Educação",
    "medical.goal.education.desc": "Educar e informar o público",
    "medical.goal.engagement": "Engajamento",
    "medical.goal.engagement.desc": "Aumentar interação e participação",

    // Instagram Formats
    "medical.format.reels": "Reels",
    "medical.format.reels.desc": "Vídeo dinâmico para alcance e análise de dor",
    "medical.format.carousel": "Carrossel",
    "medical.format.carousel.desc": "Slides educacionais para autoridade",
    "medical.format.staticPost": "Post Estático",
    "medical.format.staticPost.desc": "Imagem fixa para branding",
    "medical.format.stories": "Stories",
    "medical.format.stories.desc": "Atualizações sequenciais para conversão",
    "medical.format.liveCollab": "Live/Collab",
    "medical.format.liveCollab.desc": "Networking e confiança em tempo real",

    // Context Placeholders
    "medical.context.mammography": "Ex: Equipamento digital, atendimento humanizado, aceita convênios...",
    "medical.context.dentistry": "Ex: Possui microscópio, oferece parcelamento, foco estético...",
    "medical.context.gynecology": "Ex: Especialização em gestação de alto risco, parto humanizado...",
    "medical.context.dermatology": "Ex: Tratamentos a laser, procedimentos estéticos, tratamento de acne...",
    "medical.context.pediatrics": "Ex: Atendimento domiciliar, urgências, vacinação...",
    "medical.context.cardiology": "Ex: Exames preventivos, cardiologia esportiva, hipertensão...",
    "medical.context.orthopedics": "Ex: Lesões esportivas, artroscopia, coluna...",
    "medical.context.ophthalmology": "Ex: Cirurgia de catarata, refrativa, glaucoma...",
    "medical.context.endocrinology": "Ex: Diabetes, tireoide, obesidade, hormônios...",
    "medical.context.nutrology": "Ex: Emagrecimento, nutrição esportiva, funcional...",
    "medical.context.default": "Adicione informações específicas sobre sua prática, diferenciais, público-alvo...",

    // Errors
    "medical.error.titleRequired": "Nome do plano é obrigatório",
    "medical.error.specializationRequired": "Especialização é obrigatória",
    "medical.error.monthRequired": "Mês é obrigatório",
    "medical.error.goalsRequired": "Pelo menos um objetivo é obrigatório",

    // Health Calendar
    "health.calendar.title": "Calendário de Conscientização em Saúde",
    "health.calendar.sync": "Sincronizar MS",
    "health.calendar.syncTitle": "Sincronizar eventos oficiais",
    "health.calendar.syncConfirm": "Isso excluirá todos os eventos oficiais existentes e buscará os dados mais recentes. Eventos manuais não serão afetados. Continuar?",
    "health.calendar.confirmSync": "Sincronizar agora",
    "health.calendar.syncing": "Sincronizando...",
    "health.calendar.addEvent": "Adicionar Evento",
    "health.calendar.editEvent": "Editar Evento",
    "health.calendar.table": "Tabela",
    "health.calendar.calendar": "Calendário",
    "health.calendar.noEvents": "Nenhum evento encontrado para este mês.",
    "health.calendar.deleteTitle": "Excluir Evento",
    "health.calendar.deleteConfirm": "Tem certeza que deseja excluir este evento?",
    "health.calendar.syncSuccess": "{count} eventos adicionados com sucesso!",
    "health.calendar.month": "Mês",
    "health.calendar.date": "Data",
    "health.calendar.eventName": "Nome do Evento",
    "health.calendar.description": "Descrição",
    "health.calendar.actions": "Ações",
    "health.calendar.cancel": "Cancelar",
    "health.calendar.save": "Salvar Evento",
    "health.calendar.delete": "Excluir",
    "health.calendar.noDescription": "Nenhuma descrição adicional disponível.",
    "health.calendar.notes": "Notas de Conteúdo",
    "health.calendar.notesPlaceholder": "Adicione orientações para geração de conteúdo, pontos principais a destacar...",
    "health.calendar.source": "Fonte",
    "health.calendar.source.official": "Oficial",
    "health.calendar.source.manual": "Manual",
    "health.calendar.type": "Tipo de Evento",
    "health.calendar.type.day": "Data Específica",
    "health.calendar.type.month": "Campanha do Mês",
    "health.calendar.isRecurring": "Evento Recorrente (Anual)",
    "health.calendar.eventNamePlaceholder": "Ex: Outubro Rosa",
    "health.calendar.descriptionPlaceholder": "Breve descrição da importância...",
    "health.calendar.aiGenerating": "IA Gerando...",
  },
} as const;

type TranslationKey = keyof typeof translations["pt-BR"];

const weekDaysByLocale: Record<Locale, string[]> = {
  "pt-BR": ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"],
};

const isLocale = (value: string | null): value is Locale =>
  value === "pt-BR";

const getIntlLocale = (locale: Locale) => (locale === "pt-BR" ? "pt-BR" : "en-US");

const interpolate = (template: string, vars?: Record<string, string | number>) => {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  intlLocale: string;
  weekDays: string[];
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) {
      setLocale(stored);
      return;
    }
    if (typeof navigator !== "undefined") {
      const browserLocale = navigator.language.toLowerCase();
      if (browserLocale.startsWith("pt")) {
        setLocale("pt-BR");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = getIntlLocale(locale);
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: TranslationKey, vars?: Record<string, string | number>) => {
      const template = translations[locale][key];
      return interpolate(template, vars);
    };
    return {
      locale,
      setLocale,
      t,
      intlLocale: getIntlLocale(locale),
      weekDays: weekDaysByLocale[locale],
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return context;
};
