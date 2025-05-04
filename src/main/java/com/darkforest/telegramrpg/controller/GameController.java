package com.darkforest.telegramrpg.controller;

import com.darkforest.telegramrpg.service.PlayerService;
import com.darkforest.telegramrpg.service.EventService;
import com.darkforest.telegramrpg.service.LocationService;
import com.darkforest.telegramrpg.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    private PlayerService playerService;

    @Autowired
    private EventService eventService;

    @Autowired
    private LocationService locationService;

    @Autowired
    private InventoryService inventoryService;

    private final Random random = new Random();

    // Получение данных игрока
    @GetMapping("/player")
    public Map<String, Object> getPlayerData(@RequestParam Long userId) {
        System.out.println("Received request for player data: userId=" + userId);
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        playerData.put("gold", playerData.getOrDefault("gold", 0));
        playerData.put("message", "Добро пожаловать в игру!");
        System.out.println("Returning player data: " + playerData);
        return playerData;
    }

    // Перемещение в локацию
    @PostMapping("/move")
    public Map<String, Object> moveToLocation(@RequestParam Long userId, @RequestParam String location) {
        System.out.println("Received move request: userId=" + userId + ", location=" + location);
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        playerData.put("currentLocation", location);
        playerService.savePlayerData(userId, playerData);
        Map<String, Object> locationData;
        try {
            locationData = locationService.getLocationData(location);
            System.out.println("Location data loaded: " + locationData);
        } catch (Exception e) {
            System.err.println("Error loading location data for " + location + ": " + e.getMessage());
            locationData = new HashMap<>();
            locationData.put("message", "Ошибка загрузки локации: " + location);
            locationData.put("image", location + ".png");
        }
        Map<String, Object> response = new HashMap<>(playerData);
        response.put("message", locationData.getOrDefault("message", "Вы переместились в " + location));
        response.put("image", locationData.getOrDefault("image", location + ".png"));
        response.put("gold", playerData.getOrDefault("gold", 0));
        System.out.println("Returning move response: " + response);
        return response;
    }

    // Исследование локации
    @PostMapping("/explore")
    public Map<String, Object> exploreLocation(@RequestParam Long userId) {
        System.out.println("Received explore request: userId=" + userId);
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        String location = (String) playerData.get("currentLocation");
        Map<String, Object> eventData = eventService.generateEvent(userId, location);
        playerData.put("currentEventType", eventData.get("type"));
        playerData.put("eventData", eventData);
        playerService.savePlayerData(userId, playerData);
        System.out.println("Returning explore response: " + eventData);
        return eventData;
    }

    // Получение инвентаря
    @GetMapping("/player/inventory")
    public Map<String, Object> getInventory(@RequestParam Long userId) {
        System.out.println("Received inventory request: userId=" + userId);
        Map<String, Object> inventory = inventoryService.getInventory(userId);
        System.out.println("Returning inventory: " + inventory);
        return inventory;
    }

    // Открытие сундука
    @PostMapping("/openChest")
    public Map<String, Object> openChest(@RequestParam Long userId) {
        System.out.println("Received open chest request: userId=" + userId);
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        Map<String, Object> chestData = new HashMap<>();
        boolean isMimic = random.nextDouble() < 0.2;
        chestData.put("isMimic", isMimic);

        if (!isMimic) {
            int forestLevel = (int) playerData.getOrDefault("forestLevel", 1);
            int gold = 5 * forestLevel + random.nextInt(10);
            chestData.put("gold", gold);
            int currentGold = (int) playerData.getOrDefault("gold", 0);
            playerData.put("gold", currentGold + gold);
        } else {
            Map<String, Object> enemyData = new HashMap<>();
            enemyData.put("name", "Mimic");
            enemyData.put("hp", 50);
            enemyData.put("maxHp", 50);
            enemyData.put("attack", 10);
            enemyData.put("defense", 5);
            chestData.put("enemyData", enemyData);
            playerData.put("currentEventType", "combat");
            playerData.put("eventData", Map.of("enemy", enemyData));
        }

        playerData.put("currentEventType", "chest");
        playerData.put("chestData", chestData);
        String message = "chest:event_chest.png:Вы нашли сундук!";
        @SuppressWarnings("unchecked")
        List<String> explorationLog = (List<String>) playerData.getOrDefault("explorationLog", new ArrayList<>());
        explorationLog.add(message);
        playerService.savePlayerData(userId, playerData);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Вы нашли сундук!");
        response.put("chestData", chestData);
        response.put("playerData", playerData);
        System.out.println("Returning open chest response: " + response);
        return response;
    }
}