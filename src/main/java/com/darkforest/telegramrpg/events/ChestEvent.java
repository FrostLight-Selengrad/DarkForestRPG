package com.darkforest.telegramrpg.events;

import com.darkforest.telegramrpg.model.Player;

public class ChestEvent implements Event {
    @Override
    public int getWeight() {
        return 5;
    }

    @Override
    public String execute(Player player) {
        String message = "chest:event_chest.png:Вы нашли сундук!";
        player.addToExplorationLog(message);
        return message;
    }
}