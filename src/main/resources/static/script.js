const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userId = tg.initDataUnsafe.user.id;
if (!userId) {
    logExplorationEvent("Ошибка: пользователь не авторизован");
}

function updateStats() {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            if (player.error) {
                document.getElementById('player-stats').innerHTML = player.error;
            } else {
                document.getElementById('player-stats').innerHTML = `
                    <p>HP: ${player.hp}/${player.maxHp} | Уровень леса: ${player.forestLevel}</p>
                    <p>Физ. атака: ${player.physicalAttack} | Выносливость: ${player.stamina}/${player.maxStamina}</p>
                `;
                if (player.inCamp)
                    document.getElementById('player-camp-stats').innerHTML = `
                        <p>HP: ${player.hp}/${player.maxHp} | Выносливость: ${player.stamina}/${player.maxStamina}</p>
                    `;
            }
        })
        .catch(handleExplorationError);
}

// Начальная загрузка и лог лагеря
function initializeGame() {
    updateStats();
    document.getElementById('camp-log').innerHTML =
        '<p>Вы попали в лагерь, где безмятежно болтают разбойники.</p>';
}

// Выход из лагеря
function leaveCamp() {
    fetch(`/api/game/leave-camp?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateStats();
                const logDiv = document.getElementById('exploration-log');
                logDiv.innerHTML = '<p>Вы покинули лагерь и отправились в лес.</p>';

                document.getElementById('exploration-interface').style.display = 'block';
                document.getElementById('battle-interface').style.display = 'none';
                document.getElementById('camp-interface').style.display = 'none';
            } else {
                alert("Не удалось выйти из лагеря!");
            }
        })
        .catch(error => console.error('Ошибка при выходе из лагеря:', error));
}

// При начале боя
function enterCombat(enemyData) {
    const exploration = document.getElementById('exploration-interface');
    const battle = document.getElementById('battle-interface');

    exploration.classList.add('hide-to-left');
    setTimeout(() => {
        exploration.style.display = 'none';
        battle.style.display = 'block';
        battle.classList.add('show-from-right');
    }, 500);

    // Устанавливаем картинку врага
    let enemyImage = "goblin.png"; // по умолчанию
    if (enemyData.name.includes("Мимик")) enemyImage = "mimic.png";
    if (enemyData.name.includes("Босс")) enemyImage = "boss.png";
    document.getElementById('enemy-image').src = `images/${enemyImage}`;

    // Показать боевой интерфейс
    document.getElementById('battle-interface').style.display = 'block';

    // Обновить данные
    document.getElementById('enemy-combat-name').textContent = enemyData.name;
    document.getElementById('enemy-level').textContent = "Уровень " + enemyData.level;
    document.getElementById('enemy-combat-hp').textContent = `${enemyData.hp}/${enemyData.maxHp}`;
    updateBattleLog();
}

function getTrapControls(data) {
    if (data.type === "trap") {
        if (data.message.includes("упали")) {
            return `<button onclick="escapeTrap()">Попытаться выбраться</button>`;
        } else {
            return `<button onclick="exploreForest()">Продолжить</button>`;
        }
    }
    return '';
}

// Новая функция для побега из ловушки
function escapeTrap() {
    fetch(`/api/game/escape-trap?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            updateExplorationEvent(data);
        })
        .catch(handleExplorationError);
}

