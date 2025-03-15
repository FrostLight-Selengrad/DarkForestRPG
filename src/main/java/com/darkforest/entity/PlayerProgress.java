package com.darkforest.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "player_progress")
public class PlayerProgress {
    @Id
    private Long userId; // Telegram userId для идентификации игрока
    private int level;   // Уровень игрока
    private int gold;    // Количество золота
    private String inventory; // Инвентарь (можно хранить как JSON-строку)

    // Конструкторы
    public PlayerProgress() {}

    public PlayerProgress(Long userId, int level, int gold, String inventory) {
        this.userId = userId;
        this.level = level;
        this.gold = gold;
        this.inventory = inventory;
    }

    // Геттеры и сеттеры
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public int getGold() { return gold; }
    public void setGold(int gold) { this.gold = gold; }
    public String getInventory() { return inventory; }
    public void setInventory(String inventory) { this.inventory = inventory; }
}