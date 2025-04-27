package com.darkforest.telegramrpg.events;

import com.darkforest.telegramrpg.model.Player;
import java.util.Random;

public class ChestEvent implements Event {
    private final Random random = new Random();

    @Override
    public int getWeight() {
        return 30;
    }

    @Override
    public String execute(Player player) {
        player.setCurrentEventType("chest");
        boolean isMimic = random.nextDouble() < 0.2;
        player.addEventData("isMimic", isMimic);
        if (!isMimic) {
            int gold = 5 * player.getForestLevel() + random.nextInt(10);
            player.addEventData("gold", gold);
        }
        String message = "chest:event_chest.png:Вы нашли сундук!";
        player.addToExplorationLog(message);
        return message;
    }

    public String openChest(Player player) {
        if (!"chest".equals(player.getCurrentEventType())) {
            return "Сундук не найден!";
        }
        boolean isMimic = (boolean) player.getEventDataValue("isMimic");
        if (isMimic) {
            player.setCurrentEventType("combat");
            player.addEventData("enemyName", "Мимик");
            player.addEventData("enemyHp", 70);
            player.addEventData("enemyMaxHp", 70);
            player.addEventData("enemyAttack", 20);
            String message = "monster:mimic.png:Сундук оказался Мимиком!";
            player.addToExplorationLog(message);
            return message;
        } else {
            int gold = (int) player.getEventDataValue("gold");
            player.addGold(gold);
            player.setCurrentEventType("none");
            player.getEventData().clear();
            String message = "chest_open:chest_open.png:Вы открыли сундук и нашли " + gold + " золота!";
            player.addToExplorationLog(message);
            return message;
        }
    }
}