package com.darkforest.telegramrpg.events;

import java.util.Map;

public class MonsterEyesEvent implements Event {
    @Override
    public int getWeight(int luck) {
        int weight = 40;
        weight = Math.round(weight * (1 + (float) luck / (luck + 50)));
        return weight;
    }

    @Override
    public String getEventType() {
        return "monster_eyes_event";
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> eventData) {
        // Логика события
        eventData.put("message", "Пробираясь сквозь лес вы заметили чью-то фигуру." +
                " Похоже незамеченным вам уже не уйти.");
        return eventData;
    }
}