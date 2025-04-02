const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userId = tg.initDataUnsafe.user.id;
if (!userId) {
    logEvent("Ошибка: пользователь не авторизован");
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

    // Показать боевой интерфейс
    document.getElementById('battle-interface').style.display = 'block';

    // Обновить данные
    document.getElementById('enemy-combat-name').textContent = enemyData.name;
    document.getElementById('enemy-combat-hp').textContent = `${enemyData.hp}/${enemyData.maxHp}`;
    updateBattleLog();
}

function updateExplorationEvent() {
    fetch(`/api/game/exploration-event?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            const eventDiv = document.getElementById('exploration-event');
            eventDiv.innerHTML = `
                <div class="event-card">
                    <img src="images/${data.type}.png" class="event-image">
                    <div class="event-content">
                        <p class="event-message">${data.message}</p>
                        ${getEventControls(data.type)}
                    </div>
                </div>
            `;

            // Всегда показываем кнопку "Продолжить"
            document.getElementById('actions').innerHTML = `
        <button onclick="exploreForest()">${data.inCombat ? 'Атаковать' : 'Продолжить'}</button>
    `;
        });
}

function getEventControls(eventType) {
    switch(eventType) {
        case 'chest':
            return `<button class="event-btn" onclick="openChest()">Открыть</button>`;
        case 'trap':
            return `<button class="event-btn" onclick="escapeTrap()">Выбраться (10% шанс)</button>`;
        default:
            return `<button class="event-btn" onclick="exploreForest()">Продолжить</button>`;
    }
}

// Обновление боевого интерфейса
function updateBattleUI(data) {
    document.getElementById('battle-interface').style.display = 'block';
    document.getElementById('enemy-name').textContent = data.enemyName;
    document.getElementById('enemy-hp').textContent = `${data.enemyHp}/${data.enemyMaxHp}`;
}

function logEvent(message) {
    const logDiv = document.getElementById('event-log');
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
            document.getElementById('battle-log').innerHTML = data.log.replace(/\n/g, '<br>'); // <- Теперь data.log строка
            document.getElementById('turn').innerText = `Текущий ход: ${data.turn}`;
            // Автопрокрутка вниз
            logDiv.scrollTop = logDiv.scrollHeight;
        });
}

// Для путешествия
function updateExplorationLog() {
    fetch(`/api/game/exploration-log?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("exploration-log").innerHTML =
                data.log.join("<br>");
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
        logEvent('Ошибка соединения с сервером');
    });
}

function attack() {
    fetch(`/api/game/attack?userId=${userId}`, { method: 'POST' })
        .then(response => response.json()) // <- Парсим JSON
        .then(data => {
            logEvent(data.message); // <- Используем data.message
            updateCombatHealth(); // Обновляем здоровье
            updateBattleLog();
            checkCombatStatus(); // Проверка окончания боя
        })
        .catch(error => logEvent('Ошибка: ' + error.message)); // <- Добавлен catch
}

function tryFlee() {
    fetch(`/api/game/flee?userId=${userId}`, { method: 'POST' })
        .then(response => response.json()) // <- Парсим JSON
        .then(data => {
            logEvent(data.message); // <- Используем data.message
            updateStats();
            updateBattleLog();
            checkCombatStatus();
        })
        .catch(error => logEvent('Ошибка: ' + error.message)); // <- Добавлен catch
}

function checkCombatStatus() {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            if (!player.inCombat) {
                // Скрываем боевой интерфейс
                document.getElementById('battle-interface').style.display = 'none';

                // Показываем элементы путешествия
                document.getElementById('exploration-interface').style.display = 'block';

                // Обновляем события
                document.getElementById('actions').innerHTML = `<button onclick="exploreForest()">Продолжить</button>`;
            }
        });
}

function openPotionsModal() {
    fetch(`/api/player/inventory?userId=${userId}`)
        .then(response => response.json())
        .then(inventory => {
            const potions = inventory.filter(item => item.type === 'potion');
            if (potions.length === 0) {
                logEvent("У вас нет зелий!");
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