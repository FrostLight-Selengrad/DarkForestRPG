// battle.js - Управление боем

async function fightMonster() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const response = await fetch(`/api/battle/start?userId=${userId}`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось начать бой');
        const battleData = await response.json();
        setActiveInterface('battle-interface');
        updateBattleInterface(battleData);
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
        updateBattleInterface(battleData);
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