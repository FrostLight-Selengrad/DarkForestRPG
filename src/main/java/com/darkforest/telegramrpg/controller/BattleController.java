package com.darkforest.telegramrpg.controller;

import com.darkforest.telegramrpg.service.CombatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/battle")
public class BattleController {

    @Autowired
    private CombatService combatService;

    // Начало боя
    @PostMapping("/start")
    public Map<String, Object> startBattle(@RequestParam Long userId) {
        return combatService.startBattle(userId);
    }

    // Атака
    @PostMapping("/attack")
    public Map<String, Object> attack(@RequestParam Long userId) {
        return combatService.performAttack(userId);
    }

    // Побег из боя
    @PostMapping("/flee")
    public Map<String, Object> flee(@RequestParam Long userId) {
        return combatService.tryFlee(userId);
    }
}