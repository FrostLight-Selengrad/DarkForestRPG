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
                    <p>Физ. атака: ${player.physicalAttack}</p>
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
    const logDiv = document.getElementById('camp-log');
    logDiv.innerHTML = '<p>Вы попали в лагерь, где безмятежно болтают разбойники.</p>';
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

function updateExplorationEvent(data) {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            const eventDiv = document.getElementById('exploration-log');
            let image = "forest.png";
            let buttons = '';

            if (data.type === "trap") {
                if (player.isInTrap()) {
                    image = "trap_active.png";
                    buttons = `<button onclick="escapeTrap()">Попытаться выбраться (${player.trapEscapeChance}%)</button>`;
                } else {
                    image = "trap_escaped.png";
                    buttons = `<button onclick="exploreForest()">Продолжить</button>`;
                }
            }

            eventDiv.innerHTML = `
                <div class="event-card">
                    <img src="images/${image}" class="event-image" alt="${image}">
                    <p>${data.message}</p>
                    ${buttons}
                </div>
            `;
        });
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

function exploreForest() {
    fetch(`/api/game/explore?userId=${userId}`, { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Принудительно обновляем весь интерфейс
            updateStats();
            // Анимация перехода
            const travelTime = calculateTravelTime(player.stamina);
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
            // Принудительно обновляем весь интерфейс
            updateStats();
            updateExplorationEvent(data);

            if (data.inCombat) {
                // Вызываем enterCombat и передаем данные о враге
                enterCombat({
                    name: data.enemyName,
                    hp: data.enemyHp,
                    maxHp: data.enemyMaxHp,
                    level: data.level,
                });

                // Обновляем боевой интерфейс
                updateBattleLog();
                updateCombatHealth();
            } else {
                // Показываем событие путешествия
                updateExplorationEvent(data.message);
                document.getElementById('actions').innerHTML =
                    `<button onclick="exploreForest()">Продолжить</button>`;
            }
        })
        .catch(error => {
        console.error('Error:', error);
        logExplorationEvent('Ошибка соединения с сервером');
    });
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