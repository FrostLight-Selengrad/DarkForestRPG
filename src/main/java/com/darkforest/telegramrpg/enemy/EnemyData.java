package com.darkforest.telegramrpg.enemy;

import com.darkforest.telegramrpg.service.EnemyTemplateService;

import java.util.Random;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EnemyData {
    private final Random random = new Random();
    private final EnemyTemplateService enemyTemplateService;

    String name;
    int monster_level;
    int health;
    int damage;
    int armor;
    int speed;
    String base_attack;
    List<String> special_attacks;
    List<String> start_battle_abilities;
    List<String> abilities;

    public EnemyData(int forestLevel, EnemyTemplateService enemyTemplateService) {
        this.enemyTemplateService = enemyTemplateService;
        generateEnemyName();
        generateEnemyData(forestLevel);
    }

    public Map<String, Object> getData(){
        Map<String, Object> data = new HashMap<>();
        data.put("name", name);
        data.put("level", monster_level);
        data.put("health", health);
        data.put("damage", damage);
        data.put("armor", armor);
        data.put("speed", speed);
        data.put("base_attack", base_attack);
        data.put("special_attacks", special_attacks);
        data.put("start_battle_abilities", start_battle_abilities);
        data.put("abilities", abilities);
        return data;
    }

    private void generateEnemyName() {
        List<String> enemies = List.of(
                "bandit",
                "bandit_arrow",
                "bandit_club");
        int randomValue = random.nextInt(enemies.size());
        name = enemies.get(randomValue);
    }


    private void generateEnemyData(int forestLevel) {
        monster_level = forestLevel + random.nextInt(2);
        EnemyTemplate template = enemyTemplateService.getBaseStats(name);
        if (template == null) {
            throw new IllegalArgumentException("Enemy template not found for name: " + name);
        }
        health = (int) (template.getHealth() * (0.88 + 0.12 * monster_level));
        damage = (int) (template.getDamage() * (0.88 + 0.12 * monster_level));
        armor = (int) (template.getArmor() * (0.88 + 0.12 * monster_level));
        speed = template.getSpeed();
        base_attack = template.getBase_attack();
        special_attacks = template.getSpecial_attacks();
        start_battle_abilities = template.getStart_battle_abilities();
        abilities = template.getAbilities();
    }
}
