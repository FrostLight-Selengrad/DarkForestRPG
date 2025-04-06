function leaveCamp() {
    fetch(`/api/game/leave-camp?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateStats();
                const logDiv = document.getElementById('exploration-log');
                logDiv.innerHTML = '<p>Вы покинули лагерь и отправились в лес.</p>';

                document.getElementById('exploration-interface').style.display = 'block';
                document.getElementById('battle-interface').style.display = 'none';
                document.getElementById('camp-interface').style.display = 'none';
            } else {
                alert("Не удалось выйти из лагеря!");
            }
        })
        .catch(error => console.error('Ошибка при выходе из лагеря:', error));
}

function takeRest() {
    // Реализация отдыха в лагере (добавьте, если нужно)
    console.log("Отдых в лагере...");
}