function logExplorationEvent(message) {
    const logDiv = document.getElementById('exploration-log');
    logDiv.innerHTML += `<p>${message}</p>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

function updateBattleLog() {
    fetch(`/api/battle/log?userId=${userId}`) // <- Правильный URL
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('battle-log').innerHTML = data.error;
                return;
            }

            const battleLog = document.getElementById('battle-log');
            battleLog.innerHTML = data.log.replace(/\n/g, '<br>');
            // Автопрокрутка вниз
            battleLog.scrollTop = battleLog.scrollHeight;

            document.getElementById('turn').innerText = `Текущий ход: ${data.turn}`;
        })
        .catch(handleExplorationError);
}

// Исследование леса
function exploreForest() {
    // Сначала скрываем кнопку с анимацией
    const actionsDiv = document.getElementById('actions');
    actionsDiv.style.opacity = '0';
    actionsDiv.style.transition = 'opacity 0.3s';

        // Исправляем метод запроса и добавляем заголовки
        fetch(`/api/game/explore?userId=${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Добавляем проверку данных
            if (!data || typeof data.stamina === 'undefined') {
                throw new Error('Некорректный ответ сервера');
            }

            // Преобразуем stamina в число
            const stamina = Number(data.stamina);
            if (isNaN(stamina)) {
                throw new Error('Ошибка данных выносливости');
            }

            if (data.stamina <= 1) {
                // Показываем кнопку снова при ошибке
                actionsDiv.style.opacity = '1';
                logExplorationEvent("Герой устал и нуждается в отдыхе!");
                document.getElementById('actions').innerHTML =
                    `<button onclick="returnToCamp()">Вернуться в лагерь</button>`;
                return;
            }

            // Создаем контейнер для анимации
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            progressContainer.innerHTML = `
                <p>Исследование леса...</p>
                <div class="progress-bar" id="travel-progress">
                    <div class="progress-fill"></div>
                </div>
            `;

            // Добавляем прогресс-бар с анимацией
            actionsDiv.replaceWith(progressContainer);
            const progressFill = document.querySelector('.progress-fill');

            const travelTime = calculateTravelTime(data.stamina);
            let startTime = Date.now();

            // Проверка времени анимации
            if (travelTime <= 0) {
                console.error('Некорректное время путешествия:', travelTime);
                return;
            }

            const animationFrame = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / travelTime, 1);

                progressFill.style.width = `${progress * 100}%`;

                if (progress < 1) {
                    requestAnimationFrame(animationFrame);
                } else {
                    fetchExplore();
                }
            };

            requestAnimationFrame(animationFrame);
        })
        .catch(handleExplorationError);
}

