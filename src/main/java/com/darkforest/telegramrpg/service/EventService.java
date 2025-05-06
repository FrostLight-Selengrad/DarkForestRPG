package com.darkforest.telegramrpg.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class EventService {

    private final Random random = new Random();

    // Генерация случайного события
    public Map<String, Object> generateEvent() {
        Map<String, Object> eventData = new HashMap<>();
        String[] eventTypes = {"monster", "chest", "trap", "boss"};
        String eventType = eventTypes[random.nextInt(eventTypes.length)];
        eventData.put("type", eventType);
        if (eventType.equals("monster")) {
            eventData.put("monsterType", "goblin");
            eventData.put("message", "Вы встретили гоблина!");
        } else if (eventType.equals("chest")) {
            eventData.put("message", "Вы нашли сундук!");
        } else if (eventType.equals("trap")) {
            eventData.put("message", "Вы попали в ловушку!");
        } else {
            eventData.put("message", "Вы встретили босса!");
        }
        return eventData;
    }

    public long generateProgressTime(int stamina, int maxStamina, int speed, int agility, int forestLevel) {
        double S_base = 1200.0;
        int random_component = random.nextInt(101); // 0 to 100
        double multiplier = 1 + 0.6 * (forestLevel - 1);
        double S_adjusted = S_base * multiplier + random_component;
        double total_speed = speed * (1 + (double)agility / (agility + 10));
        double final_speed = total_speed * ((double)stamina / maxStamina);
        double time_seconds = S_adjusted / final_speed;
        return (long)(time_seconds * 1000);
    }
}