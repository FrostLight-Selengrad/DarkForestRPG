function exploreForest() {

    fetch(`/api/game/explore?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            // Скрываем все кнопки
            hideAllActions();
            // Показываем прогресс бар
            startProgressBar(data.stamina, data.message);
        })
        .catch(handleExplorationError);
}

// Функция для обработки результата исследования
function processExplorationResult(data) {
    updateStats();
    // Проверяем, является ли сообщение дефолтным или ошибочным
    if (data.message === "Ничего не произошло" || data.message === "Вы не можете исследовать лес во время боя!") {
        document.getElementById('exploration-log').innerHTML += `
            <p>${data.message}</p>
        `;
        document.getElementById('actions').innerHTML = `
            <button onclick="exploreForest()" class="action-btn">Продолжить</button>
            <button onclick="returnToCamp()" class="action-btn">Вернуться в лагерь</button>
        `;
    } else {
        updateExplorationEvent(data);
    }
    if (data.inCombat) enterCombat(data);
}

function updateExplorationEvent(data) {
    const logDiv = document.getElementById('exploration-log');
    logDiv.innerHTML = '';
    // Разбиваем сообщение на части с учетом возможных двоеточий в тексте
    const parts = (data.message || "").split(':');
    const [type = "forest", image = "forest.png", ...messageParts] = parts;
    const message = messageParts.join(':').trim() || "Событие не распознано"; // Собираем оставшиеся части

    // Обновляем изображение
    const imageElement = document.getElementById('forest-image');
    if (type !== 'forest') {
        const safeImage = image.endsWith('.png') ? image : `${image}.png`;
        imageElement.src = `images/${safeImage}`;
    } else {
        imageElement.src = 'images/forest_v2.png';
    }

    // Добавляем текст события в лог
    logDiv.innerHTML = `
            <p>${message}</p>
    `;
    // Обновляем действия
    updateActions(type);
}

function escapeTrap() {
    fetch(`/api/game/escape-trap?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // Принудительно обновляем весь интерфейс
            document.getElementById('exploration-interface').style.display = 'block';
            document.getElementById('battle-interface').style.display = 'none';
            updateStats();
            updateExplorationEvent(data);
        })
        .catch(handleExplorationError);
}

function tryFleeBeforeCombat() {
    fetch(`/api/game/flee-before-combat?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                // Успешный побег
                document.getElementById('exploration-log').innerHTML = `<p>${data.message}</p>`;
                document.getElementById('forest-image').src = 'images/forest_v1.png';
                updateActions('forest')
            } else {
                enterCombat(data);
            }
        })
        .catch(error => {
            console.error('Ошибка при попытке сбежать до боя:', error);
            document.getElementById('exploration-log').innerHTML = '<p>Сервер не отвечает!</p>';
        });
}

function restAtCamp() {
    fetch(`/api/game/rest-at-camp?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let time = 0;
                const interval = setInterval(() => {
                    time += 1;
                    updateStats();
                    if (time >= 20) clearInterval(interval);
                }, 1000);
            }
        })
        .catch(handleExplorationError);
}

function openChest() {
    fetch(`/api/game/open-chest?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            updateStats();
            updateExplorationEvent(data);
            if (data.inCombat) {
                console.log('Начинаем бой, данные:', data);
                enterCombat(data);
            } else {
                updateActions('forest'); // Переключаем кнопки на лесные
            }
        })
        .catch(handleExplorationError);
}