function fetchExplore() {
    // Показываем индикатор загрузки
    const progressContainer = document.querySelector('.progress-container');
    progressContainer.classList.add('loading-pulse');

    fetch(`/api/game/explore?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            // Плавное исчезновение прогресс-бара
            progressContainer.style.opacity = '0';
            progressContainer.style.transition = 'opacity 0.5s';

            setTimeout(() => {
                updateStats();
                updateExplorationEvent(data);
                if (data.inCombat) enterCombat(data);

                // Восстанавливаем кнопки действий
                const actionsDiv = document.getElementById('actions');
                actionsDiv.style.opacity = '1';
                actionsDiv.style.transition = 'opacity 0.3s';
            }, 500);
        })
        .catch(handleExplorationError);
}

    function handleExplorationError(error) {
        console.error('Ошибка:', error);
        const actionsDiv = document.getElementById('actions');
        actionsDiv.style.opacity = '1';

        if (error instanceof SyntaxError) {
            logExplorationEvent("Ошибка формата данных сервера!");
        } else if (error.message.includes("Некорректный")) {
            logExplorationEvent(error.message);
        } else {
            logExplorationEvent("Сервер не отвечает!");
        }

        actionsDiv.innerHTML = `
        <button onclick="exploreForest()" class="action-btn">Повторить</button>
        <button onclick="returnToCamp()" class="action-btn">В лагерь</button>
    `;
    }

function calculateTravelTime(stamina) {
    return 5000 + Math.floor((100 - stamina) / 8) * 1000;
}

// Обновление событий
function updateExplorationEvent(data) {
    // Добавляем обязательные значения по умолчанию
    const defaultData = {
        message: "forest:forest.png:Вы продолжаете свой путь через лес",
        chance: 0,
        inCombat: false
    };
    data = {...defaultData, ...data};

    // Безопасное разделение сообщения
    const parts = data.message.split(/:(.+)/);
    const type = parts[0] || "forest";
    const image = (parts[1] || "forest.png").trim();
    const message = parts[2] || "Вы продолжаете путь";

    // Обработка изображений
    const safeImage = image.endsWith('.png') ? image : `${image}.png`;
    const imgFallback = "onerror='this.src=\"images/forest.png\";this.onerror=null'";

    // Обновление DOM
    document.getElementById('exploration-log').innerHTML = `
        <div class="event-card">
            <img src="images/${safeImage}" ${imgFallback} class="event-image">
            <p>${message}</p>
        </div>
    `;

    document.getElementById('forest-image').src = `images/${safeImage}`;
    document.getElementById('exploration-interface').style.display = 'block';

    // Обновление действий
    updateActions(type, message, data);
}

function updateActions(type, message, data) {
    const actionMap = {
        chest: () => `
            <button onclick="openChest()" class="action-btn">Открыть сундук</button>
            <button onclick="exploreForest()" class="action-btn">Пройти мимо</button>
        `,
        trap: () => message.includes("попали") ? `
            <button onclick="escapeTrap()" class="action-btn danger">
                Попытаться выбраться (${data.chance}%)
            </button>
        ` : null,
        monster: () => `
            <button onclick="fightMonster()" class="action-btn">Вступить в бой</button>
            <button onclick="tryFleeBeforeCombat()" class="action-btn">Убежать</button>
        `,
        abandoned_camp: () => `
            <button onclick="restAtCamp()" class="action-btn">Разжечь костер</button>
            <button onclick="exploreForest()" class="action-btn">Пройти мимо</button>
        `
    };

    const defaultAction = `
        <button onclick="exploreForest()" class="action-btn">Продолжить путь</button>
    `;

    document.getElementById('actions').innerHTML =
        actionMap[type]?.() || defaultAction;
}

// Вспомогательная функция для генерации действий
function getActionsByType(type, message, data, player) {
    const baseAction = `<button onclick="exploreForest()" class="action-btn">Продолжить</button>`;

    const actionTemplates = {
        chest: `
            <button onclick="openChest()" class="action-btn">Открыть сундук</button>
            ${baseAction}
        `,
        trap: message.includes("попали") ? `
            <button onclick="escapeTrap()" class="action-btn danger">
                Попытаться выбраться (${data.chance || player.trapEscapeChance}%)
            </button>
        ` : baseAction,
        monster: `
            <button onclick="fightMonster()" class="action-btn combat">Вступить в бой</button>
            <button onclick="tryFleeBeforeCombat()" class="action-btn">Убежать</button>
        `,
        abandoned_camp: `
            <button onclick="restAtCamp()" class="action-btn">Разжечь костер</button>
            ${baseAction}
        `
    };

    return actionTemplates[type] || baseAction;
}

function fightMonster() {
    fetch(`/api/game/fight-monster?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.inCombat) enterCombat(data);
        })
        .catch(handleExplorationError);
}

function tryFleeBeforeCombat() {
    fetch(`/api/game/flee-before-combat?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            updateExplorationEvent(data);
        })
        .catch(handleExplorationError);
}

function restAtCamp() {
    fetch(`/api/game/rest-at-camp?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let time = 0;
                const interval = setInterval(() => {
                    time += 1;
                    updateStats();
                    if (time >= 20) clearInterval(interval);
                }, 1000);
            }
        })
        .catch(handleExplorationError);
}

