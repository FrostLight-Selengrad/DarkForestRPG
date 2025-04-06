function enterCombat(enemyData) {
    const exploration = document.getElementById('exploration-interface');
    const battle = document.getElementById('battle-interface');

    exploration.classList.add('hide-to-left');
    setTimeout(() => {
        exploration.style.display = 'none';
        battle.style.display = 'block';
        battle.classList.add('show-from-right');
    }, 500);

    let enemyImage = "goblin.png";
    if (enemyData.name.includes("Мимик")) enemyImage = "mimic.png";
    if (enemyData.name.includes("Босс")) enemyImage = "boss.png";
    document.getElementById('enemy-image').src = `images/${enemyImage}`;

    document.getElementById('battle-interface').style.display = 'block';
    document.getElementById('enemy-combat-name').textContent = enemyData.name;
    document.getElementById('enemy-level').textContent = "Уровень " + enemyData.level;
    document.getElementById('enemy-combat-hp').textContent = `${enemyData.hp}/${enemyData.maxHp}`;
    updateBattleLog();
}

function updateBattleLog() {
    fetch(`/api/battle/log?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('battle-log').innerHTML = data.error;
                return;
            }
            const battleLog = document.getElementById('battle-log');
            battleLog.innerHTML = data.log.replace(/\n/g, '<br>');
            battleLog.scrollTop = battleLog.scrollHeight;
            document.getElementById('turn').innerText = `Текущий ход: ${data.turn}`;
        })
        .catch(handleExplorationError);
}

function attack() {
    fetch(`/api/battle/attack?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            updateCombatHealth();
            updateBattleLog();
            checkCombatStatus();
        })
        .catch(handleExplorationError);
}

function tryFlee() {
    fetch(`/api/battle/flee?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            updateCombatHealth();
            updateStats();
            updateBattleLog();
            checkCombatStatus();
        })
        .catch(handleExplorationError);
}

function checkCombatStatus() {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            if (!player.inCombat) {
                fetch(`/api/game/post-combat?userId=${userId}`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('battle-interface').style.display = 'none';
                        document.getElementById('exploration-interface').style.display = 'block';
                        updateExplorationEvent(data);
                    })
                    .catch(error => {
                        console.error('Ошибка получения данных:', error);
                        document.getElementById('battle-interface').style.display = 'none';
                        document.getElementById('exploration-interface').style.display = 'block';
                        logExplorationEvent("Бой завершен! Продолжаем путь...");
                    });
            }
        })
        .catch(handleExplorationError);
}

function updateCombatHealth() {
    const playerHpElement = document.getElementById('player-combat-hp');
    const enemyHpElement = document.getElementById('enemy-combat-hp');

    playerHpElement.classList.add('damage');
    setTimeout(() => playerHpElement.classList.remove('damage'), 300);

    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            playerHpElement.style.color = '#ff5555';
            setTimeout(() => playerHpElement.style.color = '#4CAF50', 500);
            playerHpElement.textContent = `${player.hp}/${player.maxHp}`;

            if (player.inCombat) {
                enemyHpElement.style.color = '#ff5555';
                setTimeout(() => enemyHpElement.style.color = '#4CAF50', 500);
                enemyHpElement.textContent = `${player.enemyHp}/${player.enemyMaxHp}`;
            }
        })
        .catch(handleExplorationError);
}