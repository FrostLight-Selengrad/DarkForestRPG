package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.model.Player;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

// Сервис для управления данными игрока
@Service
public class PlayerService {
    private Map<Long, Player> players = new HashMap<>();

    // Получить игрока по ID пользователя, создать нового, если не существует
    public Player getPlayer(Long userId) {
        return players.computeIfAbsent(userId, id -> new Player());
    }

    // Сохранить игрока
    public void savePlayer(Long userId, Player player) {
        players.put(userId, player);
    }


}