function openChest() {
    fetch(`/api/game/open-chest?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            updateStats();
            updateExplorationEvent(data);
            if (data.inCombat) enterCombat(data);
        })
        .catch(handleExplorationError);
}

function tryFlee() {
    fetch(`/api/battle/flee?userId=${userId}`, { method: 'POST' })
        .then(response => response.json()) // <- Парсим JSON
        .then(data => {
            updateCombatHealth(); // Обновляем здоровье
            updateStats();
            updateBattleLog();
            checkCombatStatus();
        })
        .catch(handleExplorationError);
}

function attack() {
    fetch(`/api/battle/attack?userId=${userId}`, { method: 'POST' })
        .then(response => response.json()) // <- Парсим JSON
        .then(data => {
            updateCombatHealth(); // Обновляем здоровье
            updateBattleLog();
            checkCombatStatus(); // Проверка окончания боя
        })
        .catch(handleExplorationError);
}

function checkCombatStatus() {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            if (!player.inCombat) {
                // Получаем актуальные данные о событии
                fetch(`/api/game/post-combat?userId=${userId}`)
                    .then(response => response.json())
                    .then(data => {
                        // Обновляем интерфейс исследования
                        document.getElementById('battle-interface').style.display = 'none';
                        document.getElementById('exploration-interface').style.display = 'block';
                        updateExplorationEvent(data);
                    })
                    .catch(error => {
                        console.error('Ошибка получения данных:', error);
                        // Fallback на базовый интерфейс
                        document.getElementById('battle-interface').style.display = 'none';
                        document.getElementById('exploration-interface').style.display = 'block';
                        logExplorationEvent("Бой завершен! Продолжаем путь...");
                    });
            }
        })
        .catch(handleExplorationError);
}

// Эликсиры
function openPotionsModal() {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            const potions = Object.entries(player.inventory).filter(([key]) => key.includes("elixir"));
            if (potions.length === 0) {
                document.getElementById('battle-log').innerHTML += '<p class="log-entry">У вас нет эликсиров!</p>';
                return;
            }
            document.getElementById('potions-grid').innerHTML = potions.map(([type, count]) => `
                <div class="potion" onclick="usePotion('${type}')">
                    <img src="images/${type}.png" alt="${type}">
                    <span class="count">${count}</span>
                </div>
            `).join('');
            document.getElementById('potions-modal').style.display = 'block';
        })
        .catch(handleExplorationError);
}

function closePotionsModal() {
    document.getElementById('potions-modal').style.display = 'none';
}

function usePotion(potionType) {
    fetch(`/api/battle/use-potion?userId=${userId}&type=${potionType}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('battle-log').innerHTML += `<p class="log-entry">Вы применили эликсир: +${data.heal} HP</p>`;
                updateCombatHealth();
            }
            closePotionsModal();
        })
        .catch(handleExplorationError);
}

function updateCombatHealth() {
    const playerHpElement = document.getElementById('player-combat-hp');
    const enemyHpElement = document.getElementById('enemy-combat-hp');

    // Анимация при изменении
    playerHpElement.classList.add('damage');
    setTimeout(() => playerHpElement.classList.remove('damage'), 300);

    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            playerHpElement.style.color = '#ff5555';
            setTimeout(() => playerHpElement.style.color = '#4CAF50', 500);
            playerHpElement.textContent =
                `${player.hp}/${player.maxHp}`;

            if (player.inCombat) {
                enemyHpElement.style.color = '#ff5555';
                setTimeout(() => enemyHpElement.style.color = '#4CAF50', 500);
                enemyHpElement.textContent =
                    `${player.enemyHp}/${player.enemyMaxHp}`;
            }
        })
        .catch(handleExplorationError);
}

function toggleMenu() {
    const menu = document.getElementById('character-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function preloadImages() {
    const images = ['forest.png', 'goblin.png', 'mimic.png'];
    images.forEach(img => {
        new Image().src = `images/${img}`;
    });
}

// Закрытие при клике вне меню
document.addEventListener('click', (e) => {
    if (!e.target.closest('#char-menu-btn, #char-menu')) {
        document.getElementById('char-menu').style.display = 'none';
    }
});

// Инициализация
initializeGame();
preloadImages();