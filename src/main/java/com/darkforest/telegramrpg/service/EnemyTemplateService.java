package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.enemy.EnemyTemplate;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
public class EnemyTemplateService {
    private Map<String, EnemyTemplate> enemyTemplates;

    @Autowired
    private ResourceLoader resourceLoader;

    @PostConstruct
    public void init() throws IOException {
        Resource resource = resourceLoader.getResource("classpath:enemies/enemies.json");
        ObjectMapper mapper = new ObjectMapper();
        enemyTemplates = mapper.readValue(resource.getInputStream(),
                new TypeReference<Map<String, EnemyTemplate>>() {});
    }

    public EnemyTemplate getBaseStats(String name) {
        return enemyTemplates.get(name);
    }
}