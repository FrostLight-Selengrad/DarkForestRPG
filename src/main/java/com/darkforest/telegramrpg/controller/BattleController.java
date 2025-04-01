package com.darkforest.telegramrpg.controller;

import com.darkforest.telegramrpg.model.Player;
import com.darkforest.telegramrpg.service.GameService;
import com.darkforest.telegramrpg.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/battle")
public class BattleController {
    @Autowired
    private GameService gameService;

    @Autowired
    private PlayerService playerService;

    @GetMapping("/battle/log")
    public Map<String, Object> getBattleLog(@RequestParam Long userId) {
        Player player = playerService.getPlayer(userId);
        if (player == null) {
            return Map.of("error", "Player not found.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("log", player.getBattleLog());
        response.put("turn", player.getBattleTurn());
        return response;
    }

    @GetMapping("/battle/health")
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
            response.put("enemyMaxHp", player.getEnemyMaxHp()); // Предполагаем, что это поле есть в Player
            response.put("enemyName", gameService.getEnemyName(player));
            response.put("enemyColor", getHealthColor(gameService.getEnemyHp(player), player.getEnemyMaxHp()));
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