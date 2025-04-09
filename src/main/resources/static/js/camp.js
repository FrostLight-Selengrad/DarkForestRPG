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
    const explorationInterface = document.getElementById('exploration-interface');
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.innerHTML = `
        <p>Возвращение в лагерь...</p>
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
    `;
    explorationInterface.appendChild(progressContainer);

    fetch(`/api/game/return-to-camp?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            const travelTime = data.time * 1000;
            let startTime = Date.now();
            const animationFrame = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / travelTime, 1);
                document.querySelector('.progress-fill').style.width = `${progress * 100}%`;
                if (progress < 1) {
                    requestAnimationFrame(animationFrame);
                } else {
                    explorationInterface.removeChild(progressContainer);
                    document.getElementById('exploration-interface').style.display = 'none';
                    document.getElementById('camp-interface').style.display = 'block';
                    document.getElementById('camp-log').innerHTML = `<p>${data.message}</p>`;
                    updateActions('camp');
                }
            };
            requestAnimationFrame(animationFrame);
        })
        .catch(error => {
            console.error('Ошибка при возвращении в лагерь:', error);
            if (progressContainer) explorationInterface.removeChild(progressContainer);
            logExplorationEvent("Ошибка при возвращении в лагерь!");
        });
}