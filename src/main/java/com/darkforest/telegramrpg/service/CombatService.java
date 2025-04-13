package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.model.Player;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class CombatService {
    private final DamageService damageService;
    private final Random random = new Random();
    private final PlayerService playerService;

    // Конструктор для внедрения зависимости
    @Autowired
    public CombatService(PlayerService playerService, DamageService damageService) {
        this.damageService = damageService;
        this.playerService = playerService;
    }

    public Map<String, Object> handleFleeAttempt(Player player) {
        Map<String, Object> response = new HashMap<>();
        if (!player.isInCombat()) {
            response.put("message", "Вы не в бою!");
            response.put("inCombat", false);
            return response;
        }
        if (player.getEnemyHp() <= 0) {
            response.put("message", "Враг уже побежден!");
            player.setInCombat(false);
            player.clearBattleLog();
            response.put("inCombat", false);
            return response;
        }
        if (player.getHp() <= 0) {
            response.put("message", "Духам незачем убегать!");
            player.setInCombat(false);
            player.clearBattleLog();
            response.put("inCombat", false);
            return response;
        }

        player.addToBattleLog("Ход " + player.getBattleTurn() + ":\n");
        player.setBattleTurn(player.getBattleTurn() + 1);

        if (random.nextDouble() < 0.1) { // 10% шанс на успех
            player.addToBattleLog("Вы успешно сбежали!\n");
            player.setInCombat(false);
            player.setEnemyName(null);
            player.setEnemyHp(0);
            player.setEnemyMaxHp(0);
            String battleLog = String.join("\n", player.getBattleLog());
            response.put("battleLog", battleLog);
            response.put("inCombat", false);
            response.put("explorationMessage", "Вы ловко сбежали из боя, новые приключения снова ждут вас!");
            return response;
        } else {
            player.addToBattleLog("Попытка бегства не удалась, враг незамедлительно этим воспользовался\n");
            int enemyDamage = player.getEnemyAttack() - player.getToughness() / 2;
            player.setHp(player.getHp() - Math.max(enemyDamage, 0));
            player.addToBattleLog(player.getEnemyName() + " применил Рассекающий удар и нанес Вам " + enemyDamage + " урона\n");

            if (player.getHp() <= 0) {
                player.addToBattleLog("Вы проиграли...\n");
                String battleLog = String.join("\n", player.getBattleLog());
                resetProgress(player);
                player.setInCombat(false);
                response.put("battleLog", battleLog);
                response.put("inCombat", false);
                response.put("explorationMessage", "Вы проиграли бой с " + player.getEnemyName() + ".");
                return response;
            }

            String battleLog = String.join("\n", player.getBattleLog());
            response.put("battleLog", battleLog);
            response.put("inCombat", true);
            return response;
        }
    }

    public Map<String, Object> handleAttack(Player player) {
        Map<String, Object> response = new HashMap<>();
        if (!player.isInCombat()) return Map.of("message", "Вы не в бою!", "inCombat", player.isInCombat());
        if (player.getEnemyHp() <= 0) {
            player.setInCombat(false);
            player.clearBattleLog();
            response.put("message", "Враг уже побежден и можно двигаться дальше");
            response.put("inCombat", player.isInCombat());
            return response;
        }
        if (player.getHp() <= 0) {
            player.setInCombat(false);
            player.clearBattleLog();
            response.put("message", "Вы восстанавливаетесь после критического урона");
            response.put("inCombat", player.isInCombat());
            return response;
        }

        int damage = damageService.calculatePhysicalDamage(player.getPhysicalAttack(), player.getToughness());
        player.setEnemyHp(player.getEnemyHp() - damage);
        player.addToBattleLog("Ход " + player.getBattleTurn() + ":\nВы нанесли " + damage + " урона");
        player.setBattleTurn(player.getBattleTurn() + 1);

        if (player.getEnemyHp() <= 0) {
            player.addToBattleLog(player.getEnemyName() + " повержен!\n");
            String battleLog = String.join("\n", player.getBattleLog());
            player.setInCombat(false);
            player.clearBattleLog();
            response.put("battleLog", battleLog);
            response.put("explorationMessage", player.getEnemyName() + " повержен! Забрав все его ценности вы можете продолжить свой путь.");
            response.put("inCombat", player.isInCombat());
            return response;
        }

        int enemyDamage = damageService.calculatePhysicalDamage(player.getEnemyAttack(), player.getToughness());
        player.setHp(player.getHp() - enemyDamage);
        player.addToBattleLog(player.getEnemyName() + " нанес " + enemyDamage + " урона\n");

        if (player.getHp() <= 0) {
            player.addToBattleLog("Вы проиграли...\n");
            String battleLog = String.join("\n", player.getBattleLog());
            resetProgress(player);
            player.setInCombat(false);
            player.clearBattleLog();
            response.put("battleLog", battleLog);
            response.put("explorationMessage", "Вы проиграли бой с " + player.getEnemyName() + ".");
            response.put("inCombat", player.isInCombat());
            return response;
        }

        String battleLog = String.join("\n", player.getBattleLog());
        response.put("battleLog", battleLog);
        response.put("inCombat", true);
        return response;
    }

    private void resetProgress(Player player) {
        player.setHp(player.getMaxHp());
        player.setForestLevel(1);
        player.clearBattleLog();
        player.setBattleTurn(0);
        player.setInCombat(false);
    }
}