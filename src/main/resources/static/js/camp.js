function leaveCamp() {
    fetch(`/api/game/leave-camp?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log(data.message); // Логируем для отладки
                // Скрываем интерфейс лагеря
                document.getElementById('camp-interface').style.display = 'none';
                // Показываем интерфейс леса
                document.getElementById('exploration-interface').style.display = 'block';
                // Обновляем кнопки для леса
                updateActions('forest');
            }
        })
        .catch(error => console.error('Ошибка при выходе из лагеря:', error));
}

function updateActions(location) {
    const actionsDiv = document.getElementById('actions');
    actionsDiv.innerHTML = ''; // Очищаем текущие кнопки
    if (location === 'forest') {
        actionsDiv.innerHTML = `
            <button onclick="exploreForest()" class="action-btn">Продолжить</button>
            <button onclick="returnToCamp()" class="action-btn">Вернуться в лагерь</button>
        `;
    } else if (location === 'camp') {
        actionsDiv.innerHTML = `
            <button onclick="leaveCamp()" class="action-btn">Выйти из лагеря</button>
        `;
    }
}

function takeRest() {
    // Реализация отдыха в лагере
    console.log("Отдых в лагере...");
    alert('Отдых в лагере в доработке');
}