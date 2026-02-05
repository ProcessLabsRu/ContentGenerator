#!/usr/bin/env node

/**
 * Скрипт для заполнения справочников начальными данными
 * Использование: node scripts/seed-dictionaries.js
 */

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || 'admin123456';

console.log('🌱 Заполнение справочников PocketBase...\n');
console.log(`📡 URL: ${POCKETBASE_URL}`);
console.log(`👤 Admin: ${ADMIN_EMAIL}\n`);

// Данные для заполнения
const MEDICAL_SPECIALIZATIONS = [
    { name: 'Mamografia/Mastologia', nameEn: 'Mammography/Mastology', slug: 'mamografia-mastologia', icon: '🩺', sortOrder: 1, isActive: true },
    { name: 'Odontologia', nameEn: 'Dentistry', slug: 'odontologia', icon: '🦷', sortOrder: 2, isActive: true },
    { name: 'Ginecologia e Obstetrícia', nameEn: 'Gynecology and Obstetrics', slug: 'ginecologia-obstetricia', icon: '👶', sortOrder: 3, isActive: true },
    { name: 'Dermatologia', nameEn: 'Dermatology', slug: 'dermatologia', icon: '🧴', sortOrder: 4, isActive: true },
    { name: 'Pediatria', nameEn: 'Pediatrics', slug: 'pediatria', icon: '👨‍⚕️', sortOrder: 5, isActive: true },
    { name: 'Cardiologia', nameEn: 'Cardiology', slug: 'cardiologia', icon: '❤️', sortOrder: 6, isActive: true },
    { name: 'Ortopedia', nameEn: 'Orthopedics', slug: 'ortopedia', icon: '🦴', sortOrder: 7, isActive: true },
    { name: 'Oftalmologia', nameEn: 'Ophthalmology', slug: 'oftalmologia', icon: '👁️', sortOrder: 8, isActive: true },
    { name: 'Endocrinologia', nameEn: 'Endocrinology', slug: 'endocrinologia', icon: '🧬', sortOrder: 9, isActive: true },
    { name: 'Nutrologia/Nutrição', nameEn: 'Nutrology/Nutrition', slug: 'nutrologia-nutricao', icon: '🥗', sortOrder: 10, isActive: true }
];

const CONTENT_GOALS = [
    { name: 'Conversão', nameEn: 'Conversion', slug: 'conversao', defaultWeight: 1.5, sortOrder: 1, isActive: true, description: 'Foco em gerar leads e conversões' },
    { name: 'Autoridade', nameEn: 'Authority', slug: 'autoridade', defaultWeight: 1.2, sortOrder: 2, isActive: true, description: 'Estabelecer expertise e credibilidade' },
    { name: 'Crescimento', nameEn: 'Growth', slug: 'crescimento', defaultWeight: 1.3, sortOrder: 3, isActive: true, description: 'Aumentar alcance e seguidores' },
    { name: 'Educação', nameEn: 'Education', slug: 'educacao', defaultWeight: 1.0, sortOrder: 4, isActive: true, description: 'Educar e informar o público' },
    { name: 'Engajamento', nameEn: 'Engagement', slug: 'engajamento', defaultWeight: 1.1, sortOrder: 5, isActive: true, description: 'Aumentar interação e participação' }
];

const INSTAGRAM_FORMATS = [
    { name: 'Reels', nameEn: 'Reels', slug: 'reels', icon: '🎬', defaultCount: 6, sortOrder: 1, isActive: true, description: 'Vídeo dinâmico para alcance' },
    { name: 'Carrossel', nameEn: 'Carousel', slug: 'carrossel', icon: '📸', defaultCount: 10, sortOrder: 2, isActive: true, description: 'Slides educacionais' },
    { name: 'Post Estático', nameEn: 'Static Post', slug: 'postEstatico', icon: '🖼️', defaultCount: 5, sortOrder: 3, isActive: true, description: 'Imagem fixa para branding' },
    { name: 'Stories', nameEn: 'Stories', slug: 'stories', icon: '📱', defaultCount: 15, sortOrder: 4, isActive: true, description: 'Atualizações sequenciais' },
    { name: 'Live/Collab', nameEn: 'Live/Collab', slug: 'liveCollab', icon: '🎥', defaultCount: 2, sortOrder: 5, isActive: true, description: 'Networking em tempo real' }
];

