package com.darkforest.telegramrpg.service;

import org.springframework.stereotype.Service;

@Service
public class DamageService {
    public int calculatePhysicalDamage(int attack, int defense) {
        // Формула: урон = атака - защита с уменьшающимся эффектом
        double defenseReduction = defense / (defense + 50.0); // Асимптотический рост защиты
        int damage = (int) (attack * (1 - defenseReduction) - defense);
        return Math.max(1, damage); // Минимум 1 урон
    }
}