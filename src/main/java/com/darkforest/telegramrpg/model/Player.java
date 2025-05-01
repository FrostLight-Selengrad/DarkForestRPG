package com.darkforest.telegramrpg.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class Player {
    private int hp = 90;
    private int maxHp = 90;
    private int defense = 0;
    private int stamina = 100;
    private int maxStamina = 100;
    private int toughness = 0;
    private int magicalResistance = 0;
    private int initiative = 0;
    private int healthRegen = 0;
    private int resources = 0;
    private int resistance = 0;
    private int chaosResistance = 0;
    private int rhetoric = 0;
    private int toxicity = 0;
    private int physicalAttack = 10;
    private int magicPower = 0;
    private Map<String, Integer> inventory = new HashMap<>(Map.of("weak_elixir", 3)); // Пример: {"weak_health_potion": 3}
    private int forestLevel = 1;


    // Поля для ловушек
    private int trapEscapeChance = 60;
    private int trapAttempts = 0;
    // Лог для путешествия
    private List<String> explorationLog = new ArrayList<>();
    // Лог для боя
    private List<String> battleLog = new ArrayList<>();
    private int battleTurn = 0;

    // Поля для состояния боя и информации о противнике
    private String enemyName = "";   // Имя противника
    private int enemyHp = 0;         // Здоровье противника
    private int enemyMaxHp = 0;      // Максимальное здоровье противника
    private int enemyAttack = 0;     // Атака противника
    private int enemyInitiative = 0; // Инициатива противника

    public String getEnemyName() {
        return enemyName;
    }

    public void setEnemyName(String enemyName) {
        this.enemyName = enemyName;
    }

    public int getEnemyHp() {
        return enemyHp;
    }

    public Map<String, Integer> getInventory() {
        return inventory;
    }

    public void setEnemyHp(int enemyHp) {
        this.enemyHp = enemyHp;
    }

    public int getEnemyMaxHp() {
        return enemyMaxHp;
    }

    public void setEnemyMaxHp(int enemyMaxHp) {
        this.enemyMaxHp = enemyMaxHp;
    }

    public int getEnemyAttack() {
        return enemyAttack;
    }

    public void setEnemyAttack(int enemyAttack) {
        this.enemyAttack = enemyAttack;
    }

    public int getEnemyInitiative() {
        return enemyInitiative;
    }

    public void setEnemyInitiative(int enemyInitiative) {
        this.enemyInitiative = enemyInitiative;
    }

    // Остальные геттеры и сеттеры для существующих полей
    public int getHp() {
        return hp;
    }

    public void setHp(int hp) {
        this.hp = hp;
    }

    public int getMaxHp() {
        return maxHp;
    }

    public void setMaxHp(int maxHp) {
        this.maxHp = maxHp;
    }

    public int getStamina() {
        return stamina;
    }

    public int getMaxStamina() {
        return maxStamina;
    }

    public void setStamina(int stamina) {
        this.stamina = stamina;
    }

    public int getToughness() {
        return toughness;
    }

    public int getPhysicalAttack() {
        return physicalAttack;
    }

    public int getForestLevel() {
        return forestLevel;
    }

    public void setForestLevel(int forestLevel) {
        this.forestLevel = forestLevel;
    }

    public List<String> getBattleLog() {return battleLog;}

    public List<String> getExplorationLog() {return explorationLog;}

    public void clearBattleLog() {
        battleLog.clear();
        battleTurn = 0;
    }

    public void addToBattleLog(String message) {battleLog.add(message);}

    public void addToExplorationLog(String message) {explorationLog.add(message);}

    public int getBattleTurn() {return battleTurn;}

    public void setBattleTurn(int battleTurn) {this.battleTurn = battleTurn;}

    public int getTrapEscapeChance() { return trapEscapeChance; }
    public void setTrapEscapeChance(int chance) { this.trapEscapeChance = Math.min(chance, 100); }
    public int getTrapAttempts() { return trapAttempts; }
    public void setTrapAttempts(int attempts) { this.trapAttempts = attempts; }

    private String currentLocation = "base_camp";
    private String currentEventType = "none";
    private Map<String, Object> eventData = new HashMap<>();

    public String getCurrentEventType() {
        return currentEventType;
    }

    public void setCurrentEventType(String type) {
        this.currentEventType = type;
    }

    public Map<String, Object> getEventData() {
        return eventData;
    }

    public void addEventData(String key, Object value) {
        eventData.put(key, value);
    }

    public Object getEventDataValue(String key) {
        return eventData.get(key);
    }

    public void addGold(int gold) {
        resources += gold;
    }

    public String getCurrentLocation() {
        return currentLocation;
    }

    public void setCurrentLocation(String currentLocation) {
        this.currentLocation = currentLocation;
    }


    // Возвращаем данные для леса
    public Map<String, Object> getForestData() {
        Map<String, Object> result = new HashMap<>();
        result.put("currentLocation", getCurrentLocation());
        result.put("hp", hp);
        result.put("maxHp", maxHp);
        result.put("stamina", stamina);
        result.put("maxStamina", maxStamina);
        result.put("forestLevel", forestLevel);
        result.put("gold",resources);
        return result;
    }

    // Возвращаем данные события
    public Map<String, Object> getCurrentData() {
        Map<String, Object> result = new HashMap<>();
        result.put("currentLocation", getCurrentLocation());
        result.put("currentEventType", getCurrentEventType());
        result.put("eventData", getEventData());
        return result;
    }
}