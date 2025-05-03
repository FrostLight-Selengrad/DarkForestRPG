package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.events.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class GameService {
    private final PlayerService playerService;
    private final CombatService combatService;
    private final Random random = new Random();

    @Autowired
    public GameService(PlayerService playerService, CombatService combatService) {
        this.playerService = playerService;
        this.combatService = combatService;
    }

    // Исследование леса
    public Map<String, Object> exploreForest(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        String currentEventType = (String) playerData.get("currentEventType");
        if ("combat".equals(currentEventType)) {
            return Map.of("message", "Вы не можете исследовать лес во время боя!");
        }
        Event selectedEvent = selectEvent(); // Метод выбора события
        Map<String, Object> eventResult = selectedEvent.execute(playerData);
        playerService.savePlayerData(userId, playerData);
        return eventResult;
    }

    // Открытие сундука
    public Map<String, Object> openChest(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        ChestEvent chestEvent = new ChestEvent();
        Map<String, Object> result = chestEvent.execute(playerData);
        playerService.savePlayerData(userId, playerData);
        return result;
    }

    // Сбор тайного схрона
    public Map<String, Object> collectCache(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        HiddenCacheEvent cacheEvent = new HiddenCacheEvent();
        Map<String, Object> result = cacheEvent.execute(playerData);
        playerService.savePlayerData(userId, playerData);
        return result;
    }

    // Вход в лес
    public Map<String, Object> enterForest(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        playerData.put("currentEventType", "none");
        playerData.put("currentLocation", "forest");
        playerService.savePlayerData(userId, playerData);
        return Map.of("success", true, "location", "forest");
    }

    // Возвращение в лагерь
    public Map<String, Object> returnToCamp(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        int stamina = (int) playerData.get("stamina");
        int time = 5 + (100 - stamina) / 5;
        String message = stamina > 80 ? "Герой бодро возвращается в лагерь" :
                stamina > 20 ? "Герой не спеша ковыляет в лагерь" :
                        "Герой из последних сил возвращается в лагерь. Это займет больше времени";
        playerData.put("currentEventType", "base_camp");
        playerService.savePlayerData(userId, playerData);
        return Map.of("message", message, "time", time);
    }

    // Отдых в лагере
    public Map<String, Object> restAtCamp(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        int maxStamina = (int) playerData.get("maxStamina");
        int stamina = (int) playerData.get("stamina");
        int maxHp = (int) playerData.get("maxHp");
        int hp = (int) playerData.get("hp");
        int staminaGain = maxStamina / 5;
        int healthGain = maxHp / 3;
        playerData.put("stamina", Math.min(maxStamina, stamina + staminaGain));
        playerData.put("hp", Math.min(maxHp, hp + healthGain));
        playerService.savePlayerData(userId, playerData);
        return Map.of("success", true, "stamina", playerData.get("stamina"), "hp", playerData.get("hp"));
    }

    // Побег из ловушки
    public Map<String, Object> handleTrapEscape(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        int trapAttempts = (int) playerData.getOrDefault("trapAttempts", 0);
        int trapEscapeChance = (int) playerData.getOrDefault("trapEscapeChance", 60);
        trapAttempts++;
        boolean success = random.nextInt(100) < trapEscapeChance;
        if (success) {
            playerData.put("currentEventType", "none");
            playerData.put("trapEscapeChance", 60);
            playerData.put("trapAttempts", 0);
            playerService.savePlayerData(userId, playerData);
            return Map.of("message", "Вы успешно выбрались из ловушки!");
        } else {
            int damage = 10;
            int hp = (int) playerData.get("hp");
            playerData.put("hp", hp - damage);
            playerData.put("trapEscapeChance", trapEscapeChance + 6);
            playerService.savePlayerData(userId, playerData);
            return Map.of("message", "Попытка не удалась! Получено " + damage + " урона. Новый шанс " + (trapEscapeChance + 6) + "%");
        }
    }

    // Упрощенный отдых
    public Map<String, Object> rest(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        String currentEventType = (String) playerData.get("currentEventType");
        if (!"base_camp".equals(currentEventType)) {
            return Map.of("success", false, "message", "Вы не в лагере!");
        }
        int stamina = (int) playerData.get("stamina");
        int maxStamina = (int) playerData.get("maxStamina");
        if (stamina < maxStamina) {
            playerData.put("stamina", stamina + 1);
        }
        playerService.savePlayerData(userId, playerData);
        return Map.of("success", true, "stamina", playerData.get("stamina"));
    }

    // Упрощенная логика выбора события (желательно вынести в EventService)
    private Event selectEvent() {
        // Заглушка; замените на логику EventService при наличии
        return new MonsterEvent(); // Пример события
    }
}