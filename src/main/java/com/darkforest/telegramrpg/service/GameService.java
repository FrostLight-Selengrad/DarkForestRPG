package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.model.Player;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class GameService {
    private Player player = new Player();
    private Random random = new Random();
    private String currentEvent = "";
    private int enemyHp = 0;
    private String enemyName = "";
    private int enemyAttack = 0;
    private int enemyInitiative = 0;

    public Player getPlayer() {
        return player;
    }

    public String exploreForest() {
        String[] events = {"monster", "chest", "trap", "boss"};
        currentEvent = events[random.nextInt(events.length)];

        if (currentEvent.equals("monster")) {
            enemyName = "Гоблин";
            enemyHp = 50;
            enemyAttack = 15;
            enemyInitiative = 5;
            return "Вы столкнулись с Гоблином! HP: " + enemyHp;
        } else if (currentEvent.equals("chest")) {
            if (random.nextDouble() < 0.2) {
                enemyName = "Мимик";
                enemyHp = 70;
                enemyAttack = 20;
                enemyInitiative = 8;
                return "Сундук оказался мимиком! HP: " + enemyHp;
            } else {
                player.setPhysicalAttack(player.getPhysicalAttack() + 5);
                return "Вы нашли оружие в сундуке! Физ. атака +5";
            }
        } else if (currentEvent.equals("trap")) {
            int damage = 20 - player.getResistance() / 2;
            player.setHp(player.getHp() - damage);
            return "Вы попали в ловушку! Урон: " + damage + ". HP: " + player.getHp();
        } else if (currentEvent.equals("boss")) {
            enemyName = "Босс " + player.getForestLevel() + " уровня";
            enemyHp = 100;
            enemyAttack = 25;
            enemyInitiative = 15;
            return "Вы встретили босса! HP: " + enemyHp;
        }
        return "Ничего не произошло.";
    }

    public String attack(String type) {
        if (enemyHp <= 0) return "Враг уже побежден!";

        int damage = type.equals("physical") ? player.getPhysicalAttack() : 20; // Упрощённая магия
        enemyHp -= damage;
        String result = "Вы нанесли " + damage + " урона! HP врага: " + enemyHp;

        if (enemyHp <= 0) {
            result += "\nВы победили " + enemyName + "!";
            if (currentEvent.equals("boss")) {
                player.setForestLevel(player.getForestLevel() + 1);
                result += "\nВы перешли на " + player.getForestLevel() + " уровень леса!";
            }
            dropRunes();
            return result;
        }

        int enemyDamage = enemyAttack - player.getToughness() / 2;
        player.setHp(player.getHp() - (enemyDamage > 0 ? enemyDamage : 0));
        result += "\n" + enemyName + " наносит " + enemyDamage + " урона! Ваш HP: " + player.getHp();

        if (player.getHp() <= 0) {
            result += "\nВы проиграли...";
        }
        return result;
    }

    private void dropRunes() {
        if (player.getForestLevel() < 11) return;
        int maxRunes = player.getForestLevel() - 10;
        if (player.getStamina() < maxRunes && random.nextDouble() < 0.5) {
            player.setStamina(player.getStamina() + 1);
            player.setMaxHp(player.getMaxHp() + 10);
        }
    }
}