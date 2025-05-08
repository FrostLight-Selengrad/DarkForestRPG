package com.darkforest.telegramrpg.events;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class ChestEvent implements Event {
    private final Random random = new Random();

    @Override
    public int getWeight() {
        return 30;
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> playerData) {
        // Определяем, является ли сундук мимиком (вероятность 20%)
        boolean isMimic = random.nextDouble() < 0.2;
        Map<String, Object> chestData = new HashMap<>();
        chestData.put("isMimic", isMimic);

        // Если это не мимик, добавляем золото на основе уровня леса
        if (!isMimic) {
            int forestLevel = (int) playerData.get("forestLevel"); // Извлекаем уровень леса из мапы
            int gold = 5 * forestLevel + random.nextInt(10);
            chestData.put("gold", gold);
        }

        // Сохраняем тип события и данные сундука в playerData
        playerData.put("currentEventType", "chest");
        playerData.put("chestData", chestData);

        // Формируем сообщение и обновляем лог
        String message = "chest:event_chest.png:Вы нашли сундук!";
        @SuppressWarnings("unchecked")
        List<String> explorationLog = (List<String>) playerData.get("explorationLog"); // Извлекаем лог
        explorationLog.add(message); // Добавляем сообщение в лог

        // Возвращаем результат события
        return Map.of("message", "Вы нашли сундук!");
    }

    public Map<String, Object> openChest(Map<String, Object> player) {
        if (!"chest".equals(player.get("currentEventType"))) {
            return Map.of("message", "Сундук не найден!");
        }
        Map<String, Object> eventData = (Map<String, Object>) player.get("EventData");
        Map<String, Object> chestData = (Map<String, Object>) eventData.get("chestData");
        boolean isMimic = (boolean) chestData.get("isMimic");
        /*if (isMimic) {
            player.setCurrentEventType("combat");
            Map<String, Object> enemyData = new HashMap<>();
            enemyData.put("name", "Мимик");
            enemyData.put("hp", 70);
            enemyData.put("maxHp", 70);
            enemyData.put("attack", 20);
            player.addEventData("enemy", enemyData);
            String message = "monster:mimic.png:Сундук оказался Мимиком!";
            player.addToExplorationLog(message);
            return Map.of(
                    "message", message,
                    "eventType", "combat"
            );
        } else {
            int gold = (int) chestData.get("gold");
            player.setGold(player.getGold() + gold);
            player.setCurrentEventType("none");
            player.getEventData().clear();
            String message = "chest_open:chest_open.png:Вы открыли сундук и нашли " + gold + " золота!";
            player.addToExplorationLog(message);
            return Map.of(
                    "message", message,
                    "eventType", "none"
            );*/
        return eventData;
    }
}