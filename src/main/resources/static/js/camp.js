// camp.js - Управление лагерем
async function loadCamp(userId) {
    try {
        const response = await fetch(`/api/player?userId=${userId}`);
        if (!response.ok) throw new Error('Не удалось загрузить данные игрока');
        const playerData = await response.json();
        displayCampStats(playerData);
    } catch (error) {
        console.error('Ошибка загрузки лагеря:', error);
        document.getElementById('camp-log').innerText = 'Ошибка: попробуйте позже';
    }
}

function displayCampStats(playerData) {
    const statsDiv = document.getElementById('player-camp-stats');
    statsDiv.innerHTML = `
        <p>Здоровье: ${playerData.health}/${playerData.maxHealth}</p>
        <p>Выносливость: ${playerData.stamina}/${playerData.maxStamina}</p>
    `;
}

async function leaveCamp() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id; // Получаем userId из Telegram
    try {
        const response = await fetch(`/api/game/move?userId=${userId}&location=forest`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось выйти в лес');
        const locationData = await response.json();
        switchInterface('exploration-interface');
        displayExploration(locationData);
    } catch (error) {
        console.error('Ошибка выхода в лес:', error);
        document.getElementById('camp-log').innerText = 'Ошибка: попробуйте позже';
    }
}

function takeRest() {
    // Заглушка для отдыха
    document.getElementById('camp-log').innerText = 'Отдых пока не реализован';
}

// Переключение интерфейсов
function switchInterface(activeId) {
    document.getElementById('camp-interface').style.display = 'none';
    document.getElementById('exploration-interface').style.display = 'none';
    document.getElementById('battle-interface').style.display = 'none';
    document.getElementById(activeId).style.display = 'block';
}

// Загрузка лагеря при старте
const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
loadCamp(userId);