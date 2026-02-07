"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "pt-BR";

const LOCALE_STORAGE_KEY = "cp_locale";
const DEFAULT_LOCALE: Locale = "en";

const translations = {
  en: {
    "app.title": "Content Plan Generator",
    "app.subtitle": "Manage content plan generations",
    "app.createGeneration": "Create generation",
    "nav.language": "Language",
    "nav.language.en": "English",
    "nav.language.ptBr": "Portuguese (Brazil)",
    "nav.general": "General",
    "nav.medical": "Medical",
    "sidebar.generations": "Generations",
    "generations.loading": "Loading...",
    "generations.error": "Error: {error}",
    "generations.loadError": "Failed to load generations",
    "generations.retry": "Try again",
    "generations.empty.title": "No generations yet.",
    "generations.empty.subtitle": "Create the first one!",
    "generations.publications.one": "{count} publication",
    "generations.publications.other": "{count} publications",
    "generations.details": "Generation Details",
    "posts.selectGeneration": "Select a generation on the left",
    "posts.loading": "Loading posts...",
    "posts.error": "Error: {error}",
    "posts.loadError": "Failed to load items",
    "posts.updateStatusError": "Failed to update item status. Please try again.",
    "posts.updateItemError": "Failed to update item: {error}",
    "posts.count.one": "{count} post",
    "posts.count.other": "{count} posts",
    "posts.view.table": "Table",
    "posts.view.calendar": "Calendar",
    "posts.settings": "Settings",
    "settings.tableView": "Table view",
    "settings.publishDate": "Publish date",
    "settings.undatedSection": "Undated section",
    "settings.format": "Format",
    "settings.status": "Status",
    "settings.calendarView": "Calendar view",
    "table.empty.title": "No content plan items yet.",
    "table.empty.subtitle": "Generate a content plan to see items here.",
    "table.columns.title": "Title",
    "table.columns.format": "Format",
    "table.columns.status": "Status",
    "table.columns.publishDate": "Publish date",
    "table.columns.painPoint": "Pain point",
    "table.columns.cta": "CTA",
    "table.columns.contentOutline": "Content outline",
    "table.columns.actions": "Actions",
    "table.actions.view": "View",
    "table.actions.comingSoon": "Actions coming soon",
    "table.filter.all": "All",
    "table.filter.approval": "Filter",
    "table.selectAll": "Select all items",
    "table.selectItem": "Select {title}",
    "modal.title": "Edit item",
    "modal.labels.title": "Title",
    "modal.labels.format": "Format",
    "modal.labels.status": "Status",
    "modal.labels.publishDate": "Planned publish date",
    "modal.labels.painPoint": "Pain point",
    "modal.labels.contentOutline": "Content outline",
    "modal.labels.cta": "CTA",
    "modal.cancel": "Cancel",
    "modal.save": "Save",
    "modal.saving": "Saving...",
    "modal.processing": "Processing...",
    "status.draft": "draft",
    "status.approved": "approved",
    "status.generated": "generated",
    "calendar.view.month": "Month",
    "calendar.view.week": "Week",
    "calendar.today": "Today",
    "calendar.more": "+{count} more",
    "calendar.noPublishDate": "No publish date",
    "calendar.onlyApproved": "Only approved items are displayed in the calendar",
    "generationModal.title": "Generate Content Plan",
    "generationModal.createError": "Failed to create generation: {error}",
    "generationModal.createErrorFallback": "Failed to create generation",
    "generationModal.genericError": "Error: {error}",
    "form.labels.title": "Plan title",
    "form.labels.specialization": "Specialization",
    "form.labels.purpose": "Purpose of publication",
    "form.labels.contentType": "Type of content",
    "form.labels.numberOfPublications": "Number of publications",
    "form.labels.context": "Context / wishes",
    "form.placeholder.context":
      "Enter any additional context, specific requirements, or wishes for your content plan...",
    "form.submit.generate": "Generate content plan",
    "form.submit.generating": "Generating...",
    "form.errors.titleRequired": "Plan title is required",
    "form.errors.specializationRequired": "Specialization is required",
    "form.errors.purposeRequired": "Purpose of publication is required",
    "form.errors.contentTypeRequired": "Type of content is required",
    "form.errors.publicationsRange": "Number of publications must be between 1 and 15",
    "options.specialization.digitalMarketing": "Digital Marketing",
    "options.specialization.saas": "SaaS",
    "options.specialization.ecommerce": "E-commerce",
    "options.specialization.healthcare": "Healthcare",
    "options.specialization.education": "Education",
    "options.specialization.finance": "Finance",
    "options.specialization.technology": "Technology",
    "options.specialization.realEstate": "Real Estate",
    "options.purpose.leadGeneration": "Lead Generation",
    "options.purpose.brandAwareness": "Brand Awareness",
    "options.purpose.thoughtLeadership": "Thought Leadership",
    "options.purpose.customerEducation": "Customer Education",
    "options.purpose.productLaunch": "Product Launch",
    "options.purpose.customerRetention": "Customer Retention",
    "options.purpose.communityBuilding": "Community Building",
    "options.contentType.educational": "Educational",
    "options.contentType.promotional": "Promotional",
    "options.contentType.entertainment": "Entertainment",
    "options.contentType.caseStudy": "Case Study",
    "options.contentType.howToGuide": "How-to Guide",
    "options.contentType.newsUpdates": "News & Updates",
    "options.contentType.comparison": "Comparison",
    "options.contentType.review": "Review",
    "ui.close": "Close",
    "ui.closeModal": "Close modal",
    "ui.delete": "Delete",
    "ui.confirm": "Confirm",
    "generations.all": "All Generations",

    // Auth
    "auth.login.title": "Login",
    "auth.login.subtitle": "Enter your email and password to access the app",
    "auth.login.email": "Email",
    "auth.login.password": "Password",
    "auth.login.button": "Login",
    "auth.login.buttonLoading": "Logging in...",
    "auth.login.error": "Authentication error. Check your email and password.",
    "auth.login.testCredentials": "Test credentials:",

    // Medical Content Generator
    "medical.app.title": "Wellmaker",
    "medical.app.subtitle": "Smart planning for healthcare professionals on Instagram",
    "medical.app.createPlan": "Create New Plan",
    "medical.app.generatedPlans": "Generated Plans",
    "generations.delete.confirm": "Are you sure you want to delete this generation and all its publications? This action cannot be undone.",
    "posts.delete.confirm": "Are you sure you want to delete this publication?",

    // Medical Modal
    "medical.modal.title": "Create New Content Plan",
    "nav.user.logout": "Logout",
    "nav.user.role.admin": "Administrator",
    "nav.user.role.member": "Member",
    "medical.form.title": "Medical Content Planning for Instagram",
    "medical.form.poweredBy": "Powered by Google Gemini 3 Pro",

    // Form Fields
    "medical.form.planTitle": "Plan Title",
    "medical.form.specialization": "Specialization",
    "medical.form.month": "Month",
    "medical.form.goals": "Goals",
    "medical.form.goalsDescription": "Select and order by priority. The first goal will be the main driver.",
    "medical.form.selectedGoals": "Selected Goals (in priority order):",
    "medical.form.formatsAndQuantity": "Formats and Quantity",
    "medical.form.totalPublications": "Total publications:",
    "medical.form.autoDistribute": "Auto-distribute",
    "medical.form.totalPublicationsLimit": "Total Publications Limit",
    "medical.form.totalPublicationsLimitDesc": "Maximum number of posts to generate for this plan",
    "medical.form.healthCalendar": "Use Health Calendar for special dates",
    "medical.form.upcomingDates": "Upcoming Relevant Dates:",
    "medical.form.additionalContext": "Additional Context",
    "medical.form.reset": "Reset",
    "medical.form.generate": "Generate Plan",
    "medical.form.generating": "Generating...",
    "medical.form.validationWarning": "Fill in Specialization, Month and Goals to enable generation",

    // Specializations
    "medical.specialization.mammography": "Mammography/Mastology",
    "medical.specialization.dentistry": "Dentistry",
    "medical.specialization.gynecology": "Gynecology and Obstetrics",
    "medical.specialization.dermatology": "Dermatology",
    "medical.specialization.pediatrics": "Pediatrics",
    "medical.specialization.cardiology": "Cardiology",
    "medical.specialization.orthopedics": "Orthopedics",
    "medical.specialization.ophthalmology": "Ophthalmology",
    "medical.specialization.endocrinology": "Endocrinology",
    "medical.specialization.nutrology": "Nutrology/Nutrition",

    // Months
    "medical.month.january": "January",
    "medical.month.february": "February",
    "medical.month.march": "March",
    "medical.month.april": "April",
    "medical.month.may": "May",
    "medical.month.june": "June",
    "medical.month.july": "July",
    "medical.month.august": "August",
    "medical.month.september": "September",
    "medical.month.october": "October",
    "medical.month.november": "November",
    "medical.month.december": "December",

    // Goals
    "medical.goal.conversion": "Conversion",
    "medical.goal.conversion.desc": "Focus on generating leads and conversions",
    "medical.goal.authority": "Authority",
    "medical.goal.authority.desc": "Establish expertise and credibility",
    "medical.goal.growth": "Growth",
    "medical.goal.growth.desc": "Increase reach and followers",
    "medical.goal.education": "Education",
    "medical.goal.education.desc": "Educate and inform the audience",
    "medical.goal.engagement": "Engagement",
    "medical.goal.engagement.desc": "Increase interaction and participation",

    // Instagram Formats
    "medical.format.reels": "Reels",
    "medical.format.reels.desc": "Dynamic video for reach and pain point analysis",
    "medical.format.carousel": "Carousel",
    "medical.format.carousel.desc": "Educational slides for authority",
    "medical.format.staticPost": "Static Post",
    "medical.format.staticPost.desc": "Fixed image for branding",
    "medical.format.stories": "Stories",
    "medical.format.stories.desc": "Sequential updates for conversion",
    "medical.format.liveCollab": "Live/Collab",
    "medical.format.liveCollab.desc": "Networking and trust in real-time",

    // Context Placeholders
    "medical.context.mammography": "E.g.: Digital equipment, humanized care, accepts insurance...",
    "medical.context.dentistry": "E.g.: Has microscope, offers installments, aesthetic focus...",
    "medical.context.gynecology": "E.g.: Specialization in high-risk pregnancy, humanized birth...",
    "medical.context.dermatology": "E.g.: Laser treatments, aesthetic procedures, acne treatment...",
    "medical.context.pediatrics": "E.g.: Home care, emergencies, vaccination...",
    "medical.context.cardiology": "E.g.: Preventive exams, sports cardiology, hypertension...",
    "medical.context.orthopedics": "E.g.: Sports injuries, arthroscopy, spine...",
    "medical.context.ophthalmology": "E.g.: Cataract surgery, refractive, glaucoma...",
    "medical.context.endocrinology": "E.g.: Diabetes, thyroid, obesity, hormones...",
    "medical.context.nutrology": "E.g.: Weight loss, sports nutrition, functional...",
    "medical.context.default": "Add specific information about your practice, differentials, target audience...",

    // Errors
    "medical.error.titleRequired": "Plan title is required",
    "medical.error.specializationRequired": "Specialization is required",
    "medical.error.monthRequired": "Month is required",
    "medical.error.goalsRequired": "At least one goal is required",

    // Health Calendar
    "health.calendar.title": "Health Awareness Calendar",
    "health.calendar.sync": "Sync from MS",
    "health.calendar.syncTitle": "Sync official events",
    "health.calendar.syncConfirm": "This will delete all existing official events and fetch the latest data. Manual events will not be affected. Continue?",
    "health.calendar.confirmSync": "Sync now",
    "health.calendar.syncing": "Syncing...",
    "health.calendar.addEvent": "Add Event",
    "health.calendar.editEvent": "Edit Event",
    "health.calendar.table": "Table View",
    "health.calendar.calendar": "Calendar View",
    "health.calendar.noEvents": "No events found for this month.",
    "health.calendar.deleteTitle": "Delete Event",
    "health.calendar.deleteConfirm": "Are you sure you want to delete this event?",
    "health.calendar.syncSuccess": "{count} events added successfully!",
    "health.calendar.month": "Month",
    "health.calendar.date": "Date",
    "health.calendar.eventName": "Event Name",
    "health.calendar.description": "Description",
    "health.calendar.actions": "Actions",
    "health.calendar.cancel": "Cancel",
    "health.calendar.save": "Save Event",
    "health.calendar.noDescription": "No additional description available.",
    "health.calendar.notes": "Content Notes",
    "health.calendar.notesPlaceholder": "Add directions for content generation, key points to highlight...",
    "health.calendar.source": "Source",
    "health.calendar.source.official": "Official",
    "health.calendar.source.manual": "Manual",
  },
  "pt-BR": {
    "app.title": "Gerador de Plano de Conteudo",
    "app.subtitle": "Gerencie geracoes de planos de conteudo",
    "app.createGeneration": "Criar geracao",
    "nav.language": "Idioma",
    "nav.language.en": "Ingles",
    "nav.language.ptBr": "Portugues (Brasil)",
    "nav.general": "Geral",
    "nav.medical": "Médico",
    "sidebar.generations": "Geracoes",
    "generations.loading": "Carregando...",
    "generations.error": "Erro: {error}",
    "generations.loadError": "Falha ao carregar geracoes",
    "generations.retry": "Tentar novamente",
    "generations.empty.title": "Nenhuma geracao ainda.",
    "generations.empty.subtitle": "Crie a primeira!",
    "generations.publications.one": "{count} publicacao",
    "generations.publications.other": "{count} publicacoes",
    "generations.details": "Detalhes da Geração",
    "posts.selectGeneration": "Selecione uma geracao a esquerda",
    "posts.loading": "Carregando posts...",
    "posts.error": "Erro: {error}",
    "posts.loadError": "Falha ao carregar itens",
    "posts.updateStatusError": "Falha ao atualizar o status do item. Tente novamente.",
    "posts.updateItemError": "Falha ao atualizar o item: {error}",
    "posts.count.one": "{count} post",
    "posts.count.other": "{count} posts",
    "posts.view.table": "Tabela",
    "posts.view.calendar": "Calendario",
    "posts.settings": "Configuracoes",
    "settings.tableView": "Visualizacao da tabela",
    "settings.calendarView": "Visualizacao do calendario",
    "settings.format": "Formato",
    "settings.status": "Status",
    "settings.publishDate": "Data de publicacao",
    "settings.undatedSection": "Secao sem data",
    "table.empty.title": "Nenhum item de plano de conteudo ainda.",
    "table.empty.subtitle": "Gere um plano de conteudo para ver itens aqui.",
    "table.columns.title": "Titulo",
    "table.columns.format": "Formato",
    "table.columns.status": "Status",
    "table.columns.publishDate": "Data de publicacao",
    "table.columns.painPoint": "Pain point",
    "table.columns.cta": "CTA",
    "table.columns.contentOutline": "Content outline",
    "table.columns.actions": "Acoes",
    "table.actions.view": "Ver",
    "table.actions.comingSoon": "Acoes em breve",
    "table.filter.all": "Todos",
    "table.filter.approval": "Filtro",
    "table.selectAll": "Selecionar todos os itens",
    "table.selectItem": "Selecionar {title}",
    "modal.title": "Editar item",
    "modal.labels.title": "Titulo",
    "modal.labels.format": "Formato",
    "modal.labels.status": "Status",
    "modal.labels.publishDate": "Data prevista de publicacao",
    "modal.labels.painPoint": "Pain point",
    "modal.labels.contentOutline": "Content outline",
    "modal.labels.cta": "CTA",
    "modal.cancel": "Cancelar",
    "modal.save": "Salvar",
    "modal.saving": "Salvando...",
    "modal.processing": "Processando...",
    "status.draft": "rascunho",
    "status.approved": "aprovado",
    "status.generated": "gerado",
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
    "form.labels.specialization": "Especializacao",
    "form.labels.purpose": "Objetivo da publicacao",
    "form.labels.contentType": "Tipo de conteudo",
    "form.labels.numberOfPublications": "Numero de publicacoes",
    "form.labels.context": "Contexto / desejos",
    "form.placeholder.context":
      "Informe qualquer contexto adicional, requisitos especificos ou desejos para seu plano de conteudo...",
    "form.submit.generate": "Gerar plano de conteudo",
    "form.submit.generating": "Gerando...",
    "form.errors.titleRequired": "O título do plano é obrigatório",
    "form.errors.specializationRequired": "Especializacao obrigatoria",
    "form.errors.purposeRequired": "Objetivo da publicacao obrigatorio",
    "form.errors.contentTypeRequired": "Tipo de conteudo obrigatorio",
    "form.errors.publicationsRange": "Numero de publicacoes deve ser entre 1 e 15",
    "options.specialization.digitalMarketing": "Marketing Digital",
    "options.specialization.saas": "SaaS",
    "options.specialization.ecommerce": "E-commerce",
    "options.specialization.healthcare": "Saude",
    "options.specialization.education": "Educacao",
    "options.specialization.finance": "Financas",
    "options.specialization.technology": "Tecnologia",
    "options.specialization.realEstate": "Imoveis",
    "options.purpose.leadGeneration": "Geracao de leads",
    "options.purpose.brandAwareness": "Reconhecimento de marca",
    "options.purpose.thoughtLeadership": "Lideranca de pensamento",
    "options.purpose.customerEducation": "Educacao do cliente",
    "options.purpose.productLaunch": "Lancamento de produto",
    "options.purpose.customerRetention": "Retencao de clientes",
    "options.purpose.communityBuilding": "Construcao de comunidade",
    "options.contentType.educational": "Educacional",
    "options.contentType.promotional": "Promocional",
    "options.contentType.entertainment": "Entretenimento",
    "options.contentType.caseStudy": "Estudo de caso",
    "options.contentType.howToGuide": "Guia passo a passo",
    "options.contentType.newsUpdates": "Noticias e atualizacoes",
    "options.contentType.comparison": "Comparacao",
    "options.contentType.review": "Analise",
    "ui.close": "Fechar",
    "ui.closeModal": "Fechar modal",
    "ui.delete": "Excluir",
    "ui.confirm": "Confirmar",
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
    "medical.form.poweredBy": "Powered by Google Gemini 3 Pro",

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
    "medical.form.reset": "Reset",
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
    "health.calendar.noDescription": "Nenhuma descrição adicional disponível.",
    "health.calendar.notes": "Notas de Conteúdo",
    "health.calendar.notesPlaceholder": "Adicione orientações para geração de conteúdo, pontos principais a destacar...",
    "health.calendar.source": "Fonte",
    "health.calendar.source.official": "Oficial",
    "health.calendar.source.manual": "Manual",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

const weekDaysByLocale: Record<Locale, string[]> = {
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "pt-BR": ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"],
};

const isLocale = (value: string | null): value is Locale =>
  value === "en" || value === "pt-BR";

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
      const template = translations[locale][key] ?? translations.en[key];
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
