package com.darkforest.telegramrpg.events;

import java.util.Map;

public class BossEvent implements Event {
    @Override
    public int getWeight(int luck) {
        return 0;
    }

    @Override
    public String getEventType() {
        return "boss_event";
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> eventData) {
        String message = "Опасный противник преградил вам путь! Он полон решимости" +
                " не пустить героя дальше и уже готов к битве.";

        eventData.put("message", message);

        return eventData;
    }

    @Override
    public Map<String, Object> interact(int forestLevel, int luck, Map<String, Object> eventData) {
        return Map.of();
    }
}