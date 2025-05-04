// camp.js - Управление лагерем
function campStatsUpdate(playerData) {
    const statsDiv = document.getElementById('player-camp-stats');
    statsDiv.innerHTML = `
        <p>Здоровье: ${playerData.health}/${playerData.maxHealth}</p>
        <p>Выносливость: ${playerData.stamina}/${playerData.maxStamina}</p>
    `;
}

function tCampStatsUpdate(hp,maxHp,stamina,maxStamina) {
    const statsDiv = document.getElementById('player-camp-stats');
    statsDiv.innerHTML = `
        <p>Здоровье: ${hp}/${maxHp}</p>
        <p>Выносливость: ${stamina}/${maxStamina}</p>
    `;
}

function campActionsUpdate(event){
    //ToDO for future camp invitation
}

function campImageUpdate(event){
    const image = document.getElementById('forest-image');
    switch (event) {
        case 'test':
            image.src = `/images/event_chest.png`
            break;
        default:
            image.src = `/images/event_camp.png`
            break;
    }
}

function campInitialize(data) {
    try{
        console.log('Calling tCampStatsUpdate');
        tCampStatsUpdate(data.hp, data.maxHp, data.stamina, data.maxStamina);
        console.log('Calling campImageUpdate');
        campImageUpdate(data.currentEventType);
        console.log('Try to update log');
        const logElement = document.getElementById('camp-log');
        if (!logElement) {
            console.error('Element camp-log not found');
            throw new Error('Missing camp-log element');
        }
        console.log('Updating camp-log');
        logElement.innerHTML = `<p>${data.message}</p>` || `<p>Вы успешно вернулись к игре и оказались в лагере разбойников</p>`
    } catch (error) {
        console.error('Error in campInitialize:', error);
    }
}
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////


function takeRest() {
    // Заглушка для отдыха
    document.getElementById('camp-log').innerText = 'Отдых пока не реализован';
}

// Переключение интерфейсов
function switchInterface(activeId) {
    document.getElementById('camp-interface').style.display = 'none';
    document.getElementById('exploration-interface').style.display = 'none';
    document.getElementById('battle-interface').style.display = 'none';
    document.getElementById(activeId).style.display = 'block';
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
        explorationInitialize(data);
    } catch (error) {
        console.error('Leave camp error:', error);
    }
}

// Загрузка лагеря при старте
console.log('camp.js loaded');