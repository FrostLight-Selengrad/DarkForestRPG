// camp.js - Управление лагерем
function displayCampStats(playerData) {
    const statsDiv = document.getElementById('player-camp-stats');
    statsDiv.innerHTML = `
        <p>Здоровье: ${playerData.health}/${playerData.maxHealth}</p>
        <p>Выносливость: ${playerData.stamina}/${playerData.maxStamina}</p>
    `;
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