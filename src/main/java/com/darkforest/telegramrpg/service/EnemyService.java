package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.enemy.EnemyData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EnemyService {
    @Autowired
    private EnemyTemplateService enemyTemplateService;

    public EnemyData generateEnemy(int forestLevel) {
        return new EnemyData(forestLevel, enemyTemplateService);
    }
}
