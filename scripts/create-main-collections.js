#!/usr/bin/env node

/**
 * Скрипт для создания коллекций generations и content_plan_items через PocketBase API
 */

const PocketBase = require('pocketbase/cjs');
require('dotenv').config({ path: '.env.pocketbase' });

const pb = new PocketBase(process.env.POCKETBASE_URL || 'https://pocketbase.processlabs.ru/');

async function createCollections() {
    try {
        console.log('🔐 Аутентификация...');
        console.log('URL:', pb.baseUrl);
        console.log('Email:', process.env.POCKETBASE_ADMIN_EMAIL);

        // Пробуем аутентифицироваться как admin
        try {
            await pb.admins.authWithPassword(
                process.env.POCKETBASE_ADMIN_EMAIL,
                process.env.POCKETBASE_ADMIN_PASSWORD
            );
            console.log('✅ Успешная аутентификация как admin\n');
        } catch (authError) {
            console.log('⚠️  Admin аутентификация не удалась:', authError.message);
            console.log('Попробуем создать коллекции без аутентификации...\n');
        }

        // Создание коллекции generations
        console.log('📦 Создание коллекции: generations...');

        const generationsSchema = {
            name: 'generations',
            type: 'base',
            schema: [
                { name: 'userId', type: 'text', required: false },
                { name: 'title', type: 'text', required: true },
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
        };

        try {
            const generationsCollection = await pb.collections.create(generationsSchema);
            console.log('✅ Коллекция generations создана:', generationsCollection.id);
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  Коллекция generations уже существует');
            } else {
                throw error;
            }
        }

        console.log('');

        // Создание коллекции content_plan_items
        console.log('📦 Создание коллекции: content_plan_items...');

        const contentPlanItemsSchema = {
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
        };

        try {
            const contentPlanItemsCollection = await pb.collections.create(contentPlanItemsSchema);
            console.log('✅ Коллекция content_plan_items создана:', contentPlanItemsCollection.id);
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  Коллекция content_plan_items уже существует');
            } else {
                throw error;
            }
        }

        console.log('');
        console.log('🎉 Все коллекции успешно созданы!');
        console.log('');
        console.log('📊 Проверьте в Admin UI: ' + pb.baseUrl + '_/');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        if (error.response) {
            console.error('Детали:', error.response);
        }
        process.exit(1);
    }
}

createCollections();
