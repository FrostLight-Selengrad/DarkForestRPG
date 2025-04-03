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

                document.getElementById('player-camp-stats').innerHTML = `
                    <p>HP: ${player.hp}/${player.maxHp} | Выносливость: ${player.stamina}/${player.maxStamina}</p>
                `;
            }
        })
        .catch(error => console.error('Error fetching stats:', error));
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
    // Скрыть элементы путешествия
    document.getElementById('exploration-interface').style.display = 'none';

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
        });
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
        });
}

// Исследование леса
function exploreForest() {
    fetch(`/api/game/explore?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.stamina <= 0) {
                logExplorationEvent("Герой устал и нуждается в отдыхе!");
                document.getElementById('actions').innerHTML = `<button onclick="returnToCamp()">Вернуться в лагерь</button>`;
                return;
            }
            const travelTime = calculateTravelTime(data.stamina);
            document.getElementById('actions').innerHTML = '<div class="progress-bar" id="travel-progress"></div>';
            let progress = 0;
            const interval = setInterval(() => {
                progress += 100 / (travelTime / 100);
                document.getElementById('travel-progress').style.width = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(interval);
                    fetchExplore();
                }
            }, 100);
        });
}

function fetchExplore() {
    fetch(`/api/game/explore?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            updateStats();
            updateExplorationEvent(data);
            if (data.inCombat) enterCombat(data);
        });
}

function calculateTravelTime(stamina) {
    return 5000 + Math.floor((100 - stamina) / 8) * 1000;
}

// Обновление событий
function updateExplorationEvent(data) {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            const eventDiv = document.getElementById('exploration-log');
            const [type, image, message] = data.message.split(":", 3);
            eventDiv.innerHTML = `<div class="event-card"><img src="images/${image}" class="event-image"><p>${message}</p></div>`;
            document.getElementById('forest-image').src = `images/${image}`;
            document.getElementById('actions').innerHTML =
                `<button onclick="exploreForest()" class="action-btn">Продолжить</button>`;
            if (type === "chest") {
                document.getElementById('actions').innerHTML = `
                    <button onclick="openChest()" class="action-btn">Открыть сундук</button>
                    <button onclick="exploreForest()" class="action-btn">Пройти мимо</button>
                `;
            } else if (type === "trap" && message.includes("попали")) {
                document.getElementById('actions').innerHTML = `
                    <button onclick="escapeTrap()" class="action-btn">Попытаться выбраться (${data.chance || player.trapEscapeChance}%)</button>
                `;
            } else if (type === "monster") {
                document.getElementById('actions').innerHTML = `
                    <button onclick="fightMonster()" class="action-btn">Вступить в бой</button>
                    <button onclick="tryFleeBeforeCombat()" class="action-btn">Попытаться убежать</button>
                `;
            } else if (type === "abandoned_camp") {
                document.getElementById('actions').innerHTML = `
                    <button onclick="restAtCamp()" class="action-btn">Разжечь костер</button>
                    <button onclick="exploreForest()" class="action-btn">Пройти мимо</button>
                `;
            } else {
                document.getElementById('actions').innerHTML = `
                <button onClick="exploreForest()" class="action-btn">Пройти мимо ничего</button>
            `}
        });
}

function fightMonster() {
    fetch(`/api/game/fight-monster?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.inCombat) enterCombat(data);
        });
}

function tryFleeBeforeCombat() {
    fetch(`/api/game/flee-before-combat?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            updateExplorationEvent(data);
        });
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
        });
}

function openChest() {
    fetch(`/api/game/open-chest?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            updateStats();
            updateExplorationEvent(data);
            if (data.inCombat) enterCombat(data);
        });
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
}

function attack() {
    fetch(`/api/battle/attack?userId=${userId}`, { method: 'POST' })
        .then(response => response.json()) // <- Парсим JSON
        .then(data => {
            updateCombatHealth(); // Обновляем здоровье
            updateBattleLog();
            checkCombatStatus(); // Проверка окончания боя
        })
}

function checkCombatStatus() {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            if (!player.inCombat) {
                // Показываем сообщение в логе путешествия
                logExplorationEvent("Бой завершен!");

                // Скрываем боевой интерфейс
                document.getElementById('battle-interface').style.display = 'none';

                // Показываем интерфейс путешествия
                document.getElementById('exploration-interface').style.display = 'block';

                // Обновляем события
                updateExplorationEvent();
            }
        });
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
        });
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
        });
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
        });
}

function toggleMenu() {
    const menu = document.getElementById('character-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Закрытие при клике вне меню
document.addEventListener('click', (e) => {
    if (!e.target.closest('#char-menu-btn, #char-menu')) {
        document.getElementById('char-menu').style.display = 'none';
    }
});

// Инициализация
initializeGame();