package com.darkforest.telegramrpg.events;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class HiddenCachEvent implements Event {
    private final Random random = new Random();

    @Override
    public int getWeight(int luck) {
        int weight = 10;
        weight = Math.round(weight * (1 + (float) luck / (luck + 50)));
        return weight;
    }

    @Override
    public String getEventType() {
        return "hidden_cash_event";
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> eventData) {
        String message = "В процессе исследования вы заметили подозрительное место. Здесь явно кто-то" +
                " пытался спрятать что-то ценное." +
                "\nМожно попробовать осмотреть содержимое тайника.";
        eventData.put("message", message);

        return eventData;
    }

    @Override
    public Map<String, Object> interact(int forestLevel, int luck, Map<String, Object> eventData) {
        int gold = Math.round(15 * forestLevel * (1 + random.nextInt(21) * 0.01f));
        String message =  "Похоже оно того стоило - вы достали из тайника " + gold + " золота.";

        int luckChance = Math.round((float) (100 * luck) / (luck + 100));
        if (luckChance > random.nextInt(1001) ){
            gold += gold * (1+luckChance / 100);
            message = "Невероятная удача - тайник был наполнен до краев и вы нашли там " + gold + " золота.";
        }

        eventData.put("type", "open_hidden_cash_event");
        eventData.put("gold", gold);
        eventData.put("message", message);

        return eventData;
    }
}