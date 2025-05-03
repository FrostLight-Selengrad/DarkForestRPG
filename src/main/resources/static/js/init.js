const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userId = tg.initDataUnsafe.user.id;
if (!userId) {
    logExplorationEvent("Ошибка: пользователь не авторизован");
}

function startProgressBar(stamina, message) {
    document.getElementById('exploration-progress').style.display = 'block';
    const progressFill = document.querySelector('#exploration-progress .progress-fill');
    const travelTime = calculateTravelTime(stamina);
    let startTime = Date.now();

    const animationFrame = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / travelTime, 1);
        progressFill.style.width = `${progress * 100}%`;
        if (progress < 1) {
            requestAnimationFrame(animationFrame);
        } else {
            document.getElementById('exploration-progress').style.display = 'none';
            processExplorationResult(message);
        }
    };
    requestAnimationFrame(animationFrame);
}

async function initializeGame() {
    try {
        const response = await fetch(`/api/game/player?userId=${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Initialize response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Initialize error response:', errorText);
            throw new Error('Failed to load player data: ' + errorText);
        }
        const data = await response.json();
        console.log('Player data:', data);
        if (data.currentEventType === "combat") {
            setActiveInterface('battle-interface');
            updateBattleInterface(data);
        } else if (data.currentLocation === "forest") {
            setActiveInterface('exploration-interface');
            forestInitialize(data);
        } else if (data.currentLocation === "base_camp") {
            setActiveInterface('camp-interface');
            campInitialize(data);
        } else {
            console.error('Unknown location:', data.currentLocation);
            alert('Неизвестная локация');
        }
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Не удалось загрузить данные игрока');
    }
}

async function leaveCamp() {
    try {
        const response = await fetch(`/api/game/move?userId=${userId}&location=forest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Leave camp response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Leave camp error response:', errorText);
            throw new Error('Failed to move to forest: ' + errorText);
        }
        const data = await response.json();
        console.log('Move data:', data);
        setActiveInterface('exploration-interface');
        forestInitialize(data);
    } catch (error) {
        console.error('Leave camp error:', error);
        alert('Не удалось выйти в лес');
    }
}

function forestInitialize(data) {
    with (data) {
        updateStats(currentLocation, hp, maxHp, stamina, maxStamina, forestLevel, gold);
        updateActions(currentLocation);
        setActiveInterface('exploration-interface');
        document.getElementById('exploration-log').innerHTML = message || 'Вы в лесу';
    }
}

function campInitialize(data) {
    with (data) {
        updateStats(currentLocation, hp, maxHp, stamina, maxStamina, forestLevel, gold);
        updateActions(currentLocation);
        setActiveInterface('camp-interface');
        document.getElementById('camp-log').innerHTML = message || 'Вы в лагере';
    }
}

function updateStats(location, hp, maxHp, stamina, maxStamina, forestLevel, gold) {
    switch (location) {
        case "forest":
            document.getElementById('player-stats').innerHTML = `
                <p>HP: ${hp}/${maxHp} | Уровень леса: ${forestLevel} | </p>
                <p>Золото: ${gold} | Выносливость: ${stamina}/${maxStamina}</p>
            `;
            break;
        case "base_camp":
            document.getElementById('player-camp-stats').innerHTML = `
                <p>HP: ${hp}/${maxHp} | Выносливость: ${stamina}/${maxStamina}</p>
                <p>Золото: ${gold}</p>
            `;
            break;
        default:
            break;
    }
}

function hideAllActions() {
    const actions = document.getElementById('actions').children;
    for (let btn of actions) btn.style.display = 'none';
}

function showActions(actions) {
    actions.forEach(action => {
        document.getElementById(`action-${action}`).style.display = 'block';
    });
}

function updateActions(type) {
    hideAllActions();
    switch (type) {
        case 'forest':
            showActions(['continue', 'return-camp']);
            break;
        case 'chest':
            showActions(['open-chest', 'continue']);
            break;
        case 'trap':
            showActions(['escape-trap']);
            break;
        case 'trap_missed':
            showActions(['continue', 'return-camp']);
            break;
        case 'monster':
            showActions(['fight', 'flee']);
            break;
        case 'abandoned_camp':
            showActions(['rest-camp', 'continue']);
            break;
        case 'boss':
            showActions(['fight']);
            break;
    }
}

function hideAllInterfaces() {
    const interfaces = document.getElementsByClassName('interface');
    for (let iface of interfaces) iface.style.display = 'none';
}

function setActiveInterface(interfaceName) {
    hideAllInterfaces();
    document.getElementById(interfaceName).style.display = 'block';
}

function updateBattleInterface(data) {
    document.getElementById('player-combat-hp').innerText = `${data.hp}/${data.maxHp}`;
    const enemyData = data.eventData ? data.eventData.enemy : {};
    document.getElementById('enemy-combat-hp').innerText = `${enemyData.hp || 0}/${enemyData.maxHp || 0}`;
    document.getElementById('enemy-combat-name').innerText = enemyData.name || 'Неизвестный враг';
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
    const images = ['forest.png', 'forest_v1.png', 'forest_v2.png', 'goblin.png', 'mimic.png', 'boss.png', 'event_chest.png'];
    images.forEach(img => {
        new Image().src = `images/${img}`;
    });
}

// Инициализация
initializeGame();
preloadImages();