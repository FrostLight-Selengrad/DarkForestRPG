// exploration.js - Управление исследованием

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

function showActions(actions) {
    console.log("Actions to show:", actions);
    try {
        actions.forEach(action => {
            const actionElement = document.getElementById(`action-${action}`);
            if (!actionElement) {
                console.error(`Element action-${action} not found`);
            } else {
                actionElement.style.display = 'block';
            }
        });
    } catch (error) {
        console.error('Error in showActions:', error);
        throw error;
    }
}

function explorationActionsUpdate(event) {
    try {
        hideAllActions();
        switch (event) {
            case 'cash_event':
                showActions(['open-cash', 'continue']);
                break;
            case 'hidden_cash_event':
                showActions(['open-cash', 'continue']);
                break;
            case 'trap_event':
                showActions(['escape-trap']);
                break;
            case 'monster_eyes_event':
            case 'monster_hidden_event':
                showActions(['fight', 'flee']);
                break;
            case 'abandoned_camp':
                showActions(['rest-camp', 'continue']);
                break;
            case 'boss_event':
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

function explorationImageUpdate(event){
    const image = document.getElementById('forest-image');
    switch (event) {
        case 'monster_hidden_event':
            image.src = `/images/monster_hidden.jpg`;
            break;
        case 'monster_eyes_event':
            image.src = `/images/monster_eyes.jpg`;
            break;
        case 'cash_event':
            image.src = `/images/event_cash.jpg`;
            break;
        case 'open_cash_event':
            image.src = `/images/event_open_cash.jpg`;
            break;
        case 'hidden_cash_event':
            image.src = `/images/event_hidden_cash.jpg`;
            break;
        case 'open_hidden_cash_event':
            image.src = `/images/event_open_hidden_cash.jpg`;
            break;
        case 'trap_event':
            image.src = `/images/event_trap.png`;
            break;
        case 'trap_missed_event':
            image.src = `/images/event_trap_escaped.png`;
            break;
        case 'abandoned_camp':
            image.src = `/images/event_cave.png`;
            break;
        case 'boss_event':
            image.src = `/images/boss.png`;
            break;
        default:
            image.src = `/images/forest_v1.png`;
            break;
    }
}

function explorationInitialize(data) {
    try {
        explorationStatsUpdate(data.hp, data.maxHp, data.stamina, data.maxStamina, data.forestLevel, data.gold);
        explorationActionsUpdate(data.currentEventType);
        explorationImageUpdate(data.currentEventType);
        const logElement = document.getElementById('exploration-log');
        if (!logElement) {
            console.error('Element exploration-log not found');
            throw new Error('Missing exploration-log element');
        }const log = data.explorationLog;
        if (Array.isArray(log) && log.length > 0) {
            logElement.innerHTML = `<p>${log[log.length - 1]}</p>`;
        } else {
            logElement.innerHTML = `<p>Добро пожаловать в Dark Forest!</p><br/>
                                    <p>На текущий момент вам доступно исследование леса</p>
            `;
        }
    } catch (error) {
        console.error('Error in explorationInitialize:', error);
        throw error;
    }
}

window.explorationInitialize = explorationInitialize;

//////////////////////////////////////////////
/////////////Выше методы инициализации////////
//////////////////////////////////////////////
/////////////Ниже методы исследования/////////
//////////////////////////////////////////////

function startProgressBar(travelTime) {
    return new Promise((resolve) => {
        const progressContainer = document.getElementById('exploration-progress');
        if (!progressContainer) {
            console.error('Element exploration-progress not found');
            resolve();
            return;
        }
        progressContainer.style.display = 'block';
        const progressFill = document.querySelector('#exploration-progress .progress-fill');
        let startTime = Date.now();

        const animationFrame = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / travelTime, 1);
            progressFill.style.width = `${progress * 100}%`;
            if (progress < 1) {
                requestAnimationFrame(animationFrame);
            } else {
                progressContainer.style.display = 'none';
                resolve();
            }
        };
        requestAnimationFrame(animationFrame);
    });
}

window.startProgressBar = startProgressBar;
console.log('exploration.js loaded, startProgressBar defined');

async function exploreProgress(){
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    // Запрашиваем длительность отображению прогресс-бара
    const eventType = "explore";
    const progressTimeResponse = await fetch(`/api/game/progress-time?userId=${userId}&eventType=${eventType}`);
    if (!progressTimeResponse.ok) {
        throw new Error('Failed to fetch progress time');
    }
    const travelTime = parseInt(await progressTimeResponse.text(), 10);
    console.log('Travel time:', travelTime);

    // Устанавливаем интерфейс исследования с картинкой леса
    setActiveInterface("exploration-interface");

    // Отрабатывает прогресс-бар
    const progressBarText = document.getElementById('progress-text');
    progressBarText.innerHTML = '<p>Исследование леса...</p>'
    await startProgressBar(travelTime)

    // По завершению анимации запрашиваем данные по будущему событию и отображаем информацию
    const exploreDataResponse = await fetch(`/api/game/explore?userId=${userId}`);
    if (!exploreDataResponse.ok) throw new Error('Не удалось исследовать лес');
    const data = await exploreDataResponse.json();
    await explorationInitialize(data);
}

async function exploreForest() {
    try {
        // Скрываем кнопки во время исследования
        hideAllActions();

        // Вызываем работу прогресс-бара
        await exploreProgress();

    } catch (error) {
        console.error('Ошибка исследования:', error);
        document.getElementById('exploration-log').innerHTML =
            '<p>В процессе приключения возникла ошибка</p><br/><p>Пожалуйста, попробуйте позже</p>';
        showActions(['action-continue', 'action-return-camp']);
    }
}

async function returnToCamp() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const progressContainer = document.getElementById('return-camp-progress');
        progressContainer.style.display = 'block';
        hideAllActions();

        const response = await fetch(`/api/game/move?userId=${userId}&location=camp`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось вернуться в лагерь');
        const campData = await response.json();

        const progressBarText = document.getElementById('progress-text');
        progressBarText.innerHTML = '<p>Переход в чащу леса...</p>'
        await startProgressBar(2000);

        console.log('Calling setActiveInterface in returnToCamp');
        setActiveInterface("camp-interface");
    } catch (error) {
        console.error('Ошибка возвращения:', error);
        document.getElementById('exploration-log').innerText = 'Ошибка: попробуйте позже';
        progressContainer.style.display = 'none';
        showActions(['action-continue', 'action-return-camp']);
    }
}


