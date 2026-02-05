# 🗄️ Инструкция по созданию коллекций PocketBase

## Быстрый старт

Для вашего проекта медицинского генератора контента созданы две основные коллекции:
1. **`generations`** - хранение генераций контент-планов
2. **`content_plan_items`** - хранение отдельных постов в контент-плане

## 📋 Метод 1: Импорт через JSON (Рекомендуется)

### Шаг 1: Запустите PocketBase

```bash
cd /Users/romangaleev/Documents/Antigravity/ContentGenerator-app
./pocketbase serve
```

Откройте Admin UI: http://localhost:8090/_/

### Шаг 2: Импортируйте коллекции

1. Войдите в Admin UI
2. Перейдите в **Settings** → **Import collections**
3. Загрузите файл `pocketbase_collections.json`
4. Нажмите **Import**

✅ Готово! Коллекции созданы автоматически со всеми полями и правилами доступа.

---

## 📝 Метод 2: Ручное создание через Admin UI

Если предпочитаете создавать вручную, следуйте инструкциям ниже.

### Коллекция 1: `generations`

**Тип:** Base collection

#### Поля:

| Имя поля | Тип | Обязательное | Описание |
|----------|-----|--------------|----------|
| `userId` | Text | Нет | ID пользователя |
| `organizationId` | Text | Нет | ID организации |
| `specialization` | Text | **Да** | Медицинская специализация |
| `purpose` | Text | Нет | Цель публикации |
| `contentType` | Text | Нет | Тип контента |
| `numberOfPublications` | Number | **Да** | Количество публикаций (min: 1) |
| `context` | Text | Нет | Дополнительный контекст |
| `month` | Text | Нет | Месяц планирования |
| `goals` | JSON | Нет | Массив целей |
| `formatCounts` | JSON | Нет | Объект с количеством форматов |
| `useHealthCalendar` | Bool | Нет | Использовать календарь здоровья |
| `status` | Select | **Да** | Статус: `draft`, `generated`, `completed` |
| `generatedAt` | Date | Нет | Дата генерации |

#### Правила доступа (API Rules):

```javascript
// List/View Rule
@request.auth.id != ""

// Create Rule
@request.auth.id != ""

// Update Rule
@request.auth.id != "" && userId = @request.auth.id

// Delete Rule
@request.auth.id != "" && userId = @request.auth.id
```

#### Индексы (для производительности):

```sql
CREATE INDEX idx_generations_userId ON generations (userId);
CREATE INDEX idx_generations_status ON generations (status);
CREATE INDEX idx_generations_created ON generations (created);
```

---

### Коллекция 2: `content_plan_items`

**Тип:** Base collection

#### Поля:

| Имя поля | Тип | Обязательное | Описание |
|----------|-----|--------------|----------|
| `generationId` | Relation | **Да** | Связь с `generations` (cascade delete) |
| `title` | Text | **Да** | Заголовок поста |
| `format` | Text | **Да** | Формат (Reels, Carrossel, etc.) |
| `status` | Select | **Да** | Статус: `draft`, `selected`, `generated` |
| `publishDate` | Date | Нет | Дата публикации |
| `approved` | Bool | Нет | Одобрено (default: false) |
| `painPoint` | Text | Нет | Болевая точка |
| `cta` | Text | Нет | Call to action |
| `contentOutline` | Text | Нет | Структура контента |
| `metadata` | JSON | Нет | Дополнительные данные |

#### Настройка поля Relation:

- **Collection:** `generations`
- **Cascade delete:** ✅ Включено (при удалении generation удаляются все связанные items)
- **Max select:** 1

#### Правила доступа (API Rules):

```javascript
// List/View/Create/Update/Delete Rule
@request.auth.id != ""
```

#### Индексы:

```sql
CREATE INDEX idx_content_plan_items_generationId ON content_plan_items (generationId);
CREATE INDEX idx_content_plan_items_status ON content_plan_items (status);
CREATE INDEX idx_content_plan_items_publishDate ON content_plan_items (publishDate);
```

---

## 🔐 Настройка аутентификации

### Включите Email/Password аутентификацию:

1. В Admin UI перейдите в **Settings** → **Auth**
2. Включите **Email/Password**
3. (Опционально) Настройте OAuth2 провайдеры (Google, Facebook и т.д.)

### Создайте тестового пользователя:

1. Перейдите в коллекцию **users** (системная)
2. Нажмите **New record**
3. Заполните:
   - Email: `test@example.com`
   - Password: `test123456`
4. Сохраните

---

## ✅ Проверка настройки

### 1. Проверьте через API:

```bash
# Получить список коллекций
curl http://localhost:8090/api/collections

# Должны увидеть: generations, content_plan_items, users
```

### 2. Проверьте через приложение:

Убедитесь, что в `.env.local` указан правильный URL:

```env
DATABASE_PROVIDER=pocketbase
POCKETBASE_URL=http://localhost:8090
NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090
```

Запустите приложение:

```bash
npm run dev
```

---

## 📊 Структура данных

### Пример записи в `generations`:

```json
{
  "id": "abc123xyz",
  "userId": "user_001",
  "specialization": "Odontologia",
  "month": "Janeiro",
  "goals": ["Conversão", "Autoridade"],
  "formatCounts": {
    "reels": 6,
    "carrossel": 10,
    "postEstatico": 5,
    "stories": 15,
    "liveCollab": 2
  },
  "numberOfPublications": 38,
  "useHealthCalendar": true,
  "status": "generated",
  "generatedAt": "2025-01-15T10:30:00Z",
  "created": "2025-01-15T10:25:00Z",
  "updated": "2025-01-15T10:30:00Z"
}
```

### Пример записи в `content_plan_items`:

```json
{
  "id": "item_001",
  "generationId": "abc123xyz",
  "title": "5 Sinais de que você precisa de um check-up odontológico",
  "format": "Carrossel",
  "status": "draft",
  "publishDate": "2025-01-20",
  "approved": false,
  "painPoint": "Medo de descobrir problemas dentários graves",
  "cta": "Agende sua avaliação gratuita!",
  "contentOutline": "Slide 1: Introdução\nSlide 2-6: 5 sinais\nSlide 7: CTA",
  "metadata": {
    "estimatedReach": 5000,
    "targetAudience": "adultos 25-45"
  },
  "created": "2025-01-15T10:30:00Z",
  "updated": "2025-01-15T10:30:00Z"
}
```

---

## 🚀 Следующие шаги

1. ✅ Создайте коллекции (через импорт или вручную)
2. ✅ Настройте аутентификацию
3. ✅ Создайте тестового пользователя
4. 🔄 Интегрируйте с приложением через `lib/pocketbase-service.ts`
5. 🔄 Протестируйте создание генераций через форму
6. 🔄 Настройте real-time subscriptions для live обновлений

---

## 📚 Полезные ссылки

- [Документация PocketBase](https://pocketbase.io/docs/)
- [API Rules Guide](https://pocketbase.io/docs/api-rules-and-filters/)
- [JavaScript SDK](https://github.com/pocketbase/js-sdk)

---

**Готово!** Теперь у вас есть полностью настроенная база данных PocketBase для медицинского генератора контента. 🎉
