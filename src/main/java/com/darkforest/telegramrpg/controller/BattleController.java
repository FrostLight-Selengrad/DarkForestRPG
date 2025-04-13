package com.darkforest.telegramrpg.controller;

import com.darkforest.telegramrpg.model.Player;
import com.darkforest.telegramrpg.service.GameService;
import com.darkforest.telegramrpg.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import static java.lang.Math.round;

@RestController
@RequestMapping("/api/battle")
public class BattleController {
    @Autowired
    private GameService gameService;

    @Autowired
    private PlayerService playerService;

    @GetMapping("/log")
    public Map<String, Object> getBattleLog(@RequestParam Long userId) {
        Player player = playerService.getPlayer(userId);
        if (player == null) {
            return Map.of("error", "Player not found.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("log", String.join("\n", player.getBattleLog()));
        response.put("turn", player.getBattleTurn());
        return response;
    }

    @PostMapping("/attack")
    public Map<String, Object> attack(@RequestParam Long userId) {
        Map<String, Object> result = gameService.attack(userId);
        Player player = playerService.getPlayer(userId);
        playerService.savePlayer(userId, player); // Сохраняем изменения
        return result;
    }

    @PostMapping("/flee")
    public Map<String, Object> tryFlee(@RequestParam Long userId) {
        Player player = playerService.getPlayer(userId);
        Map<String, Object> result = gameService.tryFlee(userId);
        playerService.savePlayer(userId, player);
        return result;
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

        // Проверяем, находится ли игрок в бою, и передаем player в методы
        if (gameService.isInCombat(player)) {
            response.put("enemyHp", gameService.getEnemyHp(player));
            response.put("enemyMaxHp", player.getEnemyMaxHp());
            response.put("enemyName", gameService.getEnemyName(player));
            response.put("enemyColor", getHealthColor(gameService.getEnemyHp(player), player.getEnemyMaxHp()));
        }
        return response;
    }

    @PostMapping("/use-potion")
    public Map<String, Object> usePotion(
            @RequestParam Long userId,
            @RequestParam String type
    ) {
        Player player = playerService.getPlayer(userId);
        Map<String, Object> response = new HashMap<>();

        if (player.getInventory().getOrDefault(type, 0) > 0) {
            int heal = calculateHeal(type, player);
            player.setHp(Math.min(player.getMaxHp(), player.getHp() + heal));
            player.getInventory().put(type, player.getInventory().get(type) - 1);
            response.put("success", true);
            response.put("heal", heal);
        } else {
            response.put("error", "Зелье закончилось!");
        }

        return response;
    }

    private int calculateHeal(String type, Player player) {
        int currentHp = player.getHp();
        return 15 + (int) (0.1 * currentHp);
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