function explorationStatsUpdate(hp, maxHp, stamina, maxStamina, forestLevel, gold) {
    try {
        const statsElement = document.getElementById('player-stats');
        if (!statsElement) {
            console.error('Element player-stats not found');
            throw new Error('Missing player-stats element');
        }
        statsElement.innerHTML = `
            <p>HP: ${hp}/${maxHp} | Уровень леса: ${forestLevel} | </p>
            <p>Золото: ${gold} | Выносливость: ${stamina}/${maxStamina}</p>
        `;
    } catch (error) {
        console.error('Error in updateStats:', error);
        throw error;
    }
}

async function fightMonster() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const response = await fetch(`/api/battle/start?userId=${userId}`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось начать бой');
        const battleData = await response.json();
        switchInterface('battle-interface');
        displayBattle(battleData);
    } catch (error) {
        console.error('Ошибка начала боя:', error);
        document.getElementById('exploration-log').innerText = 'Ошибка: попробуйте позже';
    }
}

async function tryFleeBeforeCombat() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const response = await fetch(`/api/game/flee?userId=${userId}`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось сбежать');
        const result = await response.json();
        document.getElementById('exploration-log').innerText = result.message;
        if (result.success) {
            showActions(['action-continue', 'action-return-camp']);
        } else {
            fightMonster(); // Если не удалось сбежать, бой начинается
        }
    } catch (error) {
        console.error('Ошибка при попытке сбежать:', error);
        document.getElementById('exploration-log').innerText = 'Ошибка: попробуйте позже';
    }
}

async function openCash() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const response = await fetch(`/api/game/openCash?userId=${userId}`);
        if (!response.ok)
            throw new Error('Не удалось открыть');
        const data = await response.json();
        const chestData = data.eventData;

        if (chestData.type === 'open_cash_event' || chestData.type === 'open_cash_hidden_event') {
            explorationInitialize(data);
        } else {
            throw new Error('Не удалось открыть');
        }
    } catch (error) {
        console.error('Ошибка при открытии:', error);
        document.getElementById('exploration-log').innerHTML = '<p>Ошибка: попробуйте позже</p>';
        showActions(['action-continue', 'action-return-camp']);
    }
}

async function restAtCamp() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const response = await fetch(`/api/game/restAtCamp?userId=${userId}`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось отдохнуть');
        const result = await response.json();
        const playerData = result.playerData;
        updateStats(playerData.currentLocation, playerData.hp, playerData.maxHp, playerData.stamina, playerData.maxStamina, playerData.forestLevel, playerData.gold);
        document.getElementById('exploration-log').innerText = 'Вы отдохнули и восстановили силы';
        showActions(['action-continue', 'action-return-camp']);
    } catch (error) {
        console.error('Ошибка при отдыхе:', error);
        document.getElementById('exploration-log').innerText = 'Ошибка: попробуйте позже';
        showActions(['action-continue', 'action-return-camp']);
    }
}

async function escapeTrap() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const response = await fetch(`/api/game/escapeTrap?userId=${userId}`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось выбраться из ловушки');
        const result = await response.json();
        if (result.success) {
            document.getElementById('exploration-log').innerText = 'Вы успешно выбрались из ловушки';
            showActions(['action-continue', 'action-return-camp']);
        } else {
            document.getElementById('exploration-log').innerText = 'Не удалось выбраться из ловушки';
            // Можно добавить штраф, например, уменьшение здоровья
            const playerResponse = await fetch(`/api/game/player?userId=${userId}`);
            if (!playerResponse.ok) throw new Error('Не удалось обновить данные игрока');
            const playerData = await playerResponse.json();
            updateStats(playerData.currentLocation, playerData.hp, playerData.maxHp, playerData.stamina, playerData.maxStamina, playerData.forestLevel, playerData.gold);
            showActions(['action-escape-trap']);
        }
    } catch (error) {
        console.error('Ошибка при попытке выбраться:', error);
        document.getElementById('exploration-log').innerText = 'Ошибка: попробуйте позже';
        showActions(['action-escape-trap']);
    }
}