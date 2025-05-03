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

function calculateTravelTime(stamina) {
    return 1000 + Math.floor((100 - stamina) / 4) * 500;
}

function startProgressBar(stamina, message){
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
            // Скрываем прогресс бар
            document.getElementById('exploration-progress').style.display = 'none';
            processExplorationResult(message);
        }
    };
    requestAnimationFrame(animationFrame);
}

async function initializeGame() {
    let response = await fetch(`/api/game/initialize?userId=${userId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    })
    let event = response.toLocaleString();
    switch (event) {
        case "combat":
            enterCombat();
            break;
        default:{
            fetch(`/api/game/leave-camp?userId=${userId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    forestInitialize(data);
                } else {
                    alert("Не удалось инициализировать игру, попробуйте еще раз!");
                    console.error('Ошибка при загрузке данных: ', data.error)
                }
            })
            .catch(error => console.error('Ошибка при загрузке данных: ', error));
        } break;
    }
}

function forestInitialize(data){
    with (data) {
        updateStats(currentLocation, hp, maxHp, stamina, maxStamina, forestLevel, gold);
        updateActions(currentLocation); // Добавляем кнопки для леса
        updateInterface(currentLocation); // Отобразить интерфейс леса
        document.getElementById('exploration-log').innerHTML = message;
    }
}

function updateStats(location, hp, maxHp, stamina, maxStamina, forestLevel, gold) {
    switch (location) {
        case "forest": document.getElementById('player-stats').innerHTML = `
            <p>HP: ${hp}/${maxHp} | Уровень леса: ${forestLevel} | </p>
            <p>Золото: ${gold} | Выносливость: ${stamina}/${maxStamina}</p>
            `;
            break;
        case "base_camp": document.getElementById('player-camp-stats').innerHTML = `
            <p>HP: ${hp}/${maxHp} | Выносливость: ${stamina}/${maxStamina}</p>
            <p>Золото: ${resources}</p>
        `;
            break;
        default:
            break;
    }
}

function hideAllActions() {
    const actions = document.getElementById('actions').children;
    for(let btn of actions) btn.style.display = 'none';
}

function showActions(actions) {
    actions.forEach(action => {
        document.getElementById(`action-${action}`).style.display = 'block';
    });
}

function updateActions(type) {
    // Скрываем все кнопки
    hideAllActions();

    // Отображаем только кнопки, подходящие под события
    switch(type) {
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
    for(let iface of interfaces) iface.style.display = 'none';
}

function updateInterface(location) {
    hideAllInterfaces();

    switch (location){
        case 'forest':{
            document.getElementById(`exploration-interface`).style.display = 'block';
        } break;
        case 'base_camp':{
            document.getElementById(`camp-interface`).style.display = 'block';
        } break;
        case 'battle':{
            document.getElementById(`battle-interface`).style.display = 'block';
        } break;
        default: {
            console.error("Смена интерфейсов не удалась")
        }
    }
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