# Calipso.Coffee — УП.03 Этап 1

**Студент:** Васильев Данил Вячеславович  
**Группа:** РПО 23/1  
**Специальность:** 09.02.07 Информационные системы и программирование  
**Модуль:** ПМ.03. Сопровождение и обслуживание программного обеспечения компьютерных систем

## О проекте

Calipso.Coffee — система учёта заказов кафе. Backend: Node.js + Express + Prisma (SQLite).  
Веб-интерфейс: HTML/CSS/vanilla JS в папке `public/`.

## Стек

- Node.js 22.x, Express 4.21, Prisma 6.7, SQLite
- JWT, bcryptjs, Zod, Helmet, CORS

## Быстрый запуск

```bash
git clone https://github.com/Aizenrix/Practicable.git
cd Practicable
npm install
cp .env.example .env
npm run prisma:generate && npm run prisma:push && npm run prisma:seed
npm run dev
```

Открыть: http://localhost:4000  
Логин: `admin@calipso.coffee` / `admin123`

## Репозиторий

https://github.com/Aizenrix/Practicable.git

## Состав папки сдачи (Этап 1)

| Файл | Описание |
|------|----------|
| 01_Входной_аудит_проекта.docx | Основной отчёт |
| 02_Состав_проекта.xlsx | Таблица файлов проекта |
| 03_Инструкция_запуска.md | Пошаговый запуск |
| 04_Таблица_конфигурации.xlsx | Переменные и команды |
| 05_Журнал_проблем.xlsx | Проблемы и решения |
| screenshots/ | Скриншоты проверки |
| logs/ | Логи запуска |
| repo_link.txt | Ссылка на GitHub |
| .env.example | Пример настроек |
