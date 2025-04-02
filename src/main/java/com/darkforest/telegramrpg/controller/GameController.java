package com.darkforest.telegramrpg.controller;

import com.darkforest.telegramrpg.model.Player;
import com.darkforest.telegramrpg.service.GameService;
import com.darkforest.telegramrpg.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
public class GameController {
    @Autowired
    private GameService gameService;

    @Autowired
    private PlayerService playerService;

    @GetMapping("/player")
    public Player getPlayer(@RequestParam Long userId) {
        return playerService.getPlayer(userId);
    }

    @GetMapping("/exploration-event")
    public Map<String, Object> getExplorationEvent(@RequestParam Long userId) {
        Player player = playerService.getPlayer(userId);
        Map<String, Object> response = new HashMap<>();

        if (!player.getExplorationLog().isEmpty()) {
            String lastEvent = player.getExplorationLog().getLast();

            // Проверка на наличие разделителя ":"
            if (lastEvent.contains(":")) {
                String[] parts = lastEvent.split(":", 2); // Ограничиваем split до 2 частей
                response.put("type", parts[0]);
                response.put("message", parts[1]);
            } else {
                response.put("type", "forest");
                response.put("message", lastEvent);
            }
        }

        return response;
    }

    @PostMapping("/explore")
    public Map<String, Object> exploreForest(@RequestParam Long userId) {
        Player player = playerService.getPlayer(userId);
        String message = gameService.exploreForest(userId);
        boolean inCombat = player.isInCombat();
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("inCombat", inCombat);
        if (inCombat) {
            response.put("enemyName", player.getEnemyName());
            response.put("enemyHp", player.getEnemyHp());
            response.put("enemyMaxHp", player.getEnemyMaxHp());
        }
        return response;
    }

    @PostMapping("/attack")
    public Map<String, Object> attack(@RequestParam Long userId) {
        String message = gameService.attack(userId);
        Player player = playerService.getPlayer(userId);
        playerService.savePlayer(userId, player); // Сохраняем изменения
        return Map.of(
                "message", message,
                "inCombat", player.isInCombat()
        );
    }

    @PostMapping("/flee")
    public Map<String, Object> tryFlee(@RequestParam Long userId) {
        Player player = playerService.getPlayer(userId);
        String message = gameService.tryFlee(player);
        return Map.of(
                "message", message,
                "inCombat", player.isInCombat()
        );
    }

    @GetMapping("/exploration-log")
    public Map<String, Object> getExplorationLog(@RequestParam Long userId) {
        Player player = playerService.getPlayer(userId);
        if (player == null) {
            return Map.of("error", "Player not found.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("log", String.join("\n", player.getExplorationLog()));
        return response;
    }

    @GetMapping("/health")
    public Map<String, Object> getHealthStatus(@RequestParam Long userId) {
        Player player = playerService.getPlayer(userId);
        if (player == null) {
            return Map.of("error", "Player not found.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("playerHp", player.getHp());
        response.put("playerMaxHp", player.getMaxHp());
        response.put("playerColor", getHealthColor(player.getHp(), player.getMaxHp()));
        if (player.isInCombat()) {
            response.put("enemyHp", player.getEnemyHp());
            response.put("enemyMaxHp", player.getEnemyMaxHp());
            response.put("enemyName", player.getEnemyName());
            response.put("enemyColor", getHealthColor(player.getEnemyHp(), player.getEnemyMaxHp()));
        }
        return response;
    }

    private String getHealthColor(int hp, int maxHp) {
        double percentage = (double) hp / maxHp * 100;
        if (percentage > 80) return "green";
        else if (percentage > 60) return "yellow";
        else if (percentage > 40) return "orange";
        else if (percentage > 20) return "red";
        else return "darkred";
    }
}