const MONTHS = [
    { name: 'Janeiro', nameEn: 'January', number: 1, slug: 'janeiro', isActive: true },
    { name: 'Fevereiro', nameEn: 'February', number: 2, slug: 'fevereiro', isActive: true },
    { name: 'Março', nameEn: 'March', number: 3, slug: 'marco', isActive: true },
    { name: 'Abril', nameEn: 'April', number: 4, slug: 'abril', isActive: true },
    { name: 'Maio', nameEn: 'May', number: 5, slug: 'maio', isActive: true },
    { name: 'Junho', nameEn: 'June', number: 6, slug: 'junho', isActive: true },
    { name: 'Julho', nameEn: 'July', number: 7, slug: 'julho', isActive: true },
    { name: 'Agosto', nameEn: 'August', number: 8, slug: 'agosto', isActive: true },
    { name: 'Setembro', nameEn: 'September', number: 9, slug: 'setembro', isActive: true },
    { name: 'Outubro', nameEn: 'October', number: 10, slug: 'outubro', isActive: true },
    { name: 'Novembro', nameEn: 'November', number: 11, slug: 'novembro', isActive: true },
    { name: 'Dezembro', nameEn: 'December', number: 12, slug: 'dezembro', isActive: true }
];

// События календаря здоровья (будут заполнены после создания месяцев и специализаций)
const HEALTH_CALENDAR_EVENTS = [
    { month: 'Janeiro', specialization: 'Dermatologia', eventName: 'Janeiro Branco', description: 'Mês de conscientização sobre saúde mental e bem-estar emocional', color: 'branco', year: 2025 },
    { month: 'Fevereiro', specialization: 'Cardiologia', eventName: 'Dia Mundial do Câncer', description: 'Conscientização sobre prevenção e tratamento do câncer', date: '04/02', year: 2025 },
    { month: 'Março', specialization: 'Oftalmologia', eventName: 'Março Lilás', description: 'Prevenção do câncer de colo de útero', color: 'lilás', year: 2025 },
    { month: 'Março', specialization: 'Ginecologia e Obstetrícia', eventName: 'Dia Internacional da Mulher', description: 'Saúde da mulher e prevenção', date: '08/03', year: 2025 },
    { month: 'Abril', specialization: 'Pediatria', eventName: 'Abril Azul', description: 'Conscientização sobre o autismo', color: 'azul', year: 2025 },
    { month: 'Abril', specialization: 'Dermatologia', eventName: 'Abril Marrom', description: 'Prevenção da cegueira', color: 'marrom', year: 2025 },
    { month: 'Maio', specialization: 'Odontologia', eventName: 'Maio Amarelo', description: 'Conscientização sobre segurança no trânsito', color: 'amarelo', year: 2025 },
    { month: 'Maio', specialization: 'Mamografia/Mastologia', eventName: 'Maio Roxo', description: 'Conscientização sobre doenças inflamatórias intestinais', color: 'roxo', year: 2025 },
    { month: 'Junho', specialization: 'Oftalmologia', eventName: 'Junho Vermelho', description: 'Doação de sangue', color: 'vermelho', year: 2025 },
    { month: 'Junho', specialization: 'Ortopedia', eventName: 'Junho Laranja', description: 'Conscientização sobre anemia e leucemia', color: 'laranja', year: 2025 },
    { month: 'Julho', specialization: 'Cardiologia', eventName: 'Julho Amarelo', description: 'Prevenção das hepatites virais', color: 'amarelo', year: 2025 },
    { month: 'Julho', specialization: 'Pediatria', eventName: 'Dia Mundial do Câncer Infantil', description: 'Conscientização sobre câncer infantil', year: 2025 },
    { month: 'Agosto', specialization: 'Mamografia/Mastologia', eventName: 'Agosto Dourado', description: 'Incentivo ao aleitamento materno', color: 'dourado', year: 2025 },
    { month: 'Setembro', specialization: 'Cardiologia', eventName: 'Setembro Vermelho', description: 'Prevenção de doenças cardiovasculares', color: 'vermelho', year: 2025 },
    { month: 'Setembro', specialization: 'Pediatria', eventName: 'Setembro Amarelo', description: 'Prevenção ao suicídio e saúde mental', color: 'amarelo', year: 2025 },
    { month: 'Outubro', specialization: 'Mamografia/Mastologia', eventName: 'Outubro Rosa', description: 'Conscientização sobre câncer de mama', color: 'rosa', year: 2025 },
    { month: 'Novembro', specialization: 'Endocrinologia', eventName: 'Novembro Azul', description: 'Conscientização sobre câncer de próstata e saúde do homem', color: 'azul', year: 2025 },
    { month: 'Novembro', specialization: 'Nutrologia/Nutrição', eventName: 'Dia Mundial do Diabetes', description: 'Prevenção e controle do diabetes', date: '14/11', year: 2025 },
    { month: 'Dezembro', specialization: 'Dermatologia', eventName: 'Dezembro Laranja', description: 'Prevenção do câncer de pele', color: 'laranja', year: 2025 },
    { month: 'Dezembro', specialization: 'Pediatria', eventName: 'Dezembro Vermelho', description: 'Prevenção de HIV/AIDS e ISTs', color: 'vermelho', year: 2025 }
];

