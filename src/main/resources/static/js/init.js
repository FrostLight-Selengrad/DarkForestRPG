const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userId = tg.initDataUnsafe.user.id;
if (!userId) {
    logExplorationEvent("Ошибка: пользователь не авторизован");
}

function preloadImages() {
    const images = ['forest.png', 'forest_v1.png', 'forest_v2.png', 'goblin.png',
        'mimic.png', 'boss.png', 'event_chest.png', 'event_camp.jpg', 'character-icon.png',
        'backpack-icon.png', 'talents-icon.png', 'skills-icon.png', 'char-icon.png'];
    const promises = images.map(img => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = `images/${img}`;
            image.onload = resolve;
            image.onerror = reject;
        });
    });
    return Promise.all(promises);
}

async function initializeGame() {
    try {
        console.log('Starting initializeGame for userId:', userId);
        const response = await fetch(`/api/game/player?userId=${userId}`);
        console.log('Initialize response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Initialize error response:', errorText);
        }

        const data = await response.json();
        if (!data.currentLocation) {
            console.error('Missing currentLocation in player data');
        }
        if (data.currentEventType === "combat") {
            console.log('Switching to battle interface');
            updateBattleInterface(data);
            console.log('Calling setActiveInterface');
            setActiveInterface("battle-interface");
        } else if (data.currentLocation === "forest") {
            console.log('Switching to exploration interface');
            explorationInitialize(data);
            console.log('Calling setActiveInterface');
            setActiveInterface("exploration-interface");
        } else if (data.currentLocation === "base_camp") {
            console.log('Switching to camp interface');
            console.log('campInitialize called with data:', data);
            campInitialize(data);
            console.log('Calling setActiveInterface');
            setActiveInterface("camp-interface");
        } else {
            console.error('Unknown location:', data.currentLocation);
        }
    } catch (error) {
        console.error('Initialization error:', error);
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
        // Обновление данных игрока
        document.getElementById('player-combat-name').innerText = data.player.name;
        document.getElementById('player-combat-hp').innerText = `❤️ ${data.player.hp}/${data.player.maxHp}`;
        document.getElementById('player-combat-attack').innerText = `⚔️ ${data.player.attack}`;
        document.getElementById('player-combat-defence').innerText = `🛡️ ${data.player.defense}`;
        document.getElementById('player-combat-speed').innerText = `🏃 ${data.player.speed}`;

        // Обновление данных врага
        document.getElementById('enemy-combat-name').innerText = data.enemy.name;
        document.getElementById('enemy-combat-hp').innerText = `❤️ ${data.enemy.hp}/${data.enemy.maxHp}`;
        document.getElementById('enemy-combat-attack').innerText = `⚔️ ${data.enemy.attack}`;
        document.getElementById('enemy-combat-defence').innerText = `🛡️ ${data.enemy.defense}`;
        document.getElementById('enemy-combat-speed').innerText = `🏃 ${data.enemy.speed}`;

        // Установка имени и уровня врага, если элементы существуют
        const enemyNameElement = document.getElementById('enemy-combat-name');
        if (enemyNameElement) {
            enemyNameElement.innerText = data.enemy.name + ` Ур. ${data.enemy.level}`;
        }

        // Установка изображения врага
        document.getElementById('enemy-image').src = `/images/${data.enemy.image || 'default_enemy.png'}`;

        // Обновление лога боя с сообщением от сервера
        document.getElementById('battle-log').innerText = data.enemy.message;
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



// Инициализация
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM fully loaded, starting initialization');
    try {
        const minLoadingTime = 3500; // 3.5 секунды
        const imagePreload = preloadImages();
        const delay = new Promise(resolve => setTimeout(resolve, minLoadingTime));
        await Promise.all([imagePreload, delay]);
        const loadingScreen = document.getElementById('loading-screen');
        console.log('Images preloaded and minimum time elapsed');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        const initialize = initializeGame();
    } catch (error) {
        console.error('Error during initialization:', error);
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        initializeGame();
    }
});