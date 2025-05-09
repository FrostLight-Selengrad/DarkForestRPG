package com.darkforest.telegramrpg.events;

import java.util.HashMap;
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

    @Override
    public Map<String, Object> interact(int forestLevel, int luck, Map<String, Object> eventData) {
        int gold = Math.round(15 * forestLevel * (1 + random.nextInt(21) * 0.01f));
        String message =  "Внутри вы обнаружили " + gold + " золота. Вы распорядитесь ими лучше, чем бывший владелец.";

        int luckChance = Math.round((float) (100 * luck) / (luck + 100));
        if (luckChance > random.nextInt(1001) ){
            gold += gold * (1+luckChance / 100);
            message = "Невероятная удача! Кошель был забит " + gold + " единиц золота!";
        }

        eventData.put("type", "open_cash_event");
        eventData.put("gold", gold);
        eventData.put("message", message);

        return eventData;
    }
}