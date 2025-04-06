function exploreForest() {
    const button = document.querySelector('#actions .action-btn');
    button.disabled = true;
    const actionsDiv = document.getElementById('actions');
    actionsDiv.style.opacity = '0';
    actionsDiv.style.transition = 'opacity 0.3s';

    fetch(`/api/game/explore?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            if (!data || typeof data.stamina === 'undefined') throw new Error('Некорректный ответ сервера');
            const stamina = Number(data.stamina);
            if (isNaN(stamina)) throw new Error('Ошибка данных выносливости');

            if (stamina <= 1) {
                actionsDiv.style.opacity = '1';
                logExplorationEvent("Герой устал и нуждается в отдыхе!");
                document.getElementById('actions').innerHTML =
                    `<button onclick="returnToCamp()">Вернуться в лагерь</button>`;
                button.disabled = false;
                return;
            }

            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            progressContainer.innerHTML = `
                <p>Исследование леса...</p>
                <div class="progress-bar" id="travel-progress">
                    <div class="progress-fill"></div>
                </div>
            `;
            actionsDiv.replaceWith(progressContainer);
            const progressFill = document.querySelector('.progress-fill');

            const travelTime = calculateTravelTime(stamina);
            let startTime = Date.now();

            const animationFrame = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / travelTime, 1);
                progressFill.style.width = `${progress * 100}%`;

                if (progress < 1) {
                    requestAnimationFrame(animationFrame);
                } else {
                    setTimeout(() => {
                        progressContainer.remove();
                        // Передаем данные из первого запроса напрямую
                        processExplorationResult(data);
                        button.disabled = false; // Включаем кнопку обратно
                    }, 300);
                }
            };
            requestAnimationFrame(animationFrame);
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
        `;
    } else {
        updateExplorationEvent(data);
    }

    if (data.inCombat) enterCombat(data);
}

function updateExplorationEvent(data) {
    // Разбиваем строку message по символу ':'
    const parts = data.message.split(':');
    if (parts.length < 3) {
        console.error("Некорректный формат сообщения:", data.message);
        return;
    }
    const type = parts[0] || "forest";
    const image = parts[1] || "forest.png";
    const message = parts.slice(2).join(':') || "Вы продолжаете путь";

    // Убеждаемся, что имя файла заканчивается на .png
    const safeImage = image.endsWith('.png') ? image : `${image}.png`;

    // Обновляем интерфейс
    document.getElementById('exploration-log').innerHTML = `
            <p>${message}</p>
    `;
    document.getElementById('forest-image').src = `images/${safeImage}`;
    document.getElementById('exploration-interface').style.display = 'block';

    updateActions(type);

    const actionsDiv = document.getElementById('actions');
    if (actionsDiv.children.length === 0) {
        actionsDiv.innerHTML = `
            <button onclick="exploreForest()" class="action-btn">Продолжить</button>
        `;
    }
}

function updateActions(type) {
    const actionMap = {
        chest: () => `
            <button onclick="openChest()" class="action-btn">Открыть сундук</button>
            <button onclick="exploreForest()" class="action-btn">Пройти мимо</button>
        `,
        trap: () => message.includes("попали") ? `
            <button onclick="escapeTrap()" class="action-btn danger">
                Попытаться выбраться (%)
            </button>
        ` : null,
        monster: () => `
            <button onclick="fightMonster()" class="action-btn">Вступить в бой</button>
            <button onclick="tryFleeBeforeCombat()" class="action-btn">Убежать</button>
        `,
        abandoned_camp: () => `
            <button onclick="restAtCamp()" class="action-btn">Разжечь костер</button>
            <button onclick="exploreForest()" class="action-btn">Пройти мимо</button>
        `,
        boss: () => `
            <button onclick="fightMonster()" class="action-btn">Вступить в бой</button>
            <button onclick="tryFleeBeforeCombat()" class="action-btn">Убежать</button>
        `
    };

    const defaultAction = `
        <button onclick="exploreForest()" class="action-btn">Продолжить путь</button>
    `;
    document.getElementById('actions').innerHTML = actionMap[type]?.() || defaultAction;
}

function calculateTravelTime(stamina) {
    return 5000 + Math.floor((100 - stamina) / 8) * 1000;
}

function escapeTrap() {
    fetch(`/api/game/escape-trap?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => updateExplorationEvent(data))
        .catch(handleExplorationError);
}

function fightMonster() {
    fetch(`/api/game/fight-monster?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => { if (data.inCombat) enterCombat(data); })
        .catch(handleExplorationError);
}

function tryFleeBeforeCombat() {
    fetch(`/api/game/flee-before-combat?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => updateExplorationEvent(data))
        .catch(handleExplorationError);
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
            if (data.inCombat) enterCombat(data);
        })
        .catch(handleExplorationError);
}