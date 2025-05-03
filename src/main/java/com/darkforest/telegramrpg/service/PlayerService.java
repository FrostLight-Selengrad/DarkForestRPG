package com.darkforest.telegramrpg.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class PlayerService {
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> loadPlayerData(Long userId) {
        try {
            return objectMapper.readValue(new File("players/" + userId + ".json"), Map.class);
        } catch (IOException e) {
            // Создаем нового игрока с начальными значениями
            Map<String, Object> newPlayer = new HashMap<>();
            newPlayer.put("userId", userId);
            newPlayer.put("hp", 90);
            newPlayer.put("maxHp", 90);
            newPlayer.put("stamina", 100);
            newPlayer.put("maxStamina", 100);
            newPlayer.put("currentLocation", "base_camp");
            newPlayer.put("inventory", new HashMap<>(Map.of("weak_elixir", 3)));
            newPlayer.put("forestLevel", 1);
            savePlayerData(userId, newPlayer);
            return newPlayer;
        }
    }

    public void savePlayerData(Long userId, Map<String, Object> playerData) {
        try {
            objectMapper.writeValue(new File("players/" + userId + ".json"), playerData);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка сохранения данных игрока", e);
        }
    }
}