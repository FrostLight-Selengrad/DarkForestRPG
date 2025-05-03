package com.darkforest.telegramrpg.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CombatService {
    private final PlayerService playerService;

    @Autowired
    public CombatService(PlayerService playerService) {
        this.playerService = playerService;
    }

    // Начало боя
    public Map<String, Object> startBattle(Long userId, String monsterType) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        Map<String, Object> enemyData = loadEnemyData(monsterType);
        playerData.put("currentEventType", "combat");
        playerData.put("eventData", Map.of("enemy", enemyData));
        playerService.savePlayerData(userId, playerData);
        return Map.of(
                "message", "Бой с " + enemyData.get("name") + " начался!",
                "enemyHp", enemyData.get("hp"),
                "playerHp", playerData.get("hp")
        );
    }

    // Обработка атаки
    public Map<String, Object> performAttack(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        String currentEventType = (String) playerData.get("currentEventType");
        if (!"combat".equals(currentEventType)) {
            return Map.of("message", "Вы не в бою!");
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> enemyData = (Map<String, Object>) ((Map<?, ?>) playerData.get("eventData")).get("enemy");
        int playerAttack = (int) playerData.get("physicalAttack");
        int enemyDefense = (int) enemyData.get("defense");
        int damageToEnemy = calculatePhysicalDamage(playerAttack, enemyDefense);
        int enemyHp = (int) enemyData.get("hp") - damageToEnemy;
        enemyData.put("hp", enemyHp);
        playerService.savePlayerData(userId, playerData);
        return Map.of(
                "message", "Вы нанесли " + damageToEnemy + " урона!",
                "enemyHp", enemyHp,
                "isOver", enemyHp <= 0
        );
    }

    // Обработка попытки побега
    public Map<String, Object> tryFlee(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        String currentEventType = (String) playerData.get("currentEventType");
        if (!"combat".equals(currentEventType)) {
            return Map.of("message", "Вы не в бою!");
        }
        boolean success = Math.random() < 0.5;
        if (success) {
            playerData.put("currentEventType", "none");
            ((Map<?, ?>) playerData.get("eventData")).remove("enemy");
            playerService.savePlayerData(userId, playerData);
            return Map.of("message", "Вы успешно сбежали!");
        } else {
            return Map.of("message", "Побег не удался!");
        }
    }

    // Расчет физического урона
    private int calculatePhysicalDamage(int attack, int defense) {
        double defenseReduction = defense / (defense + 50.0);
        int damage = (int) (attack * (1 - defenseReduction) - defense);
        return Math.max(1, damage);
    }

    // Загрузка данных монстра (пример)
    private Map<String, Object> loadEnemyData(String monsterType) {
        return Map.of(
                "name", monsterType,
                "hp", 100,
                "defense", 10,
                "attack", 20
        );
    }
}