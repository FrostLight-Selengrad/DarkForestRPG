package com.darkforest.telegramrpg.controller;

import com.darkforest.telegramrpg.service.PlayerService;
import com.darkforest.telegramrpg.service.EventService;
import com.darkforest.telegramrpg.service.LocationService;
import com.darkforest.telegramrpg.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
    @GetMapping("/player")
    public Map<String, Object> getPlayerData(@RequestParam Long userId) {
        return playerService.loadPlayerData(userId);
    }

    // Перемещение в локацию
    @PostMapping("/move")
    public Map<String, Object> moveToLocation(@RequestParam Long userId, @RequestParam String location) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        playerData.put("currentLocation", location);
        playerService.savePlayerData(userId, playerData);
        return locationService.getLocationData(location);
    }

    // Исследование локации
    @PostMapping("/explore")
    public Map<String, Object> exploreLocation(@RequestParam Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        String location = (String) playerData.get("currentLocation");
        Map<String, Object> eventData = eventService.generateEvent(userId, location);
        playerData.put("currentEventType", eventData.get("type"));
        playerData.put("eventData", eventData);
        playerService.savePlayerData(userId, playerData);
        return eventData;
    }

    // Получение инвентаря
    @GetMapping("/player/inventory")
    public Map<String, Object> getInventory(@RequestParam Long userId) {
        return inventoryService.getInventory(userId);
    }
}