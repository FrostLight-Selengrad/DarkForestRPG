package com.darkforest.telegramrpg.events;

import com.darkforest.telegramrpg.model.Player;

public class HiddenCacheEvent implements Event {
    @Override
    public int getWeight() {
        return 15;
    }

    @Override
    public String execute(Player player) {
        String message = "hidden:cache.png:Вы нашли тайник с ценностями!";
        player.addToExplorationLog(message);
        return message;
    }
}