package com.darkforest.telegramrpg.model;

import java.util.ArrayList;
import java.util.List;

public class Player {
    private int hp = 90;
    private int maxHp = 90;
    private int stamina = 0;
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
    private int forestLevel = 1;
    private List<String> battleLog = new ArrayList<>();
    private int battleTurn = 0;

    // Новые поля для состояния боя и информации о противнике
    private boolean inCombat = false; // Состояние боя
    private String enemyName = "";   // Имя противника
    private int enemyHp = 0;         // Здоровье противника
    private int enemyMaxHp = 0;      // Максимальное здоровье противника
    private int enemyAttack = 0;     // Атака противника
    private int enemyInitiative = 0; // Инициатива противника

    // Геттеры и сеттеры для новых полей
    public boolean isInCombat() {
        return inCombat;
    }

    public void setInCombat(boolean inCombat) {
        this.inCombat = inCombat;
    }

    public String getEnemyName() {
        return enemyName;
    }

    public void setEnemyName(String enemyName) {
        this.enemyName = enemyName;
    }

    public int getEnemyHp() {
        return enemyHp;
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

    public void setStamina(int stamina) {
        this.stamina = stamina;
    }

    public int getToughness() {
        return toughness;
    }

    public void setToughness(int toughness) {
        this.toughness = toughness;
    }

    public int getMagicalResistance() {
        return magicalResistance;
    }

    public void setMagicalResistance(int magicalResistance) {
        this.magicalResistance = magicalResistance;
    }

    public int getInitiative() {
        return initiative;
    }

    public void setInitiative(int initiative) {
        this.initiative = initiative;
    }

    public int getHealthRegen() {
        return healthRegen;
    }

    public void setHealthRegen(int healthRegen) {
        this.healthRegen = healthRegen;
    }

    public int getResources() {
        return resources;
    }

    public void setResources(int resources) {
        this.resources = resources;
    }

    public int getResistance() {
        return resistance;
    }

    public void setResistance(int resistance) {
        this.resistance = resistance;
    }

    public int getChaosResistance() {
        return chaosResistance;
    }

    public void setChaosResistance(int chaosResistance) {
        this.chaosResistance = chaosResistance;
    }

    public int getRhetoric() {
        return rhetoric;
    }

    public void setRhetoric(int rhetoric) {
        this.rhetoric = rhetoric;
    }

    public int getToxicity() {
        return toxicity;
    }

    public void setToxicity(int toxicity) {
        this.toxicity = toxicity;
    }

    public int getPhysicalAttack() {
        return physicalAttack;
    }

    public void setPhysicalAttack(int physicalAttack) {
        this.physicalAttack = physicalAttack;
    }

    public int getMagicPower() {
        return magicPower;
    }

    public void setMagicPower(int magicPower) {
        this.magicPower = magicPower;
    }

    public int getForestLevel() {
        return forestLevel;
    }

    public void setForestLevel(int forestLevel) {
        this.forestLevel = forestLevel;
    }

    public List<String> getBattleLog() {
        return battleLog;
    }

    public void clearBattleLog() {
        battleLog.clear();
        battleTurn = 0;
    }

    public void addToBattleLog(String logEntry) {
        battleLog.add(logEntry);
    }

    public int getBattleTurn() {
        return battleTurn;
    }

    public void setBattleTurn(int battleTurn) {
        this.battleTurn = battleTurn;
    }
}