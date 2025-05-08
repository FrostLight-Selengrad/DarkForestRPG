package com.darkforest.telegramrpg.events;

import java.util.*;

public class BossEvent implements Event {
    private final Random random = new Random();

    @Override
    public int getWeight() {
        return 3;
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> playerData) {
        // Устанавливаем тип события на "combat"
        playerData.put("currentEventType", "combat");

        // Создаем данные о боссе
        Map<String, Object> enemyData = new HashMap<>();
        enemyData.put("name", "Хранитель прохода");
        enemyData.put("hp", 100);
        enemyData.put("maxHp", 100);
        enemyData.put("attack", 25);
        enemyData.put("initiative", 15);

        // Сохраняем данные о противнике в eventData
        @SuppressWarnings("unchecked")
        Map<String, Object> eventData = (Map<String, Object>) playerData.getOrDefault("eventData", new HashMap<>());
        eventData.put("enemy", enemyData);
        playerData.put("eventData", eventData);

        // Очищаем боевой лог
        @SuppressWarnings("unchecked")
        List<String> battleLog = (List<String>) playerData.getOrDefault("battleLog", new ArrayList<>());
        battleLog.clear();
        playerData.put("battleLog", battleLog);

        // Устанавливаем номер хода
        playerData.put("battleTurn", 1);

        // Формируем сообщение
        String message = "boss:boss.png:Хранитель прохода преградил вам путь! Он полон решимости не пустить героя дальше и уже готов к битве";

        // Добавляем в боевой и исследовательский логи
        battleLog.add("Хранитель прохода преградил вам путь! Он полон решимости не пустить героя дальше и уже готов к битве");
        @SuppressWarnings("unchecked")
        List<String> explorationLog = (List<String>) playerData.getOrDefault("explorationLog", new ArrayList<>());
        explorationLog.add(message);
        playerData.put("explorationLog", explorationLog);

        // Возвращаем результат
        return Map.of(
                "message", message,
                "eventType", "combat"
        );
    }
}