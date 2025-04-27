package com.darkforest.telegramrpg.events;

import com.darkforest.telegramrpg.model.Player;

import java.util.Random;

public class TrapEvent implements Event {
    private final Random random = new Random();

    @Override
    public int getWeight() {
        return 10;
    }

    @Override
    public String execute(Player player) {
        player.setCurrentEventType("Trap");
        player.setTrapEscapeChance(60); // Сброс при новом попадании
        player.setTrapAttempts(0);

        // 50% шанс избежать
        if (random.nextBoolean()) {
            player.addToExplorationLog("trap_missed:event_trap_escape.png:Вы успешно избежали ловушку!");
            player.setCurrentEventType("None");
            return "Вы ловко уклонились от ловушки!";
        } else {
            int damage = 10 + 5 * player.getForestLevel();
            player.setHp(player.getHp() - damage);
            player.addToExplorationLog("trap:event_trap.png:Вы упали в ловушку! Урон - " + damage);
            return "Вы упали в ловушку! Урон: " + damage;
        }
    }
}