async function authenticate() {
    console.log('🔐 Аутентификация...');

    try {
        const response = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identity: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            })
        });

        if (!response.ok) {
            throw new Error(`Ошибка аутентификации: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Успешная аутентификация\n');
        return data.token;
    } catch (error) {
        console.error('❌ Ошибка аутентификации:', error.message);
        process.exit(1);
    }
}

async function seedCollection(token, collectionName, data) {
    console.log(`📦 Заполнение коллекции: ${collectionName}...`);
    const created = [];

    for (const item of data) {
        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/${collectionName}/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(item)
            });

            if (!response.ok) {
                const error = await response.json();
                console.log(`   ⚠️  Пропущено: ${item.name || item.eventName} (возможно уже существует)`);
                continue;
            }

            const record = await response.json();
            created.push(record);
            console.log(`   ✅ Создано: ${item.name || item.eventName}`);
        } catch (error) {
            console.error(`   ❌ Ошибка:`, error.message);
        }
    }

    console.log(`   📊 Создано записей: ${created.length}/${data.length}\n`);
    return created;
}

async function seedHealthCalendarEvents(token, months, specializations) {
    console.log(`📦 Заполнение коллекции: health_calendar_events...`);

    // Создаем мапу месяцев и специализаций для быстрого поиска ID
    const monthsMap = {};
    months.forEach(m => { monthsMap[m.name] = m.id; });

    const specializationsMap = {};
    specializations.forEach(s => { specializationsMap[s.name] = s.id; });

    const created = [];

    for (const event of HEALTH_CALENDAR_EVENTS) {
        try {
            const eventData = {
                monthId: monthsMap[event.month],
                specializationId: event.specialization ? specializationsMap[event.specialization] : null,
                eventName: event.eventName,
                description: event.description,
                color: event.color || null,
                date: event.date || null,
                year: event.year,
                isActive: true
            };

            const response = await fetch(`${POCKETBASE_URL}/api/collections/health_calendar_events/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                const error = await response.json();
                console.log(`   ⚠️  Пропущено: ${event.eventName} (возможно уже существует)`);
                continue;
            }

            const record = await response.json();
            created.push(record);
            console.log(`   ✅ Создано: ${event.eventName}`);
        } catch (error) {
            console.error(`   ❌ Ошибка:`, error.message);
        }
    }

    console.log(`   📊 Создано записей: ${created.length}/${HEALTH_CALENDAR_EVENTS.length}\n`);
    return created;
}

async function main() {
    const token = await authenticate();

    // Заполняем справочники
    console.log('🌱 Заполнение справочников...\n');

    const specializations = await seedCollection(token, 'medical_specializations', MEDICAL_SPECIALIZATIONS);
    const goals = await seedCollection(token, 'content_goals', CONTENT_GOALS);
    const formats = await seedCollection(token, 'instagram_formats', INSTAGRAM_FORMATS);
    const months = await seedCollection(token, 'months', MONTHS);

    // Заполняем события календаря (требуют ID месяцев и специализаций)
    await seedHealthCalendarEvents(token, months, specializations);

    console.log('🎉 Заполнение завершено!\n');
    console.log('📊 Статистика:');
    console.log(`   - Специализации: ${specializations.length}`);
    console.log(`   - Цели контента: ${goals.length}`);
    console.log(`   - Форматы Instagram: ${formats.length}`);
    console.log(`   - Месяцы: ${months.length}`);
    console.log(`   - События календаря: ~20\n`);

    console.log('📋 Следующие шаги:');
    console.log('   1. Откройте Admin UI: ' + POCKETBASE_URL + '/_/');
    console.log('   2. Проверьте созданные записи');
    console.log('   3. Обновите приложение для загрузки из PocketBase\n');
}

main().catch(error => {
    console.error('\n❌ Критическая ошибка:', error);
    process.exit(1);
});
