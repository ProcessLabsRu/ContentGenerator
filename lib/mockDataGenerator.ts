import {
  ContentPlanItem,
  GenerationFormData,
  SpecializationOption,
  PurposeOption,
  ContentTypeOption,
  InstagramFormat,
} from "./types";

const formats: InstagramFormat[] = [
  "Reels",
  "Carrossel",
  "Post Estático",
  "Stories",
  "Live/Collab",
];

const statuses: ContentPlanItem["status"][] = ["Rascunho"];

const generateTitle = (
  specialization: string,
  purpose: string,
  contentType: string,
  index: number
): string => {
  const templates = [
    `10 Estratégias de ${purpose} para ${specialization} em 2024`,
    `Como Dominar ${purpose} em ${specialization}`,
    `O Guia Definitivo de Conteúdo ${contentType} para ${specialization}`,
    `${specialization} ${purpose}: Melhores Práticas e Dicas`,
    `Transforme sua Estratégia de ${specialization} com Conteúdo ${contentType}`,
    `Por que ${purpose} é Importante para Negócios de ${specialization}`,
    `Conteúdo ${contentType} de ${specialization} que Converte`,
    `O Futuro de ${purpose} em ${specialization}`,
    `5 Ideias de Conteúdo ${contentType} para ${specialization} que Trazem Resultados`,
    `${purpose}: Um Caso de Sucesso em ${specialization}`,
    `Desmembrando Estratégias de ${purpose} para ${specialization}`,
    `Modelos Essenciais de ${contentType} para ${specialization}`,
    `Tendências em ${specialization}: Edição ${purpose}`,
    `Da Ideia ao Impacto: Conteúdo ${contentType} para ${specialization}`,
    `Maximizando o ROI de ${purpose} em ${specialization}`,
  ];

  return templates[index % templates.length];
};

const generatePainPoint = (
  specialization: string,
  purpose: string
): string => {
  const painPoints: Record<string, Record<string, string[]>> = {
    "Lead Generation": {
      "Digital Marketing": [
        "Dificuldade em atrair leads qualificados que convertem",
        "Baixas taxas de conversão de tráfego para leads",
        "Dificuldade em identificar o perfil de cliente ideal",
      ],
      SaaS: [
        "Ciclos de vendas longos impedindo fluxo consistente de leads",
        "Custos de aquisição de clientes altos",
        "Desafios em demonstrar valor do produto rapidamente",
      ],
      "E-commerce": [
        "Taxas de abandono de carrinho afetando receita",
        "Dificuldade na personalização de experiências de compra",
        "Concorrência com grandes marketplaces",
      ],
    },
    "Brand Awareness": {
      "Digital Marketing": [
        "Visibilidade limitada em um mercado saturado",
        "Dificuldade em se destacar da concorrência",
        "Baixo reconhecimento de marca entre o público-alvo",
      ],
      SaaS: [
        "Complexidade técnica torna a mensagem da marca pouco clara",
        "Competindo com players estabelecidos por atenção",
        "Educando o mercado sobre nova categoria",
      ],
      "E-commerce": [
        "Construindo confiança com novos clientes",
        "Estabelecendo identidade de marca em mercados saturados",
        "Criando experiências de marca memoráveis online",
      ],
    },
    "Thought Leadership": {
      "Digital Marketing": [
        "Estabelecendo credibilidade em indústria de rápida evolução",
        "Gerando insights originais que ressoam",
        "Construindo autoridade entre pares da indústria",
      ],
      SaaS: [
        "Posicionando-se como líder em inovação",
        "Traduzindo expertise técnica em insights acessíveis",
        "Moldando conversas da indústria",
      ],
      Healthcare: [
        "Comunicando informações médicas complexas claramente",
        "Construindo confiança com pacientes e profissionais",
        "Navegando restrições regulatórias na comunicação",
      ],
    },
  };

  const specializationPainPoints =
    painPoints[purpose]?.[specialization] ||
    painPoints[purpose]?.["Digital Marketing"] || [
      `Desafios em alcançar objetivos de ${purpose.toLowerCase()}`,
      `Dificuldade em medir a eficácia de ${purpose.toLowerCase()}`,
      `Destacar-se no cenário competitivo de ${specialization.toLowerCase()}`,
    ];

  return (
    specializationPainPoints[
    Math.floor(Math.random() * specializationPainPoints.length)
    ] || `Principais desafios em ${specialization} para ${purpose}`
  );
};

