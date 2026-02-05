# 📚 Руководство по использованию справочников PocketBase

## Обзор

Все справочные данные (специализации, цели, форматы и т.д.) теперь хранятся в PocketBase и могут управляться через Admin UI без изменения кода.

## 🗄️ Коллекции-справочники

### 1. `medical_specializations`
Медицинские специализации (10 записей).

**Поля:**
- `name` - Название (Odontologia, Dermatologia и т.д.)
- `nameEn` - Название на английском
- `slug` - URL-friendly идентификатор
- `icon` - Emoji иконка
- `sortOrder` - Порядок сортировки

### 2. `content_goals`
Цели контента (5 записей).

**Поля:**
- `name` - Название (Conversão, Autoridade и т.д.)
- `defaultWeight` - Вес для авто-распределения
- `slug` - Идентификатор

### 3. `instagram_formats`
Форматы Instagram (5 записей).

**Поля:**
- `name` - Название (Reels, Carrossel и т.д.)
- `slug` - Идентификатор (reels, carrossel)
- `defaultCount` - Количество по умолчанию

### 4. `months`
Месяцы (12 записей).

**Поля:**
- `name` - Название (Janeiro, Fevereiro и т.д.)
- `number` - Номер месяца (1-12)
- `slug` - Идентификатор

### 5. `health_calendar_events`
События календаря здоровья (~20 записей).

**Поля:**
- `monthId` - Связь с месяцем
- `specializationId` - Связь со специализацией
- `eventName` - Название события
- `description` - Описание
- `color` - Цвет кампании
- `year` - Год

---

## 🚀 Использование в коде

### Загрузка справочников

```typescript
import {
  getMedicalSpecializations,
  getContentGoals,
  getInstagramFormats,
  getMonths,
  getHealthCalendarEventsByMonth
} from '@/lib/dictionaries-service';

// Загрузить все специализации
const specializations = await getMedicalSpecializations();

// Загрузить все цели
const goals = await getContentGoals();

// Загрузить все форматы
const formats = await getInstagramFormats();

// Загрузить все месяцы
const months = await getMonths();
```

### Загрузка всех справочников одновременно

```typescript
import { loadAllDictionaries } from '@/lib/dictionaries-service';

const { specializations, goals, formats, months } = await loadAllDictionaries();
```

### Поиск по slug

```typescript
import {
  getMedicalSpecializationBySlug,
  getContentGoalBySlug
} from '@/lib/dictionaries-service';

const odontologia = await getMedicalSpecializationBySlug('odontologia');
const conversao = await getContentGoalBySlug('conversao');
```

### События календаря

```typescript
import {
  getHealthCalendarEventsByMonth,
  getUpcomingHealthEvents
} from '@/lib/dictionaries-service';

// Получить события для конкретного месяца и специализации
const events = await getHealthCalendarEventsByMonth(
  'Outubro',
  'Mamografia/Mastologia',
  2025
);

// Получить предстоящие события
const upcoming = await getUpcomingHealthEvents(
  10, // Текущий месяц (октябрь)
  'Odontologia',
  3 // Лимит
);
```

---

## 🎨 Использование в компонентах

### Пример: Выпадающий список специализаций

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getMedicalSpecializations } from '@/lib/dictionaries-service';
import { PBMedicalSpecialization } from '@/lib/pocketbase-types';

