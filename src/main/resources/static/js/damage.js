// damage.js
function applyPhysicalDamage(element) {
    element.classList.add('damage');
    element.insertAdjacentHTML('afterend', '<img src="images/shield_cracked.png" class="damage-icon">');
    setTimeout(() => {
        element.classList.remove('damage');
        const icon = element.nextElementSibling;
        if (icon && icon.classList.contains('damage-icon')) icon.remove();
    }, 500);
}

function applyHeal(element) {
    element.classList.add('heal');
    element.insertAdjacentHTML('beforebegin', '<img src="images/heal_effect.png" class="heal-icon">');
    setTimeout(() => {
        element.classList.remove('heal');
        const icon = element.previousElementSibling;
        if (icon && icon.classList.contains('heal-icon')) icon.remove();
    }, 500);
}

function updateCombatHealth(actionType) {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            const playerHpElement = document.getElementById('player-combat-hp');
            const enemyHpElement = document.getElementById('enemy-combat-hp');
            if (actionType === 'heal') {
                applyHeal(playerHpElement);
            } else {
                applyPhysicalDamage(playerHpElement);
                if (player.inCombat) applyPhysicalDamage(enemyHpElement);
            }
            playerHpElement.textContent = `${player.hp}/${player.maxHp}`;
            if (player.inCombat) enemyHpElement.textContent = `${player.enemyHp}/${player.enemyMaxHp}`;
        })
        .catch(handleExplorationError);
}

// Загрузка damage.js при старте
console.log('damage.js loaded');