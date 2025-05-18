// battle.js - Управление боем
function displayBattle(battleData) {
    // Обновление данных игрока
    document.getElementById('player-combat-hp').innerText = `❤️ ${battleData.player.hp}/${battleData.player.maxHp}`;
    document.getElementById('player-combat-attack').innerText = `⚔️ ${battleData.player.attack}`;
    document.getElementById('player-combat-defence').innerText = `🛡️ ${battleData.player.defense}`;
    document.getElementById('player-combat-speed').innerText = `🏃 ${battleData.player.speed}`;

    // Обновление данных врага
    document.getElementById('enemy-combat-hp').innerText = `❤️ ${battleData.enemy.hp}/${battleData.enemy.maxHp}`;
    document.getElementById('enemy-combat-attack').innerText = `⚔️ ${battleData.enemy.attack}`;
    document.getElementById('enemy-combat-defence').innerText = `🛡️ ${battleData.enemy.defense}`;
    document.getElementById('enemy-combat-speed').innerText = `🏃 ${battleData.enemy.speed}`;

    // Установка имени и уровня врага, если элементы существуют
    const enemyNameElement = document.getElementById('enemy-combat-name');
    if (enemyNameElement) {
        enemyNameElement.innerText = battleData.enemy.name;
    }
    const enemyLevelElement = document.getElementById('enemy-level');
    if (enemyLevelElement) {
        enemyLevelElement.innerText = `Уровень ${battleData.enemy.level}`;
    }

    // Установка изображения врага
    document.getElementById('enemy-image').src = `/images/${battleData.enemy.image || 'default_enemy.png'}`;

    // Обновление лога боя с сообщением от сервера
    document.getElementById('battle-log').innerText = battleData.message;
}

async function fightMonster() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const response = await fetch(`/api/battle/start?userId=${userId}`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось начать бой');
        const battleData = await response.json();
        setActiveInterface('battle-interface');
        displayBattle(battleData);
    } catch (error) {
        console.error('Ошибка начала боя:', error);
        document.getElementById('exploration-log').innerText = 'Ошибка начала боя: попробуйте позже';
    }
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