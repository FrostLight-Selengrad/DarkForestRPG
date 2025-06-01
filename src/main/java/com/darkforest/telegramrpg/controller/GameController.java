package com.darkforest.telegramrpg.controller;

import com.darkforest.telegramrpg.service.*;
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
        System.out.println("Returning all player data: " + playerData);
        if (playerData.get("currentEventType").equals("combat")) {
            return CombatService.getBattleData(playerData);
        } else {
            return playerData;
        }
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

    // Таймер для исследования
    @GetMapping("/progress-time")
    public long getProgressTime(@RequestParam Long userId, @RequestParam String eventType) {
        System.out.println("Received progress time request: userId=" + userId + ", eventType=" + eventType);
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        int stamina = (int) playerData.get("stamina");

        long progressTime = eventService.generateProgressTime(stamina, (int) playerData.get("maxStamina"),
                (int) playerData.get("speed"), (int) playerData.get("agility"),(int) playerData.get("forestLevel"));

        System.out.println("Returning progress time: " + progressTime);
        return progressTime;
    }

    // Исследование локации
    @GetMapping("/explore")
    public Map<String, Object> getDataAfterExplore(@RequestParam Long userId) {
        System.out.println("Received explore request: userId=" + userId);
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        Map<String, Object> eventData = eventService.generateEvent((int) playerData.get("luck"));
        int stamina = (int) playerData.get("stamina");

        playerData.put("currentEventType", eventData.get("type"));
        playerData.put("eventData", eventData);
        playerData.put("stamina", stamina-2);
        List<String> log = (List<String>) playerData.getOrDefault("explorationLog", new ArrayList<>());
        log.add((String) eventData.get("message"));
        playerData.put("explorationLog", log);
        playerService.savePlayerData(userId, playerData);

        System.out.println("Returning explore response: " + eventData);
        return playerData;
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
    @GetMapping("/openCash")
    public Map<String, Object> openCash(@RequestParam Long userId) {
        System.out.println("[userId="+userId+"] Received open cash request");
        Map<String, Object> playerData = playerService.loadPlayerData(userId);

        Map<String, Object> eventData;
        if (playerData.get("currentEventType").equals("cash_event") ||
                playerData.get("currentEventType").equals("hidden_cash_event")) {

            eventData = eventService.interactEvent((int) playerData.get("forestLevel"),
                    (int) playerData.get("luck"), (int) playerData.get("agility"),
                    (Map<String, Object>) playerData.get("eventData"));

            int stamina = (int) playerData.get("stamina");

            playerData.put("currentEventType", eventData.get("type"));
            playerData.put("gold", (int) playerData.get("gold") + (int) eventData.get("gold"));
            playerData.put("eventData", eventData);
            playerData.put("stamina", stamina-1);
            List<String> log = (List<String>) playerData.getOrDefault("explorationLog", new ArrayList<>());
            log.add((String) eventData.get("message"));
            playerData.put("explorationLog", log);
            playerService.savePlayerData(userId, playerData);
        } else {
            System.out.println("[userId="+userId+"] But it is not a cash_event");
        }
        return playerData;
    }

    // Отбиться от змеи
    @GetMapping("/escapeTrap")
    public Map<String, Object> escapeTrap(@RequestParam Long userId) {
        System.out.println("[userId="+userId+"] Received escape trap request");
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        System.out.println("playerData: " + playerData);

        Map<String, Object> eventData = (Map<String, Object>) playerData.get("eventData");
        System.out.println("eventData: " + eventData);
        if (playerData.get("currentEventType").equals("snake_trap_event") ||
                playerData.get("currentEventType").equals("trap_not_escape_event")) {

            eventData = eventService.interactEvent((int) playerData.get("forestLevel"),
                    (int) playerData.get("luck"), (int) playerData.get("agility"),
                    (Map<String, Object>) playerData.get("eventData"));

            int stamina = (int) playerData.get("stamina");

            playerData.put("currentEventType", eventData.get("type"));
            playerData.put("eventData", eventData);
            playerData.put("stamina", stamina-1);
            if (eventData.get("type").equals("trap_not_escape_event")) {
                playerData.put("hp", (int) playerData.get("hp") - (int) eventData.get("damage"));
            }
            List<String> log = (List<String>) playerData.getOrDefault("explorationLog", new ArrayList<>());
            log.add((String) eventData.get("message"));
            playerData.put("explorationLog", log);
            playerService.savePlayerData(userId, playerData);
        } else {
            System.out.println("[userId="+userId+"] But it is not a snake_trap_event or trap_not_escape_event");
        }
        return playerData;
    }
}