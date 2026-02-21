# VKPlay PIN Code Exporter

> 🇷🇺 [Русский](#русский) | 🇬🇧 [English](#english)

---

## Русский

Tampermonkey-скрипт для быстрой выгрузки неактивированных ПИН-кодов с [VKPlay Market](https://market.vkplay.ru).

### Возможности

- 🔍 Поиск кодов по названию предмета
- 🔒 Автоматическая фильтрация — только **неактивированные** коды
- 📄 Поддержка пагинации — собирает коды со всех страниц результатов
- 📋 Копирование всех кодов одной кнопкой
- 🌍 Автоматический выбор языка интерфейса (ru/en)
- 🎮 Работает для любой игры на маркете — ID игры определяется автоматически из URL

### Установка

1. Установи расширение **Tampermonkey** для своего браузера:
   [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) · [Firefox](https://addons.mozilla.org/ru/firefox/addon/tampermonkey/) · [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2. Нажми → [**Установить скрипт**](https://raw.githubusercontent.com/s-shiryaev/vkplay-pin-exporter/main/vkplay-pin-exporter.user.js)

3. В открывшейся вкладке Tampermonkey нажми **«Установить»**

### Использование

1. Перейди на страницу нужной игры на VKPlay Market, например:
   - `https://market.vkplay.ru/inventory_code/17/`
   - `https://market.vkplay.ru/inventory/17/`
   - `https://market.vkplay.ru/game/17/`
   - `https://market.vkplay.ru/shop/17/`
   - `https://market.vkplay.ru/inventory/5`

2. В правом нижнем углу появится панель **📦 PIN Exporter**

3. Введи название предмета в поле поиска и нажми **Найти** или `Enter`

4. Дождись загрузки — скрипт автоматически обойдёт все страницы результатов

5. Нажми **📋 Копировать** — все коды скопируются в буфер обмена

> **⚠️ Важно:** VKPlay Market — это SPA (одностраничное приложение), поэтому скрипт корректно запускается только при **прямом открытии** ссылки на раздел игры. Если панель не появилась после перехода по ссылке внутри сайта — нажми **F5**.

---

## English

A Tampermonkey userscript for quick export of non-activated PIN codes from [VKPlay Market](https://market.vkplay.ru).

### Features

- 🔍 Search codes by item name
- 🔒 Automatic filtering — only **non-activated** codes
- 📄 Pagination support — collects codes from all result pages
- 📋 Copy all codes with a single button
- 🌍 Automatic interface language detection (ru/en)
- 🎮 Works for any game on the market — game ID is automatically detected from the URL

### Installation

1. Install the **Tampermonkey** extension for your browser:
   [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) · [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) · [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2. Click → [**Install script**](https://raw.githubusercontent.com/s-shiryaev/vkplay-pin-exporter/main/vkplay-pin-exporter.user.js)

3. In the Tampermonkey tab that opens, click **«Install»**

### Usage

1. Navigate to the desired game page on VKPlay Market, for example:
   - `https://market.vkplay.ru/inventory_code/17/`
   - `https://market.vkplay.ru/inventory/17/` 
   - `https://market.vkplay.ru/game/17/`
   - `https://market.vkplay.ru/shop/17/`
   - `https://market.vkplay.ru/inventory/5`

2. The **📦 PIN Exporter** panel will appear in the bottom-right corner

3. Enter the item name in the search field and press **Search** or `Enter`

4. Wait for loading — the script will automatically go through all result pages

5. Click **📋 Copy** — all codes will be copied to your clipboard

> **⚠️ Note:** VKPlay Market is a SPA (single-page application), so the script only loads correctly when opening a game section link **directly**. If the panel doesn't appear after navigating within the site — press **F5**.

---

## License

[MIT](LICENSE)
