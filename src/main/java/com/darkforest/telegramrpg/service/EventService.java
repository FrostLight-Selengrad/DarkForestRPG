package com.darkforest.telegramrpg.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class EventService {

    private final Random random = new Random();

    // Генерация случайного события
    public Map<String, Object> generateEvent(Long userId, String location) {
        Map<String, Object> eventData = new HashMap<>();
        String[] eventTypes = {"monster", "chest", "trap", "none"};
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
            eventData.put("message", "Ничего не произошло.");
        }
        return eventData;
    }
}