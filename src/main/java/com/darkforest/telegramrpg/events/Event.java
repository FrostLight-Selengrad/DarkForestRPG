package com.darkforest.telegramrpg.events;

import java.util.Map;

public interface Event {
    int getWeight(int luck); // Вес с учетом удачи
    String getEventType();   // Тип события (например, "cash_event")
    Map<String, Object> execute(Map<String, Object> eventData);
    Map<String, Object> interact(int forestLevel, int luck, Map<String, Object> eventData);
}
