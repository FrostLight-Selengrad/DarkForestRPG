package com.darkforest.telegramrpg.events;

import java.util.Map;

public class MonsterHiddenEvent implements Event {
    @Override
    public int getWeight(int luck) {
        int weight = 30;
        weight = Math.round(weight * (1 + (float) luck / (luck + 50)));
        return weight;
    }

    @Override
    public String getEventType() {
        return "monster_hidden_event";
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> eventData) {
        eventData.put("message", "В тени леса промелькнула чья-то тень, это точно не наш союзник");
        return eventData;
    }

    @Override
    public Map<String, Object> interact(int forestLevel, int luck, Map<String, Object> eventData) {
        return Map.of();
    }
}