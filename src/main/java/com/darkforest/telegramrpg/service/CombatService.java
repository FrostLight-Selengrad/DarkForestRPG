package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.enemy.EnemyData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CombatService {
    private final PlayerService playerService;
    private final EnemyService enemyService;

    @Autowired
    public CombatService(PlayerService playerService, EnemyService enemyService) {
        this.playerService = playerService;
        this.enemyService = enemyService;
    }

    public static Map<String, Object> getBattleData(Map<String, Object> playerData){
        Map<String, Object> eventData = (Map<String, Object>) playerData.get("eventData");
        return Map.of(
                "currentEventType", playerData.get("currentEventType"),
                "player", Map.of(
                        "name", playerData.get("name"),
                        "hp", playerData.get("hp"),
                        "maxHp", playerData.get("maxHp"),
                        "attack", playerData.get("attack"),
                        "defense", playerData.get("defense"),
                        "speed", playerData.get("speed")
                ),
                "enemy", eventData.get("enemy")
        );
    }
    // Начало боя
    public Map<String, Object> startBattle(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        int forestLevel = (int) playerData.get("forestLevel");
        EnemyData enemyDataObj = enemyService.generateEnemy(forestLevel);
        Map<String, Object> enemyData = Map.of(
                "name", enemyDataObj.getData().get("name"),
                "level", enemyDataObj.getData().get("level"),
                "hp", enemyDataObj.getData().get("health"),
                "maxHp", enemyDataObj.getData().get("health"),
                "attack", enemyDataObj.getData().get("damage"),
                "defense", enemyDataObj.getData().get("armor"),
                "speed", enemyDataObj.getData().get("speed"),
                "image", enemyDataObj.getData().get("image"),
                "message", "Бой с " + enemyDataObj.getData().get("name") + " начался!"
        );
        playerData.put("currentEventType", "combat");
        playerData.put("eventData", Map.of("enemy", enemyData));
        playerService.savePlayerData(userId, playerData);
        return getBattleData(playerData);
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
}