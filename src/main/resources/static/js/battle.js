// battle.js
function enterCombat(enemyData) {
    setActiveInterface('battle');
    // Остальная логика боя без изменений
}

function checkCombatStatus() {
    fetch(`/api/game/player?userId=${userId}`)
        .then(player => {
            if (!player.inCombat) {
                setActiveInterface('exploration');
            }
        });
}

function updateBattleLog() {
    const battleLog = document.getElementById('battle-log');
    const turn = document.getElementById('turn');
    if (!battleLog || !turn) {
        console.error('Отсутствуют элементы battle-log или turn:', {battleLog, turn});
        return;
    }

    fetch(`/api/battle/log?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                battleLog.innerHTML = data.error;
                return;
            }

            battleLog.innerHTML = data.log.replace(/\n/g, '<br>');
            battleLog.scrollTop = battleLog.scrollHeight;
            turn.innerText = `Текущий ход: ${data.turn}`;
        })
        .catch(error => {
            console.error('Ошибка в updateBattleLog:', error);
            handleExplorationError(error);
        });
}

function attack() {
    fetch(`/api/battle/attack?userId=${userId}`, {method: 'POST'})
        .then(response => response.json())
        .then(data => {
            updateCombatHealth('damage');
            updateBattleLog();
            checkCombatStatus();
        })
        .catch(handleExplorationError);
}

function tryFlee() {
    fetch(`/api/battle/flee?userId=${userId}`, {method: 'POST'})
        .then(response => response.json())
        .then(data => {
            updateCombatHealth();
            updateStats();
            updateBattleLog();
            checkCombatStatus();
        })
        .catch(handleExplorationError);
}

function openAbilities() {
    console.log('Открытие меню способностей');
    const abilitiesModal = document.createElement('div');
    abilitiesModal.innerHTML = `
            <div class="modal">
                <div class="modal-content">
                    <span class="close" onclick="this.parentElement.parentElement.remove()">×</span>
                    <p>Способности пока не доступны</p>
                </div>
            </div>
        `;
    document.body.appendChild(abilitiesModal);
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