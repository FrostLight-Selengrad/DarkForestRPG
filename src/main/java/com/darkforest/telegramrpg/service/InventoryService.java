package com.darkforest.telegramrpg.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class InventoryService {

    @Autowired
    private PlayerService playerService;

    // Получение инвентаря
    public Map<String, Object> getInventory(Long userId) {
        Map<String, Object> playerData = playerService.loadPlayerData(userId);
        return (Map<String, Object>) playerData.get("inventory");
    }
}