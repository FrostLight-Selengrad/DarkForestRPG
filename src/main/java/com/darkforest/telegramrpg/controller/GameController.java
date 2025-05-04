package com.darkforest.telegramrpg.controller;

import com.darkforest.telegramrpg.service.PlayerService;
import com.darkforest.telegramrpg.service.EventService;
import com.darkforest.telegramrpg.service.LocationService;
import com.darkforest.telegramrpg.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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

    // Получение данных игрока
    @PostMapping("/player")
    public Map<String, Object> getPlayerData(@RequestParam Long userId) {
        System.out.println("Received request for player data: userId=" + userId);
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
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
}