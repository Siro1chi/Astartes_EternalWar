# WH40K: ETERNAL WAR

Roguelite-выживалка по мотивам Warhammer 40,000 на чистом JavaScript (Canvas API, ES-модули).

## Запуск

Локальный сервер (ES-модули не работают через file://):

```bash
npx serve .        # или python3 -m http.server
```

Откройте http://localhost:3000

## Структура

```
js/
  main.js              — точка входа
  core/                — GameManager, ввод, утилиты, пулы объектов
  entities/            — Player, Enemy, Projectile, Mine, Particle
  weapons/             — система оружия и данные
  skills/              — пассивные навыки, данные врагов/боссов, CONFIG
```

## Настройки

Магические числа вынесены в `CONFIG` (`js/skills/skillsData.js`): лимиты сущностей, скорость спавна, интервал боссов.

## Линт

```bash
npm run lint
```
