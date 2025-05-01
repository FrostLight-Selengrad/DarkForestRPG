function leaveCamp() {
    fetch(`/api/game/leave-camp?userId=${userId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateStats(data.location, data.hp, data.maxHp, data.stamina, data.maxStamina, data.forestLevel, data.gold);
                    updateActions(data.location); // Добавляем кнопки для леса
                    updateInterface(data.location); // Отобразить интерфейс леса
                } else {
                    alert("Не удалось выйти из лагеря, попробуйте еще раз!");
                    console.error('Ошибка при выходе из лагеря: ', data.error)
                }
            })
            .catch(error => console.error('Ошибка при выходе из лагеря: ', error));
}

function takeRest() {
    // Реализация отдыха в лагере
    console.log("Отдых в лагере...");
    alert('Отдых в лагере в доработке');
}

// camp.js
function returnToCamp() {

    fetch(`/api/game/return-to-camp?userId=${userId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    })
        .then(data => {
            // Показываем прогресс бар
            const progressContainer = document.getElementById('return-camp-progress');
            progressContainer.style.display = 'block';
            hideAllActions();

            const progressFill = document.querySelector('#return-camp-progress .progress-fill');

            let startTime = Date.now();
            const animationFrame = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / (data.time * 1000), 1);
                progressFill.style.width = `${progress * 100}%`;

                if (progress < 1) {
                    requestAnimationFrame(animationFrame);
                } else {
                    document.getElementById('return-camp-progress').style.display = 'none';
                    // Переключаем интерфейсы
                    setActiveInterface('camp');
                }
            };
            requestAnimationFrame(animationFrame);
        })
        .catch(error => {
            document.getElementById('return-camp-progress').style.display = 'none';
            });
}