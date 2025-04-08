function openPotionsModal() {
    fetch(`/api/game/player?userId=${userId}`)
        .then(response => response.json())
        .then(player => {
            const potions = Object.entries(player.inventory).filter(([key]) => key.includes("elixir"));
            if (potions.length === 0) {
                document.getElementById('battle-log').innerHTML += '<p class="log-entry">У вас нет эликсиров!</p>';
                return;
            }
            document.getElementById('potions-grid').innerHTML = potions.map(([type, count]) => `
                <div class="potion" onclick="usePotion('${type}')">
                    <img src="images/${type}.png" alt="${type}">
                    <span class="count">${count}</span>
                </div>
            `).join('');
            document.getElementById('potions-modal').style.display = 'block';
        })
        .catch(handleExplorationError);
}

function closePotionsModal() {
    document.getElementById('potions-modal').style.display = 'none';
}

function usePotion(potionType) {
    fetch(`/api/battle/use-potion?userId=${userId}&type=${potionType}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('battle-log').innerHTML += `<p class="log-entry">Вы применили эликсир: +${data.heal} HP</p>`;
                updateCombatHealth('heal');
            }
            closePotionsModal();
        })
        .catch(handleExplorationError);
}