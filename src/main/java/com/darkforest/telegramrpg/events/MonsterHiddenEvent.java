package com.darkforest.telegramrpg.events;

import java.util.Map;

public class MonsterHiddenEvent implements Event {
    @Override
    public int getWeight(int luck) {
        int weight = 40;
        weight = Math.round(weight * (1 + (float) luck / (luck + 50)));
        return weight;
    }

    @Override
    public String getEventType() {
        return "monster_hidden_event";
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> eventData) {
        // Логика события
        eventData.put("message", "В тени леса промелькнула чья-то тень, это точно не наш союзник");
        return eventData;
    }
}