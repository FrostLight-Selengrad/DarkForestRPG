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

function updateHealth() {
    fetch(`/api/battle/health?userId=${userId}`) // <- Правильный URL
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('health-status').innerHTML = data.error;
                return;
            }
            document.getElementById('player-health').innerHTML =
                `Ваше здоровье: <span style="color: ${data.playerColor}">${data.playerHp}/${data.playerMaxHp}</span>`;
            if (data.enemyHp) {
                document.getElementById('enemy-health').innerHTML =
                    `${data.enemyName} здоровье: <span style="color: ${data.enemyColor}">${data.enemyHp}/${data.enemyMaxHp}</span>`;
            } else {
                document.getElementById('enemy-health').innerHTML = 'Нет противника';
            }
        });
}

function exploreForest() {
    fetch(`/api/game/explore?userId=${userId}`, { method: 'POST' })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            logEvent(data.message);
            updateStats();
            updateHealth();
            if (data.inCombat) {
                document.getElementById('actions').innerHTML = `
                    <button onclick="attack()">Атаковать</button>
                    <button onclick="tryFlee()">Попытаться убежать</button>
                `;
                updateExplorationLog();
            } else {
                document.getElementById('actions').innerHTML = `<button onclick="exploreForest()">Продолжить</button>`;
            }
        })
        .catch(error => logEvent('Ошибка: ' + error.message));
}

function attack() {
    fetch(`/api/game/attack?userId=${userId}`, { method: 'POST' })
        .then(response => response.json()) // <- Парсим JSON
        .then(data => {
            logEvent(data.message); // <- Используем data.message
            updateStats();
            updateBattleLog();
            updateHealth();
            checkCombatStatus();
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
            updateHealth();
            checkCombatStatus();
        })
        .catch(error => logEvent('Ошибка: ' + error.message)); // <- Добавлен catch
}

function checkCombatStatus() {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            if (!player.inCombat) {
                document.getElementById('actions').innerHTML = `<button onclick="exploreForest()">Продолжить</button>`;
            }
        });
}

function updateBattleInterface(player, enemy) {
    // Показываем боевой интерфейс
    document.getElementById('battle-interface').style.display = 'block';

    // Обновляем здоровье
    document.getElementById('player-hp').textContent = `${player.hp}/${player.maxHp}`;
    document.getElementById('enemy-hp').textContent = `${enemy.hp}/${enemy.maxHp}`;

    // Обновляем лог боя
    document.getElementById('battle-log').innerHTML = player.battleLog.join('<br>');
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
function usePotion(potionId) {
    fetch(`/api/use-potion?userId=${userId}&potionId=${potionId}`, {
        method: 'POST'
    }).then(response => {
        // Обновляем интерфейс
        updateHealth();
        updateBattleLog();
    });
}

function toggleMenu() {
    const menu = document.getElementById('char-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Закрытие при клике вне меню
document.addEventListener('click', (e) => {
    if (!e.target.closest('#char-menu-btn, #char-menu')) {
        document.getElementById('char-menu').style.display = 'none';
    }
});

updateStats();
document.getElementById('actions').innerHTML = `<button onclick="exploreForest()">Выйти в лес</button>`;