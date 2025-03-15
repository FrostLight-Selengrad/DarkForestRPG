package com.darkforest.telegramrpg.controller;

import com.darkforest.telegramrpg.model.Player;
import com.darkforest.telegramrpg.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class GameController {
    @Autowired
    private GameService gameService;

    @GetMapping("/player")
    public Player getPlayer() {
        return gameService.getPlayer();
    }

    @PostMapping("/explore")
    public String exploreForest() {
        return gameService.exploreForest();
    }

    @PostMapping("/attack")
    public String attack(@RequestParam String type) {
        return gameService.attack(type);
    }
}