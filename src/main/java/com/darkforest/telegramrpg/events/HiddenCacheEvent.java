package com.darkforest.telegramrpg.events;

import com.darkforest.telegramrpg.model.Player;

public class HiddenCacheEvent implements Event {
    @Override
    public int getWeight() {
        return 15;
    }

    @Override
    public String execute(Player player) {
        player.setCurrentEventType("hidden_cache");
        int reward = 100; // или случайное значение
        player.addEventData("reward", reward);
        String message = "hidden:cache.png:Вы нашли тайник с ценностями!";
        player.addToExplorationLog(message);
        return message;
    }

    public String collectCache(Player player) {
        if (!"hidden_cache".equals(player.getCurrentEventType())) {
            return "Тайник не найден!";
        }
        int reward = (int) player.getEventDataValue("reward");
        player.addGold(reward);
        player.setCurrentEventType("none");
        player.getEventData().clear();
        String message = "hidden:cache.png:Вы собрали ценности из тайника и получили " + reward + " золота!";
        player.addToExplorationLog(message);
        return message;
    }
}