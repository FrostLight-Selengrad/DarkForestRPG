package com.darkforest.telegramrpg.events;

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
}