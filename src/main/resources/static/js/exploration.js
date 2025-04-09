function exploreForest() {
    const actionsDiv = document.getElementById('actions');
    const button = document.querySelector('#actions .action-btn');
    if (button) {
        button.remove;
    } // Удаляем кнопку, если она есть

    fetch(`/api/game/explore?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            if (!data || typeof data.stamina === 'undefined') throw new Error('Некорректный ответ сервера');
            const stamina = Number(data.stamina);
            if (isNaN(stamina)) throw new Error('Ошибка данных выносливости');

            if (stamina <= 15) {
                actionsDiv.style.display = 'block';
                logExplorationEvent("Выносливость героя на исходе! Возможно стоит вернуться в лагерь или использовать зелье выносливости.");
                actionsDiv.innerHTML = `
                    <button onclick="exploreForest()" class="action-btn">Продолжить</button>
                    <button onclick="returnToCamp()" class="action-btn">Вернуться в лагерь</button>
                `;
                return;
            }

            if (stamina <= 1) {
                logExplorationEvent("Герой устал и нуждается в отдыхе!");
                document.getElementById('actions').innerHTML = `
                    <button onclick="exploreForest()" class="action-btn">Продолжить</button>
                    <button onclick="returnToCamp()">Вернуться в лагерь</button>
                `;
                actionsDiv.style.display = 'block'; // Показываем actionsDiv
                return;
            }

            actionsDiv.style.display = 'none'; // Скрываем actionsDiv вместо удаления

            // Создаем progressContainer и добавляем его после actionsDiv
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            progressContainer.innerHTML = `
                <p>Исследование леса...</p>
                <div class="progress-bar" id="travel-progress">
                    <div class="progress-fill"></div>
                </div>
            `;
            actionsDiv.parentNode.insertBefore(progressContainer, actionsDiv.nextSibling);

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
                        progressContainer.remove(); // Удаляем progressContainer
                        actionsDiv.style.display = 'block'; // Показываем actionsDiv
                        processExplorationResult(data); // Обрабатываем результат
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
            <button onclick="returnToCamp()" class="action-btn">Вернуться в лагерь</button>
        `;
    } else {
        updateExplorationEvent(data);
    }

    if (data.inCombat) enterCombat(data);
}

function updateExplorationEvent(data) {
    // Очищаем предыдущее содержимое лога
    const logDiv = document.getElementById('exploration-log');
    logDiv.innerHTML = '';

    // Разбиваем сообщение с защитой от ошибок
    const [type = "forest", image = "forest.png", ...messageParts] =
        (data.message || "").split(/:(.+)/);
    const message = messageParts.join(':').trim() || "Событие не распознано";

    // Обновляем изображение
    const safeImage = image.endsWith('.png') ? image : `${image}.png`;
    document.getElementById('forest-image').src = `images/${safeImage}`;

    // Добавляем новую запись в лог с анимацией
    const eventHTML = `
        <div class="event-card animate-slide-in">
            <img src="images/${safeImage}" 
                 onerror="this.src='images/forest.png'"
                 class="event-image">
            <p>${message}</p>
        </div>
    `;
    logDiv.insertAdjacentHTML('afterbegin', eventHTML);

    // Обновляем кнопки действий
    updateActions(type, message, data);
}

function updateActions(type, message, data) {
    const actionMap = {
        chest: () => `
            <button onclick="openChest()" class="action-btn">Открыть сундук</button>
            <button onclick="exploreForest()" class="action-btn">Пройти мимо</button>
        `,
        trap: () => `
            <button onclick="exploreForest()" class="action-btn">
                ${message.includes("успешно") ? "Продолжить путь" : "Попробовать снова"}
            </button>
            <button onclick="returnToCamp()" class="action-btn">В лагерь</button>
        `,
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

    const actionsDiv = document.getElementById('actions');
    if (type === 'forest') {
        actionsDiv.innerHTML = `
            <button onclick="exploreForest()" class="action-btn">Продолжить</button>
            <button onclick="returnToCamp()" class="action-btn">Вернуться в лагерь</button>
        `;
    } else {
        actionsDiv.innerHTML = actionMap[type]?.() || `
            <button onclick="exploreForest()" class="action-btn">Продолжить</button>
            <button onclick="returnToCamp()" class="action-btn">Где я?</button>
        `;
    }
    document.getElementById('actions').innerHTML =
        actionMap[type]?.() || defaultActions;
}

function calculateTravelTime(stamina) {
    return 5000 + Math.floor((100 - stamina) / 8) * 1000;
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

function fightMonster() {
    console.log('[Fight] Initiating monster fight...');
    fetch(`/api/game/fight-monster?userId=${userId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('[Fight] Response data:', data);
            if (data.inCombat) {
                enterCombat({
                    enemyName: data.enemyName,
                    enemyHp: data.enemyHp,
                    enemyMaxHp: data.enemyMaxHp,
                    level: data.enemyLevel
                });
            } else {
                console.warn('Unexpected combat state:', data);
            }
        })
        .catch(error => {
            console.error('[Fight] Combat error:', error);
            handleExplorationError(error);
        });
}

function tryFleeBeforeCombat() {
    fetch(`/api/game/flee-before-combat?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Вы успешно сбежали!") {
                updateStats(); // Обновляем состояние, чтобы сбросить inCombat
            }
            updateExplorationEvent(data);
        })
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
            if (data.inCombat) {
                console.log('Начинаем бой, данные:', data);
                enterCombat(data);
            } else {
                updateActions('forest'); // Переключаем кнопки на лесные
            }
        })
        .catch(handleExplorationError);
}