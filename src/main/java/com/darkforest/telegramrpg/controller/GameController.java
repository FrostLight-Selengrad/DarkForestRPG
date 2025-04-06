package com.darkforest.telegramrpg.controller;

import com.darkforest.telegramrpg.model.Player;
import com.darkforest.telegramrpg.service.GameService;
import com.darkforest.telegramrpg.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
            String[] parts = lastEvent.split(":", 2);

            // Определяем тип события
            String type = parts[0];
            String message = parts.length > 1 ? parts[1] : lastEvent;

            response.put("type", type);
            response.put("message", message);
        }

        return response;
    }

    @PostMapping("/explore")
    public ResponseEntity<Map<String, Object>> exploreForest(
            @RequestParam("userId") Long userId) { // Явное указание параметра
        try {
            Player player = playerService.getPlayer(userId);
            if (player == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Игрок не найден"));
            }

            Map<String, Object> response = new HashMap<>();
            gameService.exploreForest(userId);

            response.put("message", player.getExplorationLog().getLast()); // Всегда последнее сообщение
            response.put("stamina", player.getStamina());
            response.put("inCombat", player.isInCombat());
            if (player.isInTrap()) {
                response.put("chance", player.getTrapEscapeChance());
            }
            if (player.isInCombat()) {
                response.put("enemyName", player.getEnemyName());
                response.put("enemyHp", player.getEnemyHp());
                response.put("enemyMaxHp", player.getEnemyMaxHp());
                response.put("level", player.getForestLevel()); // Уровень для босса или монстра
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
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

    @PostMapping("/escape-trap")
    public Map<String, Object> escapeTrap(@RequestParam Long userId) {
        Player player = playerService.getPlayer(userId);
        String message = gameService.handleTrapEscape(player);
        return Map.of(
                "type", "trap",
                "message", message
        );
    }

    @PostMapping("/fight-monster")
    public ResponseEntity<Map<String, Object>> fightMonster(@RequestParam Long userId) {
        try {
            Player player = playerService.getPlayer(userId);
            System.out.println("Player: " + player + ", inCombat: " + player.isInCombat());
            if (player == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Игрок не найден"));
            }
            if (!player.isInCombat()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Вы не в бою"));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Бой начался!");
            response.put("enemyName", player.getEnemyName());
            response.put("enemyHp", player.getEnemyHp());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/flee-before-combat")
    public Map<String, Object> fleeBeforeCombat(@RequestParam Long userId) {
        return gameService.fleeBeforeCombat(userId);
    }

    @PostMapping("/rest")
    public Map<String, Object> rest(@RequestParam Long userId) {
        return gameService.rest(userId);
    }

    @PostMapping("/leave-camp")
    public Map<String, Object> leaveCamp(@RequestParam Long userId) {
        return gameService.leaveCamp(userId);
    }

    @PostMapping("/return-to-camp")
    public Map<String, Object> returnToCamp(@RequestParam Long userId) {
        return gameService.returnToCamp(userId);
    }

    @PostMapping("/rest-at-camp")
    public Map<String, Object> restAtCamp(@RequestParam Long userId) {
        return gameService.restAtCamp(userId);
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