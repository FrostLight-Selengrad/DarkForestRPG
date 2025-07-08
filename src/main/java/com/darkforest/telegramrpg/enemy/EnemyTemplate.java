package com.darkforest.telegramrpg.enemy;

import java.util.List;

public class EnemyTemplate {
    private int health;
    private int damage;
    private int armor;
    private int speed;
    private String base_attack;
    private List<String> special_attacks;
    private List<String> start_battle_abilities;
    private List<String> abilities;

    // Геттеры и сеттеры
    public int getHealth() { return health; }
    public void setHealth(int health) { this.health = health; }
    // Аналогично для других полей

    public int getDamage() { return damage; }
    public void setDamage(int damage) {
        this.damage = damage;
    }

    public int getArmor() { return armor; }
    public void setArmor(int armor) { this.armor = armor; }

    public int getSpeed() { return speed; }
    public void setSpeed(int speed) {
        this.speed = speed;
    }

    public String getBase_attack(){ return base_attack; }
    public void setBase_attack(String base_attack) {
        this.base_attack = base_attack;
    }

    public List<String> getSpecial_attacks(){ return special_attacks; }
    public void setSpecial_attacks(List<String> special_attacks) {
        this.special_attacks = special_attacks;
    }

    public List<String> getStart_battle_abilities(){ return start_battle_abilities; }
    public void setStart_battle_abilities(List<String> start_battle_abilities) {
        this.start_battle_abilities = start_battle_abilities;
    }

    public List<String> getAbilities() { return abilities; }
    public void setAbilities(List<String> abilities) {
        this.abilities = abilities;
    }
}