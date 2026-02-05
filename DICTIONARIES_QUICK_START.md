# 🚀 Быстрый старт: Справочники PocketBase

## Что это?

Все справочные данные (специализации, цели, форматы, месяцы, события календаря) теперь хранятся в PocketBase и могут управляться через Admin UI.

## 📦 Создание коллекций

### Вариант 1: Автоматический (Рекомендуется)

```bash
# 1. Создайте файл с учетными данными
cp .env.pocketbase.example .env.pocketbase

# 2. Отредактируйте .env.pocketbase
# Укажите ваши учетные данные администратора

# 3. Создайте коллекции
export $(cat .env.pocketbase | xargs) && node scripts/setup-pocketbase-collections.js

# 4. Заполните данными
export $(cat .env.pocketbase | xargs) && node scripts/seed-dictionaries.js
```

### Вариант 2: Импорт JSON

1. Откройте Admin UI: https://pocketbase.processlabs.ru/_/
2. **Settings** → **Import collections**
3. Загрузите `pocketbase_collections_with_dictionaries.json`
4. Нажмите **Import**
5. Запустите скрипт заполнения данными:
   ```bash
   export $(cat .env.pocketbase | xargs) && node scripts/seed-dictionaries.js
   ```

## ✅ Проверка

```bash
# Проверьте что коллекции созданы
curl https://pocketbase.processlabs.ru/api/collections | jq '.[] | select(.name | contains("medical_specializations"))'

# Проверьте данные
curl https://pocketbase.processlabs.ru/api/collections/medical_specializations/records
```

## 📚 Использование в коде

```typescript
import {
  getMedicalSpecializations,
  getContentGoals,
  getInstagramFormats,
  getMonths
} from '@/lib/dictionaries-service';

// Загрузить все справочники
const { specializations, goals, formats, months } = await loadAllDictionaries();

// Или по отдельности
const specializations = await getMedicalSpecializations();
const goals = await getContentGoals();
```

## 🎨 Пример компонента

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getMedicalSpecializations } from '@/lib/dictionaries-service';

export function SpecializationSelect() {
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    getMedicalSpecializations().then(setSpecializations);
  }, []);

  return (
    <select>
      {specializations.map(spec => (
        <option key={spec.id} value={spec.name}>
          {spec.icon} {spec.name}
        </option>
      ))}
    </select>
  );
}
```

## 🔧 Управление через Admin UI

1. Откройте https://pocketbase.processlabs.ru/_/
2. Выберите коллекцию (например, `medical_specializations`)
3. Добавляйте/редактируйте/деактивируйте записи

**Важно:** Используйте `isActive = false` вместо удаления!

## 📖 Полная документация

- [DICTIONARIES_GUIDE.md](./DICTIONARIES_GUIDE.md) - Подробное руководство
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Схема базы данных
- [implementation_plan.md](file:///Users/romangaleev/.gemini/antigravity/brain/ddbd1316-cf7c-4c9c-9265-3002d061bc92/implementation_plan.md) - План реализации

## 🎉 Готово!

Теперь справочники загружаются из PocketBase и могут обновляться без деплоя!
