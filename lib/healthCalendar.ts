import { HealthCalendarEvent, MonthOption, MedicalSpecialization } from "./types";

/**
 * Calendário de Saúde 2025 - Datas importantes para planejamento de conteúdo médico
 */
export const healthCalendar2025: HealthCalendarEvent[] = [
    // Janeiro
    {
        month: "Janeiro",
        specialization: "Dermatologia",
        eventName: "Janeiro Branco",
        description: "Mês de conscientização sobre saúde mental e bem-estar emocional"
    },

    // Fevereiro
    {
        month: "Fevereiro",
        specialization: "Cardiologia",
        eventName: "Dia Mundial do Câncer (04/02)",
        description: "Conscientização sobre prevenção e tratamento do câncer"
    },

    // Março
    {
        month: "Março",
        specialization: "Oftalmologia",
        eventName: "Março Lilás",
        description: "Prevenção do câncer de colo de útero"
    },
    {
        month: "Março",
        specialization: "Ginecologia e Obstetrícia",
        eventName: "Dia Internacional da Mulher (08/03)",
        description: "Saúde da mulher e prevenção"
    },

    // Abril
    {
        month: "Abril",
        specialization: "Pediatria",
        eventName: "Abril Azul",
        description: "Conscientização sobre o autismo"
    },
    {
        month: "Abril",
        specialization: "Dermatologia",
        eventName: "Abril Marrom",
        description: "Prevenção da cegueira"
    },

    // Maio
    {
        month: "Maio",
        specialization: "Odontologia",
        eventName: "Maio Amarelo",
        description: "Conscientização sobre segurança no trânsito"
    },
    {
        month: "Maio",
        specialization: "Mamografia/Mastologia",
        eventName: "Maio Roxo",
        description: "Conscientização sobre doenças inflamatórias intestinais"
    },

    // Junho
    {
        month: "Junho",
        specialization: "Oftalmologia",
        eventName: "Junho Vermelho",
        description: "Doação de sangue"
    },
    {
        month: "Junho",
        specialization: "Ortopedia",
        eventName: "Junho Laranja",
        description: "Conscientização sobre anemia e leucemia"
    },

    // Julho
    {
        month: "Julho",
        specialization: "Cardiologia",
        eventName: "Julho Amarelo",
        description: "Prevenção das hepatites virais"
    },
    {
        month: "Julho",
        specialization: "Pediatria",
        eventName: "Dia Mundial do Câncer Infantil",
        description: "Conscientização sobre câncer infantil"
    },

    // Agosto
    {
        month: "Agosto",
        specialization: "Mamografia/Mastologia",
        eventName: "Agosto Dourado",
        description: "Incentivo ao aleitamento materno"
    },

    // Setembro
    {
        month: "Setembro",
        specialization: "Cardiologia",
        eventName: "Setembro Vermelho",
        description: "Prevenção de doenças cardiovasculares"
    },
    {
        month: "Setembro",
        specialization: "Pediatria",
        eventName: "Setembro Amarelo",
        description: "Prevenção ao suicídio e saúde mental"
    },

    // Outubro
    {
        month: "Outubro",
        specialization: "Mamografia/Mastologia",
        eventName: "Outubro Rosa",
        description: "Conscientização sobre câncer de mama"
    },

    // Novembro
    {
        month: "Novembro",
        specialization: "Endocrinologia",
        eventName: "Novembro Azul",
        description: "Conscientização sobre câncer de próstata e saúde do homem"
    },
    {
        month: "Novembro",
        specialization: "Nutrologia/Nutrição",
        eventName: "Dia Mundial do Diabetes (14/11)",
        description: "Prevenção e controle do diabetes"
    },

    // Dezembro
    {
        month: "Dezembro",
        specialization: "Dermatologia",
        eventName: "Dezembro Laranja",
        description: "Prevenção do câncer de pele"
    },
    {
        month: "Dezembro",
        specialization: "Pediatria",
        eventName: "Dezembro Vermelho",
        description: "Prevenção de HIV/AIDS e ISTs"
    }
];

/**
 * Retorna eventos do calendário de saúde filtrados por mês e/ou especialização
 */
export function getHealthEvents(
    month?: MonthOption,
    specialization?: MedicalSpecialization
): HealthCalendarEvent[] {
    let events = healthCalendar2025;

    if (month) {
        events = events.filter(event => event.month === month);
    }

    if (specialization) {
        events = events.filter(event => event.specialization === specialization);
    }

    return events;
}

/**
 * Retorna os próximos eventos do calendário de saúde baseado no mês atual
 */
export function getUpcomingHealthEvents(
    currentMonth: MonthOption,
    specialization?: MedicalSpecialization,
    limit: number = 3
): HealthCalendarEvent[] {
    const months: MonthOption[] = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const currentIndex = months.indexOf(currentMonth);
    const upcomingMonths = [
        ...months.slice(currentIndex),
        ...months.slice(0, currentIndex)
    ];

    let events: HealthCalendarEvent[] = [];

    for (const month of upcomingMonths) {
        const monthEvents = getHealthEvents(month, specialization);
        events = [...events, ...monthEvents];

        if (events.length >= limit) {
            break;
        }
    }

    return events.slice(0, limit);
}
