package com.darkforest.service;

import com.darkforest.entity.PlayerProgress;
import com.darkforest.repository.PlayerProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PlayerService {

    @Autowired
    private PlayerProgressRepository repository;

    public PlayerProgress getProgress(Long userId) {
        return repository.findById(userId)
                .orElse(new PlayerProgress(userId, 1, 0, "[]")); // Начальные значения
    }

    public void saveProgress(Long userId, int level, int gold, String inventory) {
        PlayerProgress progress = getProgress(userId);
        progress.setLevel(level);
        progress.setGold(gold);
        progress.setInventory(inventory);
        repository.save(progress);
    }
}