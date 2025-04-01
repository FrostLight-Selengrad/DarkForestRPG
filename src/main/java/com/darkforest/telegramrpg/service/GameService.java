package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.model.Player;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class GameService {
    private Random random = new Random();

    // Проверка, находится ли игрок в бою
    public boolean isInCombat(Player player) {
        return player.isInCombat();
    }

    // Получение текущего здоровья противника
    public int getEnemyHp(Player player) {
        return player.getEnemyHp();
    }

    // Получение имени противника
    public String getEnemyName(Player player) {
        return player.getEnemyName();
    }

    // Метод для исследования леса
    public String exploreForest(Player player) {
        if (player.isInCombat()) {
            return "Вы не можете исследовать лес во время боя!";
        }

        String[] events = {"monster", "chest", "trap", "boss"};
        String currentEvent = events[random.nextInt(events.length)];

        if (currentEvent.equals("monster")) {
            player.setEnemyName("Гоблин");
            player.setEnemyHp(50);
            player.setEnemyMaxHp(50);
            player.setEnemyAttack(15);
            player.setEnemyInitiative(5);
            player.setInCombat(true);
            player.clearBattleLog();
            player.setBattleTurn(0);
            return "Вы столкнулись с Гоблином! HP: " + player.getEnemyHp();
        } else if (currentEvent.equals("chest")) {
            if (random.nextDouble() < 0.2) {
                player.setEnemyName("Мимик");
                player.setEnemyHp(70);
                player.setEnemyMaxHp(70);
                player.setEnemyAttack(20);
                player.setEnemyInitiative(8);
                player.setInCombat(true);
                player.clearBattleLog();
                player.setBattleTurn(0);
                return "Сундук оказался мимиком! HP: " + player.getEnemyHp();
            } else {
                player.setPhysicalAttack(player.getPhysicalAttack() + 5);
                return "Вы нашли оружие в сундуке! Физ. атака +5";
            }
        } else if (currentEvent.equals("trap")) {
            int damage = 20 - player.getResistance() / 2;
            player.setHp(player.getHp() - damage);
            return "Вы попали в ловушку! Урон: " + damage + ". HP: " + player.getHp();
        } else if (currentEvent.equals("boss")) {
            player.setEnemyName("Босс " + player.getForestLevel() + " уровня");
            player.setEnemyHp(100);
            player.setEnemyMaxHp(100);
            player.setEnemyAttack(25);
            player.setEnemyInitiative(15);
            player.setInCombat(true);
            player.clearBattleLog();
            player.setBattleTurn(0);
            return "Вы встретили босса! HP: " + player.getEnemyHp();
        }
        return "Ничего не произошло.";
    }

    // Метод для атаки
    public String attack(Player player) {
        if (!player.isInCombat()) return "Вы не в бою!";
        if (player.getEnemyHp() <= 0) return "Враг уже побежден!";

        player.setBattleTurn(player.getBattleTurn() + 1);
        int damage = player.getPhysicalAttack();
        player.setEnemyHp(player.getEnemyHp() - damage);
        player.addToBattleLog("Ход " + player.getBattleTurn() + ":\nВы применили Атаку и нанесли " + damage + " урона\n");

        if (player.getEnemyHp() <= 0) {
            player.addToBattleLog(player.getEnemyName() + " повержен!\n");
            String result = String.join("\n", player.getBattleLog());
            player.setInCombat(false);
            dropRunes(player);
            return result;
        }

        // Атака монстра
        int enemyDamage = player.getEnemyAttack() - player.getToughness() / 2;
        player.setHp(player.getHp() - (enemyDamage > 0 ? enemyDamage : 0));
        player.addToBattleLog(player.getEnemyName() + " применил Рассекающий удар и нанес Вам " + enemyDamage + " урона\n");

        if (player.getHp() <= 0) {
            player.addToBattleLog("Вы проиграли...\n");
            String result = String.join("\n", player.getBattleLog());
            resetProgress(player);
            player.setInCombat(false);
            return result;
        }

        return String.join("\n", player.getBattleLog());
    }

    // Метод для попытки бегства
    public String tryFlee(Player player) {
        if (!player.isInCombat()) return "Вы не в бою!";
        if (player.getEnemyHp() <= 0) return "Враг уже побежден!";

        player.setBattleTurn(player.getBattleTurn() + 1);
        player.addToBattleLog("Ход " + player.getBattleTurn() + ":\n");

        if (random.nextDouble() < 0.1) { // 10% шанс на успех
            player.addToBattleLog("Вы успешно сбежали!\n");
            player.setInCombat(false);
            return String.join("\n", player.getBattleLog());
        } else {
            player.addToBattleLog("Попытка бегства не удалась, вы пропустили ход.\n");
            // Атака монстра
            int enemyDamage = player.getEnemyAttack() - player.getToughness() / 2;
            player.setHp(player.getHp() - (enemyDamage > 0 ? enemyDamage : 0));
            player.addToBattleLog(player.getEnemyName() + " применил Рассекающий удар и нанес Вам " + enemyDamage + " урона\n");

            if (player.getHp() <= 0) {
                player.addToBattleLog("Вы проиграли...\n");
                String result = String.join("\n", player.getBattleLog());
                resetProgress(player);
                player.setInCombat(false);
                return result;
            }

            return String.join("\n", player.getBattleLog());
        }
    }

    // Метод для сброса прогресса
    private void resetProgress(Player player) {
        player.setHp(player.getMaxHp()); // Восстанавливаем здоровье
        player.setForestLevel(1);        // Сбрасываем уровень леса
        player.clearBattleLog();         // Очищаем лог боя
        player.setBattleTurn(0);         // Сбрасываем номер хода
        player.setInCombat(false);       // Завершаем бой
    }

    // Метод для дропа рун
    private void dropRunes(Player player) {
        if (player.getForestLevel() < 11) return;
        int maxRunes = player.getForestLevel() - 10;
        if (player.getStamina() < maxRunes && random.nextDouble() < 0.5) {
            player.setStamina(player.getStamina() + 1);
            player.setMaxHp(player.getMaxHp() + 10);
        }
    }
}