const generateOutline = (
  specialization: string,
  purpose: string,
  contentType: string
): string => {
  const outlines = [
    `Introdução a ${purpose} em ${specialization} • Princípios chave e frameworks • Exemplos reais e estudos de caso • Melhores práticas e dicas acionáveis • Erros comuns a evitar • Tendências futuras e oportunidades`,
    `Entendendo o cenário de ${specialization} • Por que ${purpose} importa agora • Guia de implementação passo a passo • Ferramentas e recursos necessários • Medindo sucesso e KPIs • Próximos passos para sua estratégia`,
    `O problema: Desafios atuais em ${specialization} • A solução: Abordagem ${contentType} • Estratégias de implementação • Métricas de sucesso • Estudos de caso e exemplos • Checklist para começar`,
    `Visão geral de estratégias de ${purpose} • Considerações específicas de ${specialization} • Framework de criação de conteúdo • Canais de distribuição • Táticas de engajamento • Medição de ROI`,
    `Definindo seus objetivos de ${purpose} • Análise de audiência de ${specialization} • Planejamento e calendário de conteúdo • Framework de execução • Técnicas de otimização • Escalando seus esforços`,
  ];

  return outlines[Math.floor(Math.random() * outlines.length)];
};

const generateCTA = (purpose: string, contentType: string): string => {
  const ctas: Record<string, string[]> = {
    "Lead Generation": [
      "Baixe nosso guia gratuito para começar",
      "Agende uma consultoria para discutir sua estratégia",
      "Teste nossa ferramenta gratuitamente por 14 dias",
      "Receba seu plano de conteúdo personalizado",
      "Agende uma demonstração para ver como funciona",
    ],
    "Brand Awareness": [
      "Siga-nos para mais insights",
      "Junte-se à nossa comunidade de inovadores",
      "Inscreva-se em nossa newsletter",
      "Compartilhe com sua rede",
      "Explore mais recursos",
    ],
    "Thought Leadership": [
      "Conecte-se conosco no LinkedIn",
      "Baixe o relatório de pesquisa completo",
      "Participe do nosso próximo webinar",
      "Leia nossa última análise da indústria",
      "Entre em contato para colaborar",
    ],
    "Customer Education": [
      "Acesse nossa biblioteca de recursos",
      "Inscreva-se em nosso curso gratuito",
      "Assista à nossa série de tutoriais",
      "Baixe o guia completo",
      "Junte-se à nossa comunidade de aprendizado",
    ],
  };

  const purposeCTAs =
    ctas[purpose] || [
      "Saiba mais sobre nossas soluções",
      "Comece hoje mesmo",
      "Entre em contato para mais informações",
      "Explore nossos recursos",
    ];

  return purposeCTAs[Math.floor(Math.random() * purposeCTAs.length)];
};

export function generateMockContentPlan(
  formData: GenerationFormData
): ContentPlanItem[] {
  const items: ContentPlanItem[] = [];
  const count = Math.min(formData.numberOfPublications, 15);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);

  for (let i = 0; i < count; i++) {
    const format = formats[Math.floor(Math.random() * formats.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const publishDate = new Date(startDate);
    publishDate.setDate(startDate.getDate() + i);
    const publishDateValue = publishDate.toISOString().slice(0, 10);

    items.push({
      id: `plan-item-${Date.now()}-${i}`,
      format,
      title: generateTitle(
        formData.specialization,
        formData.purpose,
        formData.contentType,
        i
      ),
      pain_point: generatePainPoint(
        formData.specialization,
        formData.purpose
      ),
      content_outline: generateOutline(
        formData.specialization,
        formData.purpose,
        formData.contentType
      ),
      cta: generateCTA(formData.purpose, formData.contentType),
      status,
      publish_date: publishDateValue,
    });
  }

  return items;
}
