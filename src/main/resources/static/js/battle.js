function enterCombat(enemyData) {
    console.log('Запуск enterCombat с данными:', enemyData);

    const exploration = document.getElementById('exploration-interface');
    const battle = document.getElementById('battle-interface');
    const enemyImage = document.getElementById('enemy-image');
    const enemyName = document.getElementById('enemy-combat-name');
    const enemyLevel = document.getElementById('enemy-level');
    const enemyHp = document.getElementById('enemy-combat-hp');

    if (!exploration || !battle || !enemyImage || !enemyName || !enemyLevel || !enemyHp) {
        console.error('Отсутствуют элементы DOM:', {
            exploration, battle, enemyImage, enemyName, enemyLevel, enemyHp
        });
        throw new Error('Не найдены необходимые элементы интерфейса');
    }

    exploration.classList.add('hide-to-left');
    setTimeout(() => {
        try {
            exploration.style.display = 'none';
            battle.style.display = 'block';
            battle.classList.add('show-from-right');
        } catch (e) {
            console.error('Ошибка в setTimeout:', e);
            throw e;
        }
    }, 500);

    let image = "goblin.png";
    if (enemyData.enemyName.includes("Мимик")) image = "mimic.png";
    if (enemyData.enemyName.includes("Босс")) image = "boss.png";
    enemyImage.src = `images/${image}`;
    enemyName.textContent = enemyData.enemyName;
    enemyLevel.textContent = "Уровень " + (enemyData.level || 1);
    enemyHp.textContent = `${enemyData.enemyHp}/${enemyData.enemyMaxHp || enemyData.enemyHp}`;

    updateBattleLog();
    // Привязка событий после отображения интерфейса
    document.querySelector('.battle-action-grid .action-btn[onclick="attack()"]').onclick = attack;
    document.querySelector('.battle-action-grid .action-btn[onclick="tryFlee()"]').onclick = tryFlee;
    document.querySelector('.battle-action-grid .action-btn[onclick="openAbilities()"]').onclick = openAbilities;
    document.querySelector('.battle-action-grid .action-btn[onclick="openPotionsModal()"]').onclick = openPotionsModal;
}

function updateBattleLog() {
    const battleLog = document.getElementById('battle-log');
    const turn = document.getElementById('turn');
    if (!battleLog || !turn) {
        console.error('Отсутствуют элементы battle-log или turn:', { battleLog, turn });
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