function leaveCamp() {
    fetch(`/api/game/leave-camp?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateStats();
                const logDiv = document.getElementById('exploration-log');
                logDiv.innerHTML = '<p>Вы покинули лагерь и отправились в лес.</p>';
                document.getElementById('battle-interface').style.display = 'none';
                document.getElementById('camp-interface').style.display = 'none';
                document.getElementById('exploration-interface').style.display = 'block';
                updateActions('forest'); // Добавляем кнопки для леса
            } else {
                alert("Не удалось выйти из лагеря!");
            }
        })
        .catch(error => console.error('Ошибка при выходе из лагеря:', error));
}

function takeRest() {
    // Реализация отдыха в лагере
    console.log("Отдых в лагере...");
    alert('Отдых в лагере в доработке');
}

function returnToCamp() {
    // Показываем прогресс бар
    document.getElementById('return-camp-progress').style.display = 'block';

    fetch(`/api/game/return-to-camp?userId=${userId}`)
        .then(data => {
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