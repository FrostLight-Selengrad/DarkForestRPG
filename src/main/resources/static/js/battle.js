// battle.js - Управление боем
function displayBattle(battleData) {
    document.getElementById('player-combat-hp').innerText = `${battleData.player.health}/${battleData.player.maxHealth}`;
    document.getElementById('enemy-combat-hp').innerText = `${battleData.enemy.health}/${battleData.enemy.maxHealth}`;
    document.getElementById('enemy-combat-name').innerText = battleData.enemy.name;
    document.getElementById('enemy-level').innerText = `Уровень ${battleData.enemy.level}`;
    document.getElementById('enemy-image').src = `/images/${battleData.enemy.image || 'goblin.png'}`;
    document.getElementById('battle-log').innerText = 'Бой начался!';
}

async function attack() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const response = await fetch(`/api/battle/attack?userId=${userId}`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось атаковать');
        const battleData = await response.json();
        displayBattle(battleData);
        if (battleData.isOver) {
            endBattle(battleData);
        }
    } catch (error) {
        console.error('Ошибка атаки:', error);
        document.getElementById('battle-log').innerText = 'Ошибка: попробуйте позже';
    }
}

async function tryFlee() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const response = await fetch(`/api/battle/flee?userId=${userId}`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось сбежать');
        const result = await response.json();
        document.getElementById('battle-log').innerText = result.message;
        if (result.success) {
            switchInterface('exploration-interface');
            showActions(['action-continue', 'action-return-camp']);
        }
    } catch (error) {
        console.error('Ошибка побега:', error);
        document.getElementById('battle-log').innerText = 'Ошибка: попробуйте позже';
    }
}

function endBattle(battleData) {
    document.getElementById('battle-log').innerText = battleData.message;
    switchInterface('exploration-interface');
    showActions(['action-continue', 'action-return-camp']);
}

// Загрузка battle.js при старте
console.log('battle.js loaded');