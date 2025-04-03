package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.model.Player;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;

@Service
public class GameService {
    private final PlayerService playerService; // Добавляем зависимость

    // Конструктор для внедрения зависимости
    @Autowired
    public GameService(PlayerService playerService) {
        this.playerService = playerService;
    }

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
    public String exploreForest(Long userId) {
        Player player = playerService.getPlayer(userId);
        player.clearExplorationLog(); // Очищаем предыдущие сообщения

        // Добавляем событие в explorationLog
        player.addToExplorationLog("forest:Вы исследуете лес уровня " + player.getForestLevel());

        if (player.isInCombat()) {
            return "Вы не можете исследовать лес во время боя!";
        }

        player.addToExplorationLog("Вы вошли в лес уровня " + player.getForestLevel());

        String[] events = {"monster", "chest", "trap", "boss"};
        String currentEvent = events[random.nextInt(events.length)];

        switch (currentEvent) {
            case "monster" -> {
                player.addToExplorationLog("Вы встретили монстра!");
                player.setEnemyName("Гоблин");
                player.setEnemyHp(50);
                player.setEnemyMaxHp(50);
                player.setEnemyAttack(15);
                player.setEnemyInitiative(5);
                player.setInCombat(true);
                player.clearBattleLog();
                player.setBattleTurn(1);
                player.addToBattleLog("Вы встретили " + player.getEnemyName() + "!");
                return "Начался бой с " + player.getEnemyName();
            }
            case "chest" -> {
                if (random.nextDouble() < 0.2) {
                    player.setEnemyName("Мимик");
                    player.setEnemyHp(70);
                    player.setEnemyMaxHp(70);
                    player.setEnemyAttack(20);
                    player.setEnemyInitiative(8);
                    player.setInCombat(true);
                    player.clearBattleLog();
                    player.setBattleTurn(1);
                    player.addToBattleLog("Вы встретили " + player.getEnemyName() + "!");
                    return "Сундук оказался мимиком!";
                } else {
                    player.addToExplorationLog("Вы нашли сундук!");
                    player.setPhysicalAttack(player.getPhysicalAttack() + 5);
                    return "Найден сундук!";
                }
            }
            case "trap" -> {
                player.setInTrap(true);
                player.setTrapEscapeChance(60); // Сброс при новом попадании
                player.setTrapAttempts(0);

                // 50% шанс избежать
                if (random.nextBoolean()) {
                    player.addToExplorationLog("trap:Вы успешно избежали ловушку!");
                    player.setInTrap(false);
                    return "Вы ловко уклонились от ловушки!";
                } else {
                    int damage = 10;
                    player.setHp(player.getHp() - damage);
                    player.addToExplorationLog("trap:Вы упали в ловушку! Урон: " + damage);
                    return "Вы упали в ловушку! Урон: " + damage;
                }
            }
            case "boss" -> {
                player.setEnemyName("Босс");
                player.setEnemyHp(100);
                player.setEnemyMaxHp(100);
                player.setEnemyAttack(25);
                player.setEnemyInitiative(15);
                player.setInCombat(true);
                player.clearBattleLog();
                player.setBattleTurn(1);
                player.addToBattleLog("Вы встретили " + player.getEnemyName() + "!");
                return "Вы встретили босса! HP: " + player.getEnemyHp();
            }
        }
        return "Ничего не произошло.";
    }

    // Метод для атаки
    public String attack(Long userId) {
        Player player = playerService.getPlayer(userId);
        if (!player.isInCombat()) return "Вы не в бою!";
        if (player.getEnemyHp() <= 0) return "Враг уже побежден!";

        int damage = player.getPhysicalAttack();
        player.setEnemyHp(player.getEnemyHp() - damage);
        player.addToBattleLog("Ход " + player.getBattleTurn() + ":\nВы применили Атаку и нанесли " + damage + " урона\n");
        player.setBattleTurn(player.getBattleTurn() + 1);

        if (player.getEnemyHp() <= 0) {
            player.addToBattleLog(player.getEnemyName() + " повержен!\n");
            String result = String.join("\n", player.getBattleLog());
            player.setInCombat(false);
            dropRunes(player);
            player.clearBattleLog();
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
            player.clearBattleLog();
            return result;
        }
        playerService.savePlayer(userId, player);
        return String.join("\n", player.getBattleLog());
    }

