package com.darkforest.telegramrpg.events;

import java.util.Map;

public class SnakeTrapEvent implements Event {
    @Override
    public int getWeight(int luck) {
        int weight = 25;
        weight = Math.round(weight * (1 + (float) luck / (luck + 50)));
        return weight;
    }

    @Override
    public String getEventType() {
        return "snake_trap_event";
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> eventData) {
        String message = "Пока вы пробирались сквозь лес, вы не заметили, как оказались прямо перед змеёй, свисающей с ветки.";

        eventData.put("message", message);

        return eventData;
    }

    @Override
    public Map<String, Object> interact(int forestLevel, int luck, Map<String, Object> eventData) {
        return Map.of();
    }
}