package com.darkforest.telegramrpg.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class PlayerService {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        File playersDir = new File("players");
        if (!playersDir.exists()) {
            boolean created = playersDir.mkdir();
            if (!created) {
                System.err.println("Failed to create players directory");
            } else {
                System.out.println("Created players directory");
            }
        }
    }

    public Map<String, Object> loadPlayerData(Long userId) {
        try {
            Map<String, Object> playerData = objectMapper.readValue(new File("players/" + userId + ".json"), Map.class);
            System.out.println("Loaded player data for user " + userId + ": " + playerData);
            return playerData;
        } catch (IOException e) {
            System.out.println("Creating new player for user " + userId + ": " + e.getMessage());
            return newPlayerData(userId);
        }
    }

    private Map<String, Object> newPlayerData(long userId) {
        Map<String, Object> newPlayer = new HashMap<>();
        newPlayer.put("userId", userId);
        newPlayer.put("hp", 90);
        newPlayer.put("maxHp", 90);
        newPlayer.put("stamina", 100);
        newPlayer.put("maxStamina", 100);
        newPlayer.put("attack", 10);
        newPlayer.put("defence", 10);
        newPlayer.put("luck", 1);
        newPlayer.put("eloquence", 1);
        newPlayer.put("speed", 100);
        newPlayer.put("power", 5);
        newPlayer.put("agility", 5);
        newPlayer.put("vitality", 5);
        newPlayer.put("currentLocation", "base_camp");
        newPlayer.put("inventory", new HashMap<>(Map.of("weak_elixir", 3)));
        newPlayer.put("forestLevel", 1);
        newPlayer.put("gold", 100);
        newPlayer.put("currentEventType", "none");
        newPlayer.put("battleLog", new ArrayList<>());
        newPlayer.put("eventData", new ArrayList<>());
        newPlayer.put("explorationLog", new ArrayList<>());
        newPlayer.put("battleTurn", 0);
        savePlayerData(userId, newPlayer);
        return newPlayer;
    }

    public void savePlayerData(Long userId, Map<String, Object> playerData) {
        try {
            File playersDir = new File("players");
            if (!playersDir.exists()) {
                boolean created = playersDir.mkdir();
                if (!created) {
                    throw new IOException("Failed to create players directory");
                }
            }
            objectMapper.writeValue(new File("players/" + userId + ".json"), playerData);
            System.out.println("Saved player data for user " + userId + ": " + playerData);
        } catch (IOException e) {
            System.err.println("Error saving player data for user " + userId + ": " + e.getMessage());
            throw new RuntimeException("Ошибка сохранения данных игрока", e);
        }
    }
}