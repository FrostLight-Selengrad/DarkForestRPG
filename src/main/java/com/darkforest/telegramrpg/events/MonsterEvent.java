package com.darkforest.telegramrpg.events;
import com.darkforest.telegramrpg.model.Player;
import java.util.Random;

public class MonsterEvent implements Event {
    private final Random random = new Random();

    @Override
    public int getWeight() {
        return 60; // Вес, например, 40 из 100, значит 40% вероятности
    }

    @Override
    public String execute(Player player) {
        player.setCurrentEventType("combat");
        player.addEventData("enemyName", "Гоблин");
        player.addEventData("enemyHp", 50);
        player.setEnemyName("Гоблин");
        player.setEnemyHp(50);
        player.setEnemyMaxHp(50);
        player.setEnemyAttack(15);
        player.setEnemyInitiative(5);
        player.clearBattleLog();
        player.setBattleTurn(1);
        player.addToBattleLog("Вы встретили " + player.getEnemyName() + "!");
        String message;
        if (random.nextBoolean()) {
            message = "monster:goblin.png:Пробираясь через гущу леса вы заметили противника. " +
                    "Монстр занят своими делами и скорее всего вас еще не заметил.";
        } else {
            message = "monster:goblin.png:Вы обратили внимание на чью-то тень в лесу. " +
                    "Пытаясь рассмотреть его получше вы наступили на ветку и похоже " +
                    "он теперь смотрит в вашу сторону";
        }
        player.addToExplorationLog(message);
        return message;
    }
}