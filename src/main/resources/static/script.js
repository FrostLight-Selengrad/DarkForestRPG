const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

function updateStats() {
    fetch('/api/player')
        .then(response => response.json())
        .then(player => {
            document.getElementById('player-stats').innerHTML = `
                <p>HP: ${player.hp}/${player.maxHp} | Уровень леса: ${player.forestLevel}</p>
                <p>Физ. атака: ${player.physicalAttack}</p>
            `;
        });
}

function logEvent(message) {
    const logDiv = document.getElementById('event-log');
    logDiv.innerHTML += `<p>${message}</p>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

function exploreForest() {
    fetch('/api/explore', { method: 'POST' })
        .then(response => response.text())
        .then(message => {
            logEvent(message);
            updateStats();
            document.getElementById('actions').innerHTML = `
                <button onclick="attack('physical')">Атака</button>
                <button onclick="exploreForest()">Продолжить</button>
            `;
        });
}

function attack(type) {
    fetch(`/api/attack?type=${type}`, { method: 'POST' })
        .then(response => response.text())
        .then(message => {
            logEvent(message);
            updateStats();
            if (message.includes("победили") || message.includes("проиграли")) {
                document.getElementById('actions').innerHTML = `<button onclick="exploreForest()">Продолжить</button>`;
            }
        });
}

updateStats();
document.getElementById('actions').innerHTML = `<button onclick="exploreForest()">Выйти в лес</button>`;