function enterCombat(enemyData) {
    console.log('[Combat] Starting combat with:', enemyData);

    console.log('Battle elements:', {
        interface: document.getElementById('battle-interface'),
        image: document.getElementById('enemy-image'),
        name: document.getElementById('enemy-combat-name')
    });

    // Добавьте проверку ключевых данных
    if (!enemyData || !enemyData.enemyName) {
        console.error('Invalid enemy data:', enemyData);
        logExplorationEvent("Ошибка: данные противника не получены");
        return;
    }

    // Исправьте имена полей согласно API
    const combatData = {
        name: enemyData.enemyName || enemyData.name,
        hp: enemyData.enemyHp || enemyData.hp,
        maxHp: enemyData.enemyMaxHp || enemyData.maxHp,
        level: enemyData.level || 1
    };

    const exploration = document.getElementById('exploration-interface');
    const battle = document.getElementById('battle-interface');

    // Принудительно скрываем exploration
    exploration.style.display = 'none';
    exploration.classList.remove('hide-to-left');

    // Показываем battle интерфейс
    battle.style.display = 'block';
    battle.classList.remove('show-from-right');

    // Обновляем данные врага
    const enemyImage = document.getElementById('enemy-image');
    enemyImage.src = `images/${
        combatData.name.includes("Мимик") ? "mimic.png" :
            combatData.name.includes("Босс") ? "boss.png" :
                "goblin.png"
    }`;

    document.getElementById('enemy-combat-name').textContent = combatData.name;
    document.getElementById('enemy-level').textContent = `Уровень ${combatData.level}`;
    document.getElementById('enemy-combat-hp').textContent =
        `${combatData.hp}/${combatData.maxHp}`;
    // Принудительное обновление лога
    updateBattleLog();
    console.log('Battle elements:', {
        interface: document.getElementById('battle-interface'),
        image: document.getElementById('enemy-image'),
        name: document.getElementById('enemy-combat-name')
    });
    updateStats()
    console.log('[Combat] Interface updated');
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

function checkCombatStatus() {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            if (!player.inCombat) {
                document.getElementById('battle-interface').style.display = 'none';
                document.getElementById('exploration-interface').style.display = 'block';
                document.getElementById('exploration-log').innerHTML = '<p>Бой завершен! Продолжаем путь...</p>';
                document.getElementById('forest-image').src = 'images/forest_v1.png';
                updateActions('forest');
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