# 🛠️ Руководство для разработчиков

Это руководство поможет вам разобраться в структуре проекта и начать разработку.

## 📁 Структура проекта

```
ContentGenerator-app/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Главная страница
│   ├── layout.tsx                # Корневой layout с AuthProvider
│   └── globals.css               # Глобальные стили
│
├── components/                   # React компоненты
│   ├── auth/                     # Компоненты авторизации
│   │   ├── AuthProvider.tsx      # Контекст авторизации
│   │   ├── LoginForm.tsx         # Форма входа
│   │   ├── ProtectedRoute.tsx    # HOC для защиты маршрутов
│   │   └── UserMenu.tsx          # Меню пользователя
│   │
│   ├── ui/                       # UI компоненты
│   │   ├── Button.tsx            # Кнопка
│   │   ├── Input.tsx             # Поле ввода
│   │   ├── Select.tsx            # Выпадающий список
│   │   ├── Textarea.tsx          # Текстовое поле
│   │   ├── Modal.tsx             # Модальное окно
│   │   ├── label.tsx             # Label
│   │   ├── card.tsx              # Карточка
│   │   ├── alert.tsx             # Алерт
│   │   └── dropdown-menu.tsx     # Выпадающее меню
│   │
│   ├── MedicalContentForm.tsx    # Форма планирования контента
│   └── Navigation.tsx            # Навигация
│
├── lib/                          # Утилиты и сервисы
│   ├── types.ts                  # TypeScript типы
│   ├── pocketbase.ts             # Клиент PocketBase
│   ├── pocketbase-service.ts     # Сервис для работы с PocketBase
│   ├── dictionaries-service.ts   # Сервис справочников
│   ├── healthCalendar.ts         # База данных календаря здоровья
│   ├── formatDistribution.ts     # Логика автораспределения форматов
│   ├── i18n.tsx                  # Система интернационализации
│   └── config.ts                 # Конфигурация приложения
│
├── scripts/                      # Скрипты
│   ├── setup-pocketbase-collections.js  # Создание коллекций
│   ├── seed-dictionaries.js      # Заполнение справочников
│   └── create-users.sh           # Создание пользователей
│
└── public/                       # Статические файлы
```

## 🔧 Основные технологии

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: PocketBase
- **AI**: Google Gemini 3 Pro
- **Icons**: Lucide React
- **State Management**: React Context API

## 🎨 Архитектурные принципы

### 1. Компонентная архитектура

Компоненты организованы по функциональности:
- `ui/` - переиспользуемые UI компоненты
- `auth/` - компоненты авторизации
- Корневые компоненты - специфичные для бизнес-логики

### 2. Типизация

Все компоненты и функции строго типизированы:

```typescript
// lib/types.ts
export type MedicalSpecialization = 
  "Mamografia/Mastologia" | "Odontologia" | ...;

export interface MedicalContentFormData {
  specialization: MedicalSpecialization;
  month: MonthOption;
  goals: ContentGoal[];
  formatCounts: FormatCounts;
  additionalContext: string;
  useHealthCalendar: boolean;
}
```

### 3. Сервисный слой

Вся работа с PocketBase инкапсулирована в сервисы:

```typescript
// lib/pocketbase-service.ts
export async function createGeneration(data: GenerationData) {
  const pb = getPocketBase();
  return await pb.collection('generations').create(data);
}
```

### 4. Интернационализация

Все тексты вынесены в систему i18n:

```typescript
// lib/i18n.tsx
const translations = {
  ru: {
    "medical.form.title": "Планирование медицинского контента",
    ...
  },
  pt: { ... },
  en: { ... }
};

// Использование
const { t } = useI18n();
<h1>{t("medical.form.title")}</h1>
```

## 🔐 Авторизация

### Архитектура

```
AuthProvider (Context)
    ↓
ProtectedRoute (HOC)
    ↓
Page Components
```

### Использование

```typescript
// Защита страницы
export default function Page() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}

// Доступ к пользователю
const { user, logout } = useAuth();
```

## 📊 Работа с данными

### PocketBase клиент

```typescript
import { getPocketBase } from '@/lib/pocketbase';

const pb = getPocketBase();

// Создание
const record = await pb.collection('generations').create(data);

// Чтение
const records = await pb.collection('generations').getList(1, 20);

// Обновление
await pb.collection('generations').update(id, data);

// Удаление
await pb.collection('generations').delete(id);
```

### Справочники

```typescript
import { 
  getMedicalSpecializations,
  getContentGoals,
  loadAllDictionaries 
} from '@/lib/dictionaries-service';

// Загрузка всех справочников
const { specializations, goals, formats, months } = 
  await loadAllDictionaries();

// Или по отдельности
const specializations = await getMedicalSpecializations();
```

## 🎨 Стилизация

### Tailwind CSS

Используем utility-first подход:

```tsx
<div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
</div>
```

### Компоненты UI

Все UI компоненты поддерживают кастомизацию через `className`:

```tsx
<Button 
  variant="primary" 
  size="lg"
  className="custom-class"
>
  Click me
</Button>
```

## 🧪 Разработка

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

### Линтинг

```bash
npm run lint
```

### Сборка

```bash
npm run build
npm start
```

## 📝 Добавление новых функций

### 1. Новый компонент

```typescript
// components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onAction 
}) => {
  return (
    <div className="p-4">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### 2. Новый справочник

1. Создайте коллекцию в PocketBase
2. Добавьте тип в `lib/types.ts`
3. Добавьте функцию в `lib/dictionaries-service.ts`
4. Обновите скрипт `scripts/seed-dictionaries.js`

### 3. Новая страница

```typescript
// app/my-page/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>My Page</h1>
      </div>
    </ProtectedRoute>
  );
}
```

## 🔍 Отладка

### PocketBase Admin UI

Доступ к данным: https://pocketbase.processlabs.ru/_/

### React DevTools

Установите расширение для браузера для отладки компонентов и состояния.

### Логирование

```typescript
// Разработка
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

## 📦 Зависимости

### Основные

```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "pocketbase": "^0.20.0"
}
```

### Добавление новой зависимости

```bash
npm install package-name
npm install -D @types/package-name  # Если нужны типы
```

## 🚀 Деплой

### Переменные окружения

Убедитесь, что все переменные настроены:

```env
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-url
NEXT_PUBLIC_GEMINI_API_KEY=your-api-key
```

### Сборка для production

```bash
npm run build
```

### Проверка сборки

```bash
npm start
```

## 📚 Полезные ссылки

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PocketBase Documentation](https://pocketbase.io/docs/)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Вклад в проект

1. Создайте ветку для новой функции
2. Следуйте существующему стилю кода
3. Добавьте типы для всех новых функций
4. Обновите документацию при необходимости
5. Протестируйте изменения локально

## 💡 Советы

- Всегда используйте TypeScript типы
- Следуйте принципу DRY (Don't Repeat Yourself)
- Выносите повторяющуюся логику в утилиты
- Используйте React Context для глобального состояния
- Оптимизируйте производительность с помощью React.memo и useMemo
- Пишите читаемый и поддерживаемый код

---

**Удачной разработки! 🚀**
