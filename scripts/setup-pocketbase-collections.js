#!/usr/bin/env node

/**
 * Скрипт для автоматического создания коллекций в PocketBase
 * Использование: node scripts/setup-pocketbase-collections.js
 */

const fs = require('fs');
const path = require('path');

// Конфигурация PocketBase
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || 'admin123456';

console.log('🚀 Настройка коллекций PocketBase...\n');
console.log(`📡 URL: ${POCKETBASE_URL}`);
console.log(`👤 Admin: ${ADMIN_EMAIL}\n`);

// Определение коллекций
const collections = [
    {
        name: 'generations',
        type: 'base',
        schema: [
            { name: 'userId', type: 'text', required: false },
            { name: 'organizationId', type: 'text', required: false },
            { name: 'specialization', type: 'text', required: true },
            { name: 'purpose', type: 'text', required: false },
            { name: 'contentType', type: 'text', required: false },
            { name: 'numberOfPublications', type: 'number', required: true, options: { min: 1 } },
            { name: 'context', type: 'text', required: false },
            { name: 'month', type: 'text', required: false },
            { name: 'goals', type: 'json', required: false },
            { name: 'formatCounts', type: 'json', required: false },
            { name: 'useHealthCalendar', type: 'bool', required: false },
            {
                name: 'status',
                type: 'select',
                required: true,
                options: {
                    maxSelect: 1,
                    values: ['draft', 'generated', 'completed']
                }
            },
            { name: 'generatedAt', type: 'date', required: false }
        ],
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != "" && userId = @request.auth.id',
        deleteRule: '@request.auth.id != "" && userId = @request.auth.id'
    },
    {
        name: 'content_plan_items',
        type: 'base',
        schema: [
            {
                name: 'generationId',
                type: 'relation',
                required: true,
                options: {
                    collectionId: 'generations',
                    cascadeDelete: true,
                    maxSelect: 1
                }
            },
            { name: 'title', type: 'text', required: true },
            { name: 'format', type: 'text', required: true },
            {
                name: 'status',
                type: 'select',
                required: true,
                options: {
                    maxSelect: 1,
                    values: ['draft', 'selected', 'generated']
                }
            },
            { name: 'publishDate', type: 'date', required: false },
            { name: 'approved', type: 'bool', required: false },
            { name: 'painPoint', type: 'text', required: false },
            { name: 'cta', type: 'text', required: false },
            { name: 'contentOutline', type: 'text', required: false },
            { name: 'metadata', type: 'json', required: false }
        ],
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""'
    }
];

async function authenticate() {
    console.log('🔐 Аутентификация в PocketBase...');

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
            throw new Error(`Ошибка аутентификации: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Успешная аутентификация\n');
        return data.token;
    } catch (error) {
        console.error('❌ Ошибка аутентификации:', error.message);
        console.log('\n💡 Убедитесь что:');
        console.log('   1. PocketBase запущен (./pocketbase serve)');
        console.log('   2. Admin аккаунт создан через http://localhost:8090/_/');
        console.log('   3. Правильные учетные данные в переменных окружения\n');
        process.exit(1);
    }
}

async function createCollection(token, collection) {
    console.log(`📦 Создание коллекции: ${collection.name}...`);

    try {
        const response = await fetch(`${POCKETBASE_URL}/api/collections`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(collection)
        });

        if (!response.ok) {
            const error = await response.json();

            // Если коллекция уже существует, обновляем её
            if (response.status === 400 && error.data?.name) {
                console.log(`   ⚠️  Коллекция уже существует, обновляем...`);
                return await updateCollection(token, collection);
            }

            throw new Error(`${response.status}: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        console.log(`   ✅ Создана: ${data.name}\n`);
        return data;
    } catch (error) {
        console.error(`   ❌ Ошибка:`, error.message);
        throw error;
    }
}

async function updateCollection(token, collection) {
    try {
        // Получаем существующую коллекцию
        const getResponse = await fetch(`${POCKETBASE_URL}/api/collections`, {
            headers: { 'Authorization': token }
        });

        const collections = await getResponse.json();
        const existing = collections.find(c => c.name === collection.name);

        if (!existing) {
            throw new Error('Коллекция не найдена');
        }

        // Обновляем коллекцию
        const response = await fetch(`${POCKETBASE_URL}/api/collections/${existing.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(collection)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`${response.status}: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        console.log(`   ✅ Обновлена: ${data.name}\n`);
        return data;
    } catch (error) {
        console.error(`   ❌ Ошибка обновления:`, error.message);
        throw error;
    }
}

async function checkConnection() {
    console.log('🔍 Проверка подключения к PocketBase...');

    try {
        const response = await fetch(`${POCKETBASE_URL}/api/health`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        console.log('✅ PocketBase доступен\n');
        return true;
    } catch (error) {
        console.error('❌ PocketBase недоступен:', error.message);
        console.log('\n💡 Запустите PocketBase командой: ./pocketbase serve\n');
        return false;
    }
}

async function main() {
    // Проверка подключения
    const isConnected = await checkConnection();
    if (!isConnected) {
        process.exit(1);
    }

    // Аутентификация
    const token = await authenticate();

    // Создание коллекций
    console.log('📚 Создание коллекций...\n');

    for (const collection of collections) {
        try {
            await createCollection(token, collection);
        } catch (error) {
            console.error(`Не удалось создать коллекцию ${collection.name}`);
            // Продолжаем со следующей коллекцией
        }
    }

    console.log('🎉 Настройка завершена!\n');
    console.log('📋 Следующие шаги:');
    console.log('   1. Откройте Admin UI: http://localhost:8090/_/');
    console.log('   2. Проверьте созданные коллекции');
    console.log('   3. Создайте тестового пользователя в коллекции users');
    console.log('   4. Запустите приложение: npm run dev\n');
}

// Запуск
main().catch(error => {
    console.error('\n❌ Критическая ошибка:', error);
    process.exit(1);
});
