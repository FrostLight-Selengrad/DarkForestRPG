package com.darkforest.telegramrpg.events;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class HiddenCacheEvent implements Event {
    private final Random random = new Random();

    @Override
    public int getWeight() {
        return 20;
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> playerData) {
        // Генерируем случайное количество золота
        int gold = 10 + random.nextInt(20);

        // Обновляем ресурсы игрока
        int currentGold = (int) playerData.getOrDefault("gold", 0);
        playerData.put("gold", currentGold + gold);

        // Формируем сообщение
        String message = "cache:cache.png:Вы нашли скрытый кэш и получили " + gold + " золота!";

        // Добавляем сообщение в исследовательский лог
        @SuppressWarnings("unchecked")
        List<String> explorationLog = (List<String>) playerData.getOrDefault("explorationLog", new ArrayList<>());
        explorationLog.add(message);
        playerData.put("explorationLog", explorationLog);

        // Сбрасываем тип события
        playerData.put("currentEventType", "none");

        // Возвращаем результат
        return Map.of(
                "message", message,
                "eventType", "none"
        );
    }
}