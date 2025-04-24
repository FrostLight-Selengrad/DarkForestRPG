package com.darkforest.telegramrpg.events;

import com.darkforest.telegramrpg.model.Player;

import java.util.Random;

public class BossEvent implements Event {
    private final Random random = new Random();

    @Override
    public int getWeight() {
        return 3;
    }

    @Override
    public String execute(Player player) {
        player.setEnemyName("Хранитель прохода");
        player.setEnemyHp(100);
        player.setEnemyMaxHp(100);
        player.setEnemyAttack(25);
        player.setEnemyInitiative(15);
        player.clearBattleLog();
        player.setBattleTurn(1);
        player.addToBattleLog(player.getEnemyName() + " преградил вам путь! Он полон решимости не пустить " +
                "героя дальше и уже готов к битве");
        player.addToExplorationLog("boss:boss.png:" + player.getEnemyName() + " преградил вам путь! Он полон решимости не пустить " +
                "героя дальше и уже готов к битве");
        return "Вы встретили босса!";
    }
}