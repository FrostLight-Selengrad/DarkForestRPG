package com.darkforest.telegramrpg.model;

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

    // Геттеры и сеттеры (Alt+Insert → "Getter and Setter")
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
}