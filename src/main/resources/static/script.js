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
            }
        })
        .catch(error => console.error('Error fetching stats:', error));
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
                    <img src="images/${image}" class="event-image">
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
            updateExplorationEvent(data);

            if (data.inCombat) {
                // Вызываем enterCombat и передаем данные о враге
                enterCombat({
                    name: data.enemyName,
                    hp: data.enemyHp,
                    maxHp: data.enemyMaxHp,
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
            logExplorationEvent(data.message); // <- Используем data.message
            updateCombatHealth(); // Обновляем здоровье
            updateBattleLog();
            checkCombatStatus(); // Проверка окончания боя
        })
}

function tryFlee() {
    fetch(`/api/battle/flee?userId=${userId}`, { method: 'POST' })
        .then(response => response.json()) // <- Парсим JSON
        .then(data => {
            logExplorationEvent(data.message); // <- Используем data.message
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

function openPotionsModal() {
    fetch(`/api/player/inventory?userId=${userId}`)
        .then(response => response.json())
        .then(inventory => {
            const potions = inventory.filter(item => item.type === 'potion');
            if (potions.length === 0) {
                logExplorationEvent("У вас нет зелий!");
                return;
            }

            const grid = document.getElementById('potions-grid');
            grid.innerHTML = potions.map(potion => `
                <div class="potion" onclick="usePotion('${potion.id}')">
                    <img src="${potion.image}" alt="${potion.name}">
                    <span class="count">${potion.count}</span>
                </div>
            `).join('');

            document.getElementById('potions-modal').style.display = 'block';
        });
}

// Использование зелья
function usePotion(potionType) {
    fetch(`/api/battle/use-potion?userId=${userId}&type=${potionType}`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addToBattleLog(`Использовано зелье: +${data.heal} HP`);
                updateCombatHealth();
                enemyTurn(); // Ход врага после использования
            } else {
                addToBattleLog(data.error);
            }
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

updateStats();
document.getElementById('actions').innerHTML = `<button onclick="exploreForest()">Начать путешествие в Тёмном лесу</button>`;