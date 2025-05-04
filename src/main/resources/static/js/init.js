const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userId = tg.initDataUnsafe.user.id;
if (!userId) {
    logExplorationEvent("Ошибка: пользователь не авторизован");
}

function startProgressBar(stamina, message) {
    const progressContainer = document.getElementById('exploration-progress');
    if (!progressContainer) {
        console.error('Element exploration-progress not found');
        return;
    }
    progressContainer.style.display = 'block';
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
            progressContainer.style.display = 'none';
            processExplorationResult(message);
        }
    };
    requestAnimationFrame(animationFrame);
}

async function initializeGame() {
    try {
        console.log('Starting initializeGame for userId:', userId);
        const response = await fetch(`/api/game/player?userId=${userId}`);
        console.log('Initialize response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Initialize error response:', errorText);
            throw new Error('Failed to load player data: ' + errorText);
        }

        const data = await response.json();
        console.log('Player data:', data);
        if (!data.currentLocation) {
            console.error('Missing currentLocation in player data');
            throw new Error('Invalid player data: missing currentLocation');
        }
        if (data.currentEventType === "combat") {
            console.log('Switching to battle interface');
            updateBattleInterface(data);
            console.log('Calling setActiveInterface');
            setActiveInterface("battle-interface");
        } else if (data.currentLocation === "forest") {
            console.log('Switching to exploration interface');
            forestInitialize(data);
            console.log('Calling setActiveInterface');
            setActiveInterface("exploration-interface");
        } else if (data.currentLocation === "base_camp") {
            console.log('Switching to camp interface');
            campInitialize(data);
            console.log('Calling setActiveInterface');
            setActiveInterface("camp-interface");
        } else {
            console.error('Unknown location:', data.currentLocation);
            //alert('Неизвестная локация');
        }
    } catch (error) {
        console.error('Initialization error:', error);
        //alert('Не удалось загрузить данные игрока');
    }
}

async function leaveCamp() {
    try {
        console.log('Starting leaveCamp for userId:', userId);
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
        if (!data.currentLocation) {
            console.error('Missing currentLocation in move data');
            throw new Error('Invalid move data: missing currentLocation');
        }
        forestInitialize(data);
    } catch (error) {
        console.error('Leave camp error:', error);
        // alert('Не удалось выйти в лес');
    }
}

function campInitialize(data) {
    try {
        console.log('campInitialize called with data:', data);
        with (data) {
            console.log('Calling updateStats');
            updateStats(currentLocation, hp, maxHp, stamina, maxStamina, forestLevel, gold);
            console.log('Calling updateActions with:', currentLocation);
            updateActions(currentLocation);
            console.log('Try to update log');
            const logElement = document.getElementById('camp-log');
            if (!logElement) {
                console.error('Element camp-log not found');
                throw new Error('Missing camp-log element');
            }
            console.log('Updating camp-log');
            logElement.innerHTML = message || 'Вы в лагере';
        }
    } catch (error) {
        console.error('Error in campInitialize:', error);
        throw error;
    }
}

function updateStats(location, hp, maxHp, stamina, maxStamina, forestLevel, gold) {
    try {
        console.log('updateStats called with location:', location);
        switch (location) {
            case "forest":
                const statsElement = document.getElementById('player-stats');
                if (!statsElement) {
                    console.error('Element player-stats not found');
                    throw new Error('Missing player-stats element');
                }
                statsElement.innerHTML = `
                    <p>HP: ${hp}/${maxHp} | Уровень леса: ${forestLevel} | </p>
                    <p>Золото: ${gold} | Выносливость: ${stamina}/${maxStamina}</p>
                `;
                break;
            case "base_camp":
                const campStatsElement = document.getElementById('player-camp-stats');
                if (!campStatsElement) {
                    console.error('Element player-camp-stats not found');
                    throw new Error('Missing player-camp-stats element');
                }
                campStatsElement.innerHTML = `
                    <p>HP: ${hp}/${maxHp} | Выносливость: ${stamina}/${maxStamina}</p>
                    <p>Золото: ${gold}</p>
                `;
                break;
            default:
                console.error('Invalid location for updateStats:', location);
                break;
        }
    } catch (error) {
        console.error('Error in updateStats:', error);
        throw error;
    }
}

function hideAllActions() {
    try {
        const actions = document.getElementById('actions');
        if (!actions) {
            console.error('Element actions not found');
        }
        for (let btn of actions.children) {
            btn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error in hideAllActions:', error);
        throw error;
    }
}

function updateActions(type) {
    try {
        console.log('try to hideAllActions');
        hideAllActions();
        console.log('updateActions called with type:', type);
        switch (type) {
            case 'base_camp': break;
            case 'forest':
                console.log('showActions called with continue and return-camp');
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
            default:
                showActions(['continue', 'return-camp']);
                break;
        }
    } catch (error) {
        console.error('Error in updateActions:', error);
        throw error;
    }
}

function hideAllInterfaces() {
    try {
        const interfaces = document.getElementsByClassName('interface');
        if (!interfaces.length) {
            console.error('No elements with class interface found');
            throw new Error('Missing interface elements');
        }
        for (let iface of interfaces) {
            iface.style.display = 'none';
        }
    } catch (error) {
        console.error('Error in hideAllInterfaces:', error);
        throw error;
    }
}

function setActiveInterface(interfaceName) {
    try {
        console.log('setActiveInterface called with:', interfaceName);
        hideAllInterfaces();
        const interfaceElement = document.getElementById(interfaceName);
        if (!interfaceElement) {
            console.error(`Element ${interfaceName} not found`);
            throw new Error(`Missing ${interfaceName} element`);
        }
        interfaceElement.style.display = 'block';
    } catch (error) {
        console.error('Error in setActiveInterface:', error);
        throw error;
    }
}

function updateBattleInterface(data) {
    try {
        console.log('updateBattleInterface called with data:', data);
        const playerHpElement = document.getElementById('player-combat-hp');
        if (!playerHpElement) {
            console.error('Element player-combat-hp not found');
            throw new Error('Missing player-combat-hp element');
        }
        playerHpElement.innerText = `${data.hp}/${data.maxHp}`;
        const enemyData = data.eventData ? data.eventData.enemy : {};
        const enemyHpElement = document.getElementById('enemy-combat-hp');
        if (!enemyHpElement) {
            console.error('Element enemy-combat-hp not found');
            throw new Error('Missing enemy-combat-hp element');
        }
        enemyHpElement.innerText = `${enemyData.hp || 0}/${enemyData.maxHp || 0}`;
        const enemyNameElement = document.getElementById('enemy-combat-name');
        if (!enemyNameElement) {
            console.error('Element enemy-combat-name not found');
            throw new Error('Missing enemy-combat-name element');
        }
        enemyNameElement.innerText = enemyData.name || 'Неизвестный враг';
    } catch (error) {
        console.error('Error in updateBattleInterface:', error);
        throw error;
    }
}

function handleExplorationError(error) {
    console.error('Ошибка:', error);
    const actionsDiv = document.getElementById('actions');
    if (!actionsDiv) {
        console.error('Element actions not found');
        return;
    }
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
    if (!logDiv) {
        console.error('Element exploration-log not found');
        return;
    }
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, starting initialization');
    initializeGame();
    preloadImages();
});