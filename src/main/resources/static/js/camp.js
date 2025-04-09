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

function takeRest() {
    // Реализация отдыха в лагере
    console.log("Отдых в лагере...");
    alert('Отдых в лагере в доработке');
}

function returnToCamp() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.innerHTML = `
        <p>Возвращение в лагерь...</p>
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
    `;
    document.getElementById('actions').replaceWith(progressContainer);

    fetch(`/api/game/return-to-camp?userId=${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            const travelTime = data.time * 1000; // Переводим секунды в миллисекунды
            let startTime = Date.now();
            const animationFrame = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / travelTime, 1);
                document.querySelector('.progress-fill').style.width = `${progress * 100}%`;
                if (progress < 1) {
                    requestAnimationFrame(animationFrame);
                } else {
                    progressContainer.remove();
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
            progressContainer.remove();
            logExplorationEvent("Ошибка при возвращении в лагерь!");
        });
}