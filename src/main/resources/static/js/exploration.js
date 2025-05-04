// exploration.js - Управление исследованием

async function displayExploration(locationData) {
    document.getElementById('forest-image').src = `/images/${locationData.image || 'forest_v2.png'}`;
    document.getElementById('exploration-log').innerText = locationData.message || 'Вы в лесу';
    showActions(['action-continue', 'action-return-camp']); // Показываем базовые кнопки
}

async function exploreForest() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        // Показываем прогресс-бар
        const progressContainer = document.getElementById('exploration-progress');
        progressContainer.style.display = 'block';
        hideActions(); // Скрываем кнопки во время прогресса

        const response = await fetch(`/api/game/explore?userId=${userId}`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось исследовать лес');
        const eventData = await response.json();

        // Анимация прогресс-бара (зависит от выносливости)
        const duration = (100 - eventData.stamina) * 100; // Чем меньше выносливость, тем дольше (мс)
        animateProgressBar(duration, async () => {
            progressContainer.style.display = 'none';
            await handleEvent(eventData);
        });
    } catch (error) {
        console.error('Ошибка исследования:', error);
        document.getElementById('exploration-log').innerText = 'Ошибка: попробуйте позже';
        progressContainer.style.display = 'none';
        showActions(['action-continue', 'action-return-camp']);
    }
}

async function returnToCamp() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const progressContainer = document.getElementById('return-camp-progress');
        progressContainer.style.display = 'block';
        hideActions();

        const response = await fetch(`/api/game/move?userId=${userId}&location=camp`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось вернуться в лагерь');
        const campData = await response.json();

        animateProgressBar(2000, () => {
            progressContainer.style.display = 'none';
            switchInterface('camp-interface');
            displayCampStats(campData);
        });
    } catch (error) {
        console.error('Ошибка возвращения:', error);
        document.getElementById('exploration-log').innerText = 'Ошибка: попробуйте позже';
        progressContainer.style.display = 'none';
        showActions(['action-continue', 'action-return-camp']);
    }
}

async function handleEvent(eventData) {
    document.getElementById('exploration-log').innerText = eventData.message;
    switch (eventData.type) {
        case 'monster':
            showActions(['action-fight', 'action-flee']);
            break;
        case 'chest':
            showActions(['action-open-chest']);
            break;
        case 'trap':
            showActions(['action-escape-trap']);
            break;
        default:
            showActions(['action-continue', 'action-return-camp']);
    }
}

function animateProgressBar(duration, callback) {
    const progressFill = document.querySelector('.progress-fill');
    progressFill.style.width = '0%';
    progressFill.style.transition = `width ${duration}ms linear`;
    setTimeout(() => {
        progressFill.style.width = '100%';
        setTimeout(callback, duration);
    }, 10);
}

function forestInitialize(data) {
    try {
        console.log('forestInitialize called with data:', data);
        updateStats(data.currentLocation, data.hp, data.maxHp, data.stamina, data.maxStamina, data.forestLevel, data.gold);
        setActiveInterface('exploration-interface');
        updateActions(data.currentLocation);
        const logElement = document.getElementById('exploration-log');
        if (!logElement) {
            console.error('Element exploration-log not found');
            throw new Error('Missing exploration-log element');
        }
        logElement.innerHTML = data.message || 'Вы в лесу';
    } catch (error) {
        console.error('Error in forestInitialize:', error);
        throw error;
    }
}

function showActions(actions) {
    console.log("Actions to show:", actions);
    try {
        actions.forEach(action => {
            console.log("Another action to show:", action);
            const actionElement = document.getElementById(`action-${action}`);
            if (!actionElement) {
                console.error(`Element action-${action} not found`);
            } else {
                console.log(`Element action-${action} was founded`);
                actionElement.style.display = 'block';
            }
        });
    } catch (error) {
        console.error('Error in showActions:', error);
        throw error;
    }
}

function hideActions() {
    document.querySelectorAll('#actions button').forEach(btn => btn.style.display = 'none');
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

async function openChest() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    try {
        const response = await fetch(`/api/game/openChest?userId=${userId}`, { method: 'POST' });
        if (!response.ok) throw new Error('Не удалось открыть сундук');
        const result = await response.json();
        const chestData = result.chestData;

        if (chestData.isMimic) {
            // Начать бой с мимиком
            const enemyData = chestData.enemyData;
            switchInterface('battle-interface');
            displayBattle({ enemy: enemyData });
        } else {
            const gold = chestData.gold;
            document.getElementById('forest-image').src = '/images/open-chest.png';
            document.getElementById('exploration-log').innerText = `Вы нашли ${gold} золота!`;
            // Обновить статистику игрока
            const playerResponse = await fetch(`/api/game/player?userId=${userId}`);
            if (!playerResponse.ok) throw new Error('Не удалось обновить данные игрока');
            const playerData = await playerResponse.json();
            updateStats(playerData.currentLocation, playerData.hp, playerData.maxHp, playerData.stamina, playerData.maxStamina, playerData.forestLevel, playerData.gold);
            showActions(['action-continue', 'action-return-camp']);
        }
    } catch (error) {
        console.error('Ошибка при открытии сундука:', error);
        document.getElementById('exploration-log').innerText = 'Ошибка: попробуйте позже';
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