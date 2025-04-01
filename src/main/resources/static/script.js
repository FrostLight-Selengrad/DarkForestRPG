const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userId = tg.initDataUnsafe.user.id;

function updateStats() {
    fetch(`/api/player?userId=${userId}`)
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

function logEvent(message) {
    const logDiv = document.getElementById('event-log');
    logDiv.innerHTML += `<p>${message}</p>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

function updateBattleLog() {
    fetch(`/api/battle/log?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('battle-log').innerHTML = data.error;
                return;
            }
            document.getElementById('battle-log').innerHTML = data.log.replace(/\n/g, '<br>');
            document.getElementById('turn').innerText = `Текущий ход: ${data.turn}`;
        });
}

function updateHealth() {
    fetch(`/api/health?userId=${userId}`)
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
    fetch(`/api/explore?userId=${userId}`, { method: 'POST' })
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
                updateBattleLog();
            } else {
                document.getElementById('actions').innerHTML = `<button onclick="exploreForest()">Продолжить</button>`;
            }
        })
        .catch(error => logEvent('Ошибка: ' + error.message));
}

function attack() {
    fetch(`/api/attack?userId=${userId}`, { method: 'POST' })
        .then(response => response.text())
        .then(message => {
            logEvent(message);
            updateStats();
            updateBattleLog();
            updateHealth();
            checkCombatStatus();
        });
}

function tryFlee() {
    fetch(`/api/flee?userId=${userId}`, { method: 'POST' })
        .then(response => response.text())
        .then(message => {
            logEvent(message);
            updateStats();
            updateBattleLog();
            updateHealth();
            checkCombatStatus();
        });
}

function checkCombatStatus() {
    fetch(`/api/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            if (!player.inCombat) {
                document.getElementById('actions').innerHTML = `<button onclick="exploreForest()">Продолжить</button>`;
            }
        });
}

updateStats();
document.getElementById('actions').innerHTML = `<button onclick="exploreForest()">Выйти в лес</button>`;