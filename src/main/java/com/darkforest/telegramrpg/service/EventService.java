package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.events.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class EventService {

    private final Random random = new Random();

    // Генерация случайного события
    public Map<String, Object> generateEvent(int luck) {
        Map<String, Object> eventData = new HashMap<>();

        // Собираем все события с их весами
        List<Event> events = List.of(
                new MonsterHiddenEvent(),
                new HiddenCachEvent(),
                new CashEvent(),
                new SnakeTrapEvent(),
                new BossEvent()
        );

        // Рассчитываем суммарный вес
        int totalWeight = events.stream()
                .mapToInt(event -> event.getWeight(luck))
                .sum();

        // Выбираем случайное число в диапазоне [0, totalWeight)
        int randomValue = random.nextInt(totalWeight);
        int cumulativeWeight = 0;

        // Находим событие, соответствующее randomValue
        Event selectedEvent = null;
        for (Event event : events) {
            cumulativeWeight += event.getWeight(luck);
            if (randomValue < cumulativeWeight) {
                selectedEvent = event;
                break;
            }
        }

        // Обрабатываем выбранное событие
        if (selectedEvent != null) {
            eventData = selectedEvent.execute(eventData);
            eventData.put("type", selectedEvent.getEventType());
        } else {
            eventData.put("type", "none");
            eventData.put("message", "Ничего не произошло.");
        }

        return eventData;
    }

    public Map<String, Object> interactEvent(int luck, int forestLevel, Map<String, Object> eventData) {
        String eventType = (String) eventData.get("type");

        // Сопоставление типов событий с классами
        Map<String, Event> eventMap = Map.of(
                "monster_hidden_event", new MonsterHiddenEvent(),
                "monster_eyes_event", new MonsterEyesEvent(),
                "hidden_cash_event", new HiddenCachEvent(),
                "cash_event", new CashEvent(),
                "snake_trap_event", new SnakeTrapEvent(),
                "boss_event", new BossEvent()
        );

        Event event = eventMap.get(eventType);
        if (event != null) {
            return event.interact(forestLevel, luck, eventData);
        } else {
            eventData.put("message", "Неизвестное событие: " + eventType);
            return eventData;
        }
    }

    public long generateProgressTime(int stamina, int maxStamina, int speed, int agility, int forestLevel) {
        double S_base = 450.0; // Значение для тестов, потом вернуть 1200
        int random_component = random.nextInt(101); // 0 to 100
        double multiplier = 1 + 0.6 * (forestLevel - 1);
        double S_adjusted = S_base * multiplier + random_component;
        double total_speed = speed * (1 + (double)agility / (agility + 10));
        double final_speed = total_speed * ((double)stamina / maxStamina);
        double time_seconds = S_adjusted / final_speed;
        return (long)(time_seconds * 1000);
    }
}