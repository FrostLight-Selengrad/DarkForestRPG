package com.darkforest.telegramrpg.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Player {
    private Long id;
    private int hp;
    private int maxHp;
    private int stamina;
    private int maxStamina;
    private int physicalAttack;
    private int defense;
    private int toughness;
    private int magicalResistance;
    private int initiative;
    private int healthRegen;
    private int resources;
    private int resistance;
    private int chaosResistance;
    private int rhetoric;
    private int toxicity;
    private int magicPower;
    private Map<String, Integer> inventory = new HashMap<>();
    private int forestLevel;
    private String currentLocation;
    private String currentEventType;
    private Map<String, Object> eventData = new HashMap<>();
    private List<String> battleLog = new ArrayList<>();
    private List<String> explorationLog = new ArrayList<>();
    private int battleTurn;

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getHp() { return hp; }
    public void setHp(int hp) { this.hp = hp; }
    public int getMaxHp() { return maxHp; }
    public void setMaxHp(int maxHp) { this.maxHp = maxHp; }
    public int getStamina() { return stamina; }
    public void setStamina(int stamina) { this.stamina = stamina; }
    public int getMaxStamina() { return maxStamina; }
    public void setMaxStamina(int maxStamina) { this.maxStamina = maxStamina; }
    public int getPhysicalAttack() { return physicalAttack; }
    public void setPhysicalAttack(int physicalAttack) { this.physicalAttack = physicalAttack; }
    public int getDefense() { return defense; }
    public void setDefense(int defense) { this.defense = defense; }
    public int getToughness() { return toughness; }
    public void setToughness(int toughness) { this.toughness = toughness; }
    public int getMagicalResistance() { return magicalResistance; }
    public void setMagicalResistance(int magicalResistance) { this.magicalResistance = magicalResistance; }
    public int getInitiative() { return initiative; }
    public void setInitiative(int initiative) { this.initiative = initiative; }
    public int getHealthRegen() { return healthRegen; }
    public void setHealthRegen(int healthRegen) { this.healthRegen = healthRegen; }
    public int getResources() { return resources; }
    public void setResources(int resources) { this.resources = resources; }
    public int getResistance() { return resistance; }
    public void setResistance(int resistance) { this.resistance = resistance; }
    public int getChaosResistance() { return chaosResistance; }
    public void setChaosResistance(int chaosResistance) { this.chaosResistance = chaosResistance; }
    public int getRhetoric() { return rhetoric; }
    public void setRhetoric(int rhetoric) { this.rhetoric = rhetoric; }
    public int getToxicity() { return toxicity; }
    public void setToxicity(int toxicity) { this.toxicity = toxicity; }
    public int getMagicPower() { return magicPower; }
    public void setMagicPower(int magicPower) { this.magicPower = magicPower; }
    public Map<String, Integer> getInventory() { return inventory; }
    public void setInventory(Map<String, Integer> inventory) { this.inventory = inventory; }
    public int getForestLevel() { return forestLevel; }
    public void setForestLevel(int forestLevel) { this.forestLevel = forestLevel; }
    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }
    public String getCurrentEventType() { return currentEventType; }
    public void setCurrentEventType(String currentEventType) { this.currentEventType = currentEventType; }
    public Map<String, Object> getEventData() { return eventData; }
    public void addEventData(String key, Object value) { eventData.put(key, value); }
    public List<String> getBattleLog() { return battleLog; }
    public void clearBattleLog() { battleLog.clear(); }
    public int getBattleTurn() { return battleTurn; }
    public void setBattleTurn(int battleTurn) { this.battleTurn = battleTurn; }
    public void addToBattleLog(String message) { battleLog.add(message); }
    public List<String> getExplorationLog() { return explorationLog; }
    public void addToExplorationLog(String message) { explorationLog.add(message); }
}