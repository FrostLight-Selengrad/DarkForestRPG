const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userId = tg.initDataUnsafe.user.id;
if (!userId) {
    logExplorationEvent("Ошибка: пользователь не авторизован");
}

function setActiveInterface(interfaceName) {
    const interfaces = ['camp', 'exploration', 'battle'];

    interfaces.forEach(name => {
        document.getElementById(`${name}-interface`).style.display =
            name === interfaceName ? 'block' : 'none';
    });

    // Обновляем кнопки для текущего интерфейса
    if(interfaceName === 'exploration') updateActions('forest');
    if(interfaceName === 'camp') updateCampActions();
}

async function initializeGame() {
    let response = await fetch(`/api/game/player?userId=${userId}`);
    let player = await response.json();
    if (player.currentEventType === "combat") {
        enterCombat(player);
    } else if (player.currentEventType === "chest") {
        showChestInterface(player);
    } else if (player.currentEventType === "hidden_cache") {
        showCacheInterface(player);
    } else {
        showExplorationInterface();
    }
}

function updateStats() {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            if (player.error) {
                document.getElementById('player-stats').innerHTML = player.error;
            } else {
                document.getElementById('player-stats').innerHTML = `
                    <p>HP: ${player.hp}/${player.maxHp} | Уровень леса: ${player.forestLevel} | Золото: ${player.resources}</p>
                    <p>Физ. атака: ${player.physicalAttack} | Выносливость: ${player.stamina}/${player.maxStamina}</p>
                `;
                if (player.inCamp) {
                document.getElementById('player-camp-stats').innerHTML = `
                        <p>HP: ${player.hp}/${player.maxHp} | Выносливость: ${player.stamina}/${player.maxStamina}</p>
                        <p>Золото: ${player.resources}</p>
                    `;
                }
            }
        })
        .catch(handleExplorationError);
}

function handleExplorationError(error) {
    console.error('Ошибка:', error);
    const actionsDiv = document.getElementById('actions');
    actionsDiv.style.opacity = '1';

    if (error instanceof SyntaxError) {
        logExplorationEvent("Ошибка формата данных сервера!");
    } else if (error.message.includes("Некорректный")) {
        logExplorationEvent(error.message);
    } else {
        logExplorationEvent("Сервер не отвечает!");
    }

    actionsDiv.innerHTML = `
        <button onclick="exploreForest()" class="action-btn">Повторить</button>
        <button onclick="returnToCamp()" class="action-btn">В лагерь</button>
    `;
}

function logExplorationEvent(message) {
    const logDiv = document.getElementById('exploration-log');
    logDiv.innerHTML = `<p>${message}</p>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

function preloadImages() {
    const images = ['forest.png','forest_v1.png','forest_v2.png', 'goblin.png', 'mimic.png','boss.png',
        'event_chest.png'];
    images.forEach(img => {
        new Image().src = `images/${img}`;
    });
}

// Инициализация
initializeGame();
preloadImages();