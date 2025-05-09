package com.darkforest.telegramrpg.events;

import java.util.Map;
import java.util.Random;

public class CashEvent implements Event {
    private final Random random = new Random();

    @Override
    public int getWeight(int luck) {
        int weight = 10;
        weight = Math.round(weight * (1 + (float) luck / (luck + 50)));
        return weight;
    }

    @Override
    public String getEventType() {
        return "cash_event";
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> eventData) {
        String message = "В процессе исследования вы находите оставленный разбойниками кошель - редкая удача!" +
                " Вероятно кто-то выронил его, убегая от преследователей.\nМожно осмотреть его содержимое.";
        eventData.put("message", message);

        return eventData;
    }

    public Map<String, Object> openCash(Map<String, Object> eventData, int forestLevel) {
        int gold = Math.round(5 * forestLevel * (1 + random.nextInt(21) * 0.01f));
        String message =  "В кошельке нашлось {$gold} золота. Вы распорядитесь ими лучше, чем бывший владелец.";

        eventData.put("gold", gold);
        eventData.put("message", message);

        return eventData;
    }
}