export function SpecializationSelect() {
  const [specializations, setSpecializations] = useState<PBMedicalSpecialization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpecializations();
  }, []);

  async function loadSpecializations() {
    try {
      const data = await getMedicalSpecializations();
      setSpecializations(data);
    } catch (error) {
      console.error('Erro ao carregar especializações:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <select>
      <option value="">Selecione uma especialização</option>
      {specializations.map(spec => (
        <option key={spec.id} value={spec.name}>
          {spec.icon} {spec.name}
        </option>
      ))}
    </select>
  );
}
```

### Пример: Список целей с drag-and-drop

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getContentGoals } from '@/lib/dictionaries-service';
import { PBContentGoal } from '@/lib/pocketbase-types';

export function GoalsSelector() {
  const [goals, setGoals] = useState<PBContentGoal[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    const data = await getContentGoals();
    setGoals(data);
  }

  return (
    <div>
      {goals.map(goal => (
        <label key={goal.id}>
          <input
            type="checkbox"
            value={goal.name}
            checked={selectedGoals.includes(goal.name)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedGoals([...selectedGoals, goal.name]);
              } else {
                setSelectedGoals(selectedGoals.filter(g => g !== goal.name));
              }
            }}
          />
          {goal.name}
          <span className="text-sm text-gray-500">{goal.description}</span>
        </label>
      ))}
    </div>
  );
}
```

---

## 💾 Кэширование

Сервис автоматически кэширует справочники на 5 минут для уменьшения запросов к API.

### Принудительное обновление

```typescript
// Обновить кэш
const specializations = await getMedicalSpecializations(true);

// Очистить весь кэш
import { clearDictionariesCache } from '@/lib/dictionaries-service';
clearDictionariesCache();
```

---

## 🔧 Управление через Admin UI

### Добавление новой специализации

1. Откройте Admin UI: https://pocketbase.processlabs.ru/_/
2. Перейдите в коллекцию `medical_specializations`
3. Нажмите **New record**
4. Заполните:
   - **name**: Psicologia
   - **nameEn**: Psychology
   - **slug**: psicologia
   - **icon**: 🧠
   - **isActive**: ✅
   - **sortOrder**: 11
5. Сохраните

### Редактирование события календаря

1. Откройте коллекцию `health_calendar_events`
2. Найдите нужное событие
3. Нажмите на запись для редактирования
4. Измените поля
5. Сохраните

### Деактивация элемента

Вместо удаления лучше деактивировать:
1. Откройте запись
2. Снимите галочку с `isActive`
3. Сохраните

Элемент перестанет отображаться в приложении, но останется в базе.

---

## 📊 Миграция данных

Если нужно обновить данные массово, используйте скрипт:

```bash
# Заполнить справочники начальными данными
export $(cat .env.pocketbase | xargs) && node scripts/seed-dictionaries.js
```

---

## 🌐 Мультиязычность

Все справочники поддерживают английский язык через поля `nameEn`, `descriptionEn`.

### Получение названия на нужном языке

```typescript
function getLocalizedName(item: PBMedicalSpecialization, locale: string): string {
  return locale === 'en' && item.nameEn ? item.nameEn : item.name;
}

const specializations = await getMedicalSpecializations();
const names = specializations.map(s => getLocalizedName(s, 'en'));
```

---

## 🔒 Безопасность

- **Чтение**: Публичный доступ (без аутентификации)
- **Создание/Редактирование/Удаление**: Только администраторы

Это позволяет форме загружать справочники до входа пользователя, но защищает от несанкционированных изменений.

---

## 🐛 Отладка

### Проверка доступности справочников

```bash
# Получить все специализации
curl https://pocketbase.processlabs.ru/api/collections/medical_specializations/records

# Получить все цели
curl https://pocketbase.processlabs.ru/api/collections/content_goals/records

# Получить события календаря
curl https://pocketbase.processlabs.ru/api/collections/health_calendar_events/records?expand=monthId,specializationId
```

### Логирование в консоль

```typescript
import { getMedicalSpecializations } from '@/lib/dictionaries-service';

const specializations = await getMedicalSpecializations();
console.log('Специализации:', specializations);
```

---

## 📚 Полезные ссылки

- [PocketBase API Documentation](https://pocketbase.io/docs/api-records/)
- [TypeScript Types](file:///Users/romangaleev/Documents/Antigravity/ContentGenerator-app/lib/pocketbase-types.ts)
- [Dictionaries Service](file:///Users/romangaleev/Documents/Antigravity/ContentGenerator-app/lib/dictionaries-service.ts)
- [Seed Script](file:///Users/romangaleev/Documents/Antigravity/ContentGenerator-app/scripts/seed-dictionaries.js)