    // Метод для попытки бегства
    public String tryFlee(Player player) {
        if (!player.isInCombat()) return "Вы не в бою!";
        if (player.getEnemyHp() <= 0) return "Враг уже побежден!";

        player.addToBattleLog("Ход " + player.getBattleTurn() + ":\n");
        player.setBattleTurn(player.getBattleTurn() + 1);

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

    // Добавьте новый метод для обработки побега
    public String handleTrapEscape(Player player) {
        player.setTrapAttempts(player.getTrapAttempts() + 1);

        // Расчет шанса
        int currentChance = player.getTrapEscapeChance();
        boolean success = new Random().nextInt(100) < currentChance;

        if (success) {
            player.setInTrap(false);
            player.setTrapEscapeChance(60); // Сброс при успехе
            player.setTrapAttempts(0);
            return "trap:Вы успешно выбрались!";
        } else {
            int damage = 10;
            player.setHp(player.getHp() - damage);

            // Увеличиваем шанс на 6% с каждой попыткой
            player.setTrapEscapeChance(currentChance + 6);

            return "trap:Попытка не удалась! Урон: " + damage + ". Новый шанс: " + player.getTrapEscapeChance() + "%";
        }
    }

    public Map<String, Object> rest(Long userId) {
        Player player = playerService.getPlayer(userId);
        if (!player.isInCamp()) return Map.of("success", false, "message", "Вы не в лагере!");
        if (player.getStamina() < player.getMaxStamina()) {
            player.setStamina(player.getStamina() + 1);
        }
        playerService.savePlayer(userId, player);
        return Map.of("success", true);
    }

    public Map<String, Object> leaveCamp(Long userId) {
        Player player = playerService.getPlayer(userId);
        player.setInCamp(false);
        playerService.savePlayer(userId, player);
        return Map.of("success", true);
    }

    // Начало боя с монстром
    public Map<String, Object> fightMonster(Long userId) {
        Player player = playerService.getPlayer(userId);
        player.setInCombat(true);
        player.clearBattleLog();
        player.addToBattleLog("Бой начался с " + player.getEnemyName() + "!");
        player.setStamina(player.getStamina() - (player.getEnemyName().contains("Босс") ? 5 : player.getEnemyName().contains("Элитный") ? 3 : 2));
        return Map.of("inCombat", true, "enemyName", player.getEnemyName(), "enemyHp", player.getEnemyHp(), "enemyMaxHp", player.getEnemyMaxHp());
    }

    // Побег до начала боя
    public Map<String, Object> fleeBeforeCombat(Long userId) {
        Player player = playerService.getPlayer(userId);
        boolean noticed = player.getExplorationLog().getLast().contains("заметил");
        double fleeChance = noticed ? 0.25 : 0.5;
        if (random.nextDouble() < fleeChance) {
            player.addToExplorationLog("Вы успешно сбежали!");
            return Map.of("message", "Вы успешно сбежали!");
        } else {
            player.setInCombat(true);
            player.clearBattleLog();
            player.addToBattleLog("Побег не удался! Бой начался!");
            return Map.of("inCombat", true, "enemyName", player.getEnemyName(), "enemyHp", player.getEnemyHp(), "enemyMaxHp", player.getEnemyMaxHp());
        }
    }

    public Map<String, Object> returnToCamp(Long userId) {
        Player player = playerService.getPlayer(userId);
        int time = 5 + (100 - player.getStamina()) / 5; // 5-25 сек
        String message = player.getStamina() > 80 ? "Герой бодро возвращается в лагерь" :
                player.getStamina() > 20 ? "Герой неспеша ковыляет в лагерь" :
                        "Герой из последних сил возвращается в лагерь. Это займет больше времени";
        player.setInCamp(true);
        playerService.savePlayer(userId, player);
        return Map.of("message", message, "time", time);
    }

    // Отдых в лагере
    public Map<String, Object> restAtCamp(Long userId) {
        Player player = playerService.getPlayer(userId);
        int staminaGain = player.getMaxStamina() / 5;
        int healthGain = player.getMaxHp() / 3;
        player.setStamina(Math.min(player.getMaxStamina(), player.getStamina() + staminaGain));
        player.setHp(Math.min(player.getMaxHp(), player.getHp() + healthGain));
        playerService.savePlayer(userId, player);
        return Map.of("success", true);
    }
}