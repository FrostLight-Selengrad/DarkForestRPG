package com.darkforest.telegramrpg.events;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class TrapEvent implements Event {
    private final Random random = new Random();

    @Override
    public int getWeight() {
        return 25;
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> playerData) {
        // Генерируем случайный урон
        int damage = 10 + random.nextInt(10);

        // Получаем текущее здоровье игрока
        int currentHp = (int) playerData.get("hp");

        // Наносим урон
        int newHp = Math.max(0, currentHp - damage);
        playerData.put("hp", newHp);

        // Формируем сообщение
        String message = "trap:trap.png:Вы попали в ловушку и потеряли " + damage + " здоровья!";

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