package com.darkforest.telegramrpg.events;

import com.darkforest.telegramrpg.model.Player;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class MonsterEvent implements Event {
    private final Random random = new Random();

    @Override
    public int getWeight() {
        return 40;
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> playerData) {
        // Устанавливаем тип события как бой
        playerData.put("currentEventType", "combat");

        // Создаем данные монстра
        Map<String, Object> enemyData = new HashMap<>();
        enemyData.put("name", "Гоблин");
        enemyData.put("hp", 50);
        enemyData.put("attack", 10);
        playerData.put("enemyData", enemyData);

        // Добавляем сообщение в лог
        String message = "monster:goblin.png:Вы встретили гоблина!";
        @SuppressWarnings("unchecked")
        List<String> explorationLog = (List<String>) playerData.get("explorationLog");
        explorationLog.add(message);

        // Возвращаем результат
        return Map.of("message", "Вы встретили гоблина!");
    }
}