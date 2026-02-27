// ==UserScript==
// @name         VKPlay PIN Code Exporter
// @namespace    https://github.com/s-shiryaev/vkplay-pin-exporter
// @version      1.1.0
// @description  Выгрузка неактивированных ПИН-кодов с VKPlay Market по названию предмета
// @author       s-shiryaev
// @match        https://market.vkplay.ru/inventory_code/*/
// @match        https://market.vkplay.ru/inventory/*/
// @match        https://market.vkplay.ru/game/*/
// @match        https://market.vkplay.ru/shop/*/
// @license      MIT
// @homepageURL  https://github.com/s-shiryaev/vkplay-pin-exporter
// @supportURL   https://github.com/s-shiryaev/vkplay-pin-exporter/issues
// @updateURL    https://raw.githubusercontent.com/s-shiryaev/vkplay-pin-exporter/main/vkplay-pin-exporter.user.js
// @downloadURL  https://raw.githubusercontent.com/s-shiryaev/vkplay-pin-exporter/main/vkplay-pin-exporter.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      market.vkplay.ru
// ==/UserScript==

(function () {
    'use strict';

    function getShowcaseId() {
        const match = location.pathname.match(/\/[^/]+\/(\d+)\//);
        return match ? match[1] : null;
    }

    const SHOWCASE_ID = getShowcaseId();
    const API_BASE = `https://market.vkplay.ru/api/showcases/${SHOWCASE_ID}/pin_codes/`;

    // ── Локализация ──────────────────────────────────────────────────────────

    const LANG = navigator.language.startsWith('ru') ? 'ru' : 'en';

    const i18n = {
        ru: {
            title:          '📦 PIN Exporter',
            placeholder:    'Название лота...',
            btnFind:        'Найти',
            btnCopy:        '📋 Копировать',
            btnCopied:      '✅ Скопировано!',
            notFound:       'Неактивированных кодов не найдено',
            found:          (n) => `Найдено: ${n} шт.`,
            loading:        (p) => `⏳ Загрузка страницы ${p}...`,
            done:           '✅ Готово!',
            emptyInput:     '⚠️ Введите название лота',
            error:          (e) => `❌ Ошибка: ${e}`,
            outputHint:     'Коды появятся здесь...',
            timeFilter:     'Время создания:',
            timeAny:        'Любое время',
            time10m:        'Последние 10 мин',
            time1h:         'Последний час',
            time1d:         'Последний день',
            time1w:         'Последняя неделя',
            time1mo:        'Последний месяц',
            timeCustom:     'Свой период',
            customMinutes:  'Минут:',
            invalidCustom:  '⚠️ Введите кол-во минут',
        },
        en: {
            title:          '📦 PIN Exporter',
            placeholder:    'Lot name...',
            btnFind:        'Search',
            btnCopy:        '📋 Copy',
            btnCopied:      '✅ Copied!',
            notFound:       'No inactive PIN codes found',
            found:          (n) => `Found: ${n} pcs.`,
            loading:        (p) => `⏳ Loading page ${p}...`,
            done:           '✅ Done!',
            emptyInput:     '⚠️ Enter lot name',
            error:          (e) => `❌ Error: ${e}`,
            outputHint:     'Time of creation:',
            timeAny:        'Any time',
            time10m:        'Last 10 min',
            time1h:         'Last hour',
            time1d:         'Last day',
            time1w:         'Last week',
            time1mo:        'Last month',
            timeCustom:     'Custom',
            customMinutes:  'Minutes:',
            invalidCustom:  '⚠️ Enter number of minutes',
        },
    };

    const t = i18n[LANG];

    // ── Опции фильтра времени (в минутах, 0 = без фильтра) ──────────────────

    const TIME_OPTIONS = [
        { label: t.timeAny,  value: 0 },
        { label: t.time10m,  value: 10 },
        { label: t.time1h,   value: 60 },
        { label: t.time1d,   value: 60 * 24 },
        { label: t.time1w,   value: 60 * 24 * 7 },
        { label: t.time1mo,  value: 60 * 24 * 30 },
        { label: t.timeCustom, value: 'custom' },
    ];

    // ── UI ──────────────────────────────────────────────────────────────────

    const panel = document.createElement('div');
    panel.id = 'vkplay-pin-exporter';
    panel.innerHTML = `
        <div id="vpe-header">${t.title} <span id="vpe-toggle">▲</span></div>
        <div id="vpe-body">
            <div id="vpe-search-row">
                <input id="vpe-input" type="text" placeholder="${t.placeholder}" />
                <button id="vpe-btn">${t.btnFind}</button>
            </div>
            <div id="vpe-time-row">
                <label for="vpe-time-select">${t.timeFilter}</label>
                <select id="vpe-time-select">
                    ${TIME_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
                </select>
                <input id="vpe-custom-minutes" type="number" min="1" placeholder="${t.customMinutes}" style="display:none" />
            </div>
            <div id="vpe-status"></div>
            <textarea id="vpe-output" placeholder="${t.outputHint}" readonly></textarea>
            <div id="vpe-actions">
                <button id="vpe-copy" disabled>${t.btnCopy}</button>
                <span id="vpe-count"></span>
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // ── Стили ───────────────────────────────────────────────────────────────

    const style = document.createElement('style');
    style.textContent = `
        #vkplay-pin-exporter {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 99999;
            width: 360px;
            background: #1e1e2e;
            border: 1px solid #44475a;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            font-family: monospace;
            font-size: 13px;
            color: #cdd6f4;
        }
        #vpe-header {
            background: #313244;
            padding: 8px 12px;
            border-radius: 10px 10px 0 0;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            user-select: none;
        }
        #vpe-body {
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        #vpe-search-row {
            display: flex;
            gap: 6px;
        }
        #vpe-input {
            flex: 1;
            padding: 6px 8px;
            border-radius: 6px;
            border: 1px solid #585b70;
            background: #313244;
            color: #cdd6f4;
            outline: none;
        }
        #vpe-input:focus {
            border-color: #89b4fa;
        }
        #vpe-time-row {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }
        #vpe-time-row label {
            font-size: 12px;
            color: #a6adc8;
            white-space: nowrap;
        }
        #vpe-time-select {
            flex: 1;
            padding: 5px 6px;
            border-radius: 6px;
            border: 1px solid #585b70;
            background: #313244;
            color: #cdd6f4;
            outline: none;
            font-family: monospace;
            font-size: 12px;
            cursor: pointer;
        }
        #vpe-time-select:focus {
            border-color: #89b4fa;
        }
        #vpe-custom-minutes {
            width: 70px;
            padding: 5px 6px;
            border-radius: 6px;
            border: 1px solid #585b70;
            background: #313244;
            color: #cdd6f4;
            outline: none;
            font-family: monospace;
            font-size: 12px;
        }
        #vpe-custom-minutes:focus {
            border-color: #89b4fa;
        }
        #vpe-btn {
            padding: 6px 12px;
            border-radius: 6px;
            border: none;
            background: #89b4fa;
            color: #1e1e2e;
            cursor: pointer;
            font-weight: bold;
        }
        #vpe-btn:hover { background: #b4d0fb; }
        #vpe-btn:disabled { background: #585b70; cursor: not-allowed; }
        #vpe-status {
            font-size: 12px;
            min-height: 16px;
            color: #a6e3a1;
        }
        #vpe-status.error { color: #f38ba8; }
        #vpe-output {
            width: 100%;
            height: 140px;
            background: #181825;
            border: 1px solid #45475a;
            border-radius: 6px;
            color: #a6e3a1;
            padding: 8px;
            resize: vertical;
            box-sizing: border-box;
            font-family: monospace;
            font-size: 12px;
        }
        #vpe-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        #vpe-copy {
            padding: 5px 12px;
            border-radius: 6px;
            border: none;
            background: #a6e3a1;
            color: #1e1e2e;
            cursor: pointer;
            font-weight: bold;
        }
        #vpe-copy:hover { background: #c3f0be; }
        #vpe-copy:disabled { background: #45475a; cursor: not-allowed; color: #7f849c; }
        #vpe-count { font-size: 12px; color: #fab387; }
    `;
    document.head.appendChild(style);

    // ── Элементы ─────────────────────────────────────────────────────────────

    const input         = document.getElementById('vpe-input');
    const btn           = document.getElementById('vpe-btn');
    const status        = document.getElementById('vpe-status');
    const output        = document.getElementById('vpe-output');
    const copyBtn       = document.getElementById('vpe-copy');
    const countEl       = document.getElementById('vpe-count');
    const header        = document.getElementById('vpe-header');
    const body          = document.getElementById('vpe-body');
    const toggle        = document.getElementById('vpe-toggle');
    const timeSelect    = document.getElementById('vpe-time-select');
    const customMinutes = document.getElementById('vpe-custom-minutes');

    // ── Показ/скрытие поля кастомных минут ──────────────────────────────────

    timeSelect.addEventListener('change', () => {
        customMinutes.style.display = timeSelect.value === 'custom' ? 'block' : 'none';
    });

    // ── Сворачивание панели ──────────────────────────────────────────────────

    header.addEventListener('click', () => {
        const collapsed = body.style.display === 'none';
        body.style.display = collapsed ? 'flex' : 'none';
        toggle.textContent = collapsed ? '▲' : '▼';
    });

    // ── Фильтр по времени ────────────────────────────────────────────────────

    function getTimeFilter() {
        const val = timeSelect.value;
        if (val === '0') return null;
        let minutes;
        if (val === 'custom') {
            minutes = parseInt(customMinutes.value, 10);
            if (!minutes || minutes <= 0) return 'invalid';
        } else {
            minutes = parseInt(val, 10);
        }
        return new Date(Date.now() - minutes * 60 * 1000);
    }

    function isWithinPeriod(item, since) {
        if (!since) return true;
        const openedAt = item.code?.openedAt;
        if (!openedAt) return false;
        return new Date(openedAt) >= since;
    }

    // ── Логика запросов ──────────────────────────────────────────────────────

    function fetchPage(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                onload(response) {
                    if (response.status >= 200 && response.status < 300) {
                        try {
                            resolve(JSON.parse(response.responseText));
                        } catch {
                            reject(new Error('JSON parse error'));
                        }
                    } else {
                        reject(new Error(`HTTP ${response.status}`));
                    }
                },
                onerror() {
                    reject(new Error('Network error'));
                },
            });
        });
    }

    async function fetchAllCodes(search, since) {
        const codes = [];
        let url = `${API_BASE}?search=${encodeURIComponent(search)}`;
        let page = 1;
        // API отдаёт коды от новых к старым — прекращаем пагинацию,
        // когда все результаты страницы уже старше фильтра
        let exhausted = false;

        while (url && !exhausted) {
            setStatus(t.loading(page));
            const data = await fetchPage(url);

            let pageHasMatch = false;

            for (const item of data.results) {
                if (!item.showRepackButton || !item.code?.code) continue;

                if (since && !isWithinPeriod(item, since)) {
                    // Коды отсортированы по убыванию openedAt:
                    // как только встретили старый — дальше смотреть смысла нет
                    exhausted = true;
                    break;
                }

                codes.push(item.code.code);
                pageHasMatch = true;
            }

            url = (!exhausted && data.next) ? data.next : null;
            page++;
        }

        return codes;
    }

    // ── Вспомогалки ──────────────────────────────────────────────────────────

    function setStatus(msg, isError = false) {
        status.textContent = msg;
        status.className = isError ? 'error' : '';
    }

    function setLoading(loading) {
        btn.disabled = loading;
        btn.textContent = loading ? '⏳' : t.btnFind;
    }

    // ── Обработчики ──────────────────────────────────────────────────────────

    btn.addEventListener('click', async () => {
        const search = input.value.trim();
        if (!search) {
            setStatus(t.emptyInput, true);
            return;
        }

        const since = getTimeFilter();
        if (since === 'invalid') {
            setStatus(t.invalidCustom, true);
            return;
        }

        output.value = '';
        copyBtn.disabled = true;
        countEl.textContent = '';
        setLoading(true);
        setStatus('');

        try {
            const codes = await fetchAllCodes(search, since);

            if (codes.length === 0) {
                setStatus(t.notFound, true);
            } else {
                output.value = codes.join('\n');
                copyBtn.disabled = false;
                countEl.textContent = t.found(codes.length);
                setStatus(t.done);
            }
        } catch (err) {
            setStatus(t.error(err.message), true);
        } finally {
            setLoading(false);
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btn.click();
    });

    copyBtn.addEventListener('click', () => {
        GM_setClipboard(output.value);
        copyBtn.textContent = t.btnCopied;
        setTimeout(() => { copyBtn.textContent = t.btnCopy; }, 2000);
    });

})();