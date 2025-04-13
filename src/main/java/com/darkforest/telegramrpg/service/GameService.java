package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.model.Player;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class GameService {
    private final PlayerService playerService; // Добавляем зависимость
    private final DamageService damageService;
    // Конструктор для внедрения зависимости
    @Autowired
    public GameService(PlayerService playerService, DamageService damageService) {
        this.playerService = playerService;
        this.damageService = damageService;
    }

    // Список предметов с весами
    private static final Map<String, Integer> LOOT_WEIGHTS = new HashMap<>() {{
        put("weak_elixir_health", 50);
        put("elixir_health", 30);
        put("strong_elixir_health", 15);
        put("charmed_elixir_health", 5);
        put("weak_elixir_stamina", 20);
        put("elixir_stamina", 10);
        put("strong_elixir_stamina", 5);
        put("charmed_elixir_stamina", 2);
    }};

    private static final int TOTAL_WEIGHT = LOOT_WEIGHTS.values().stream().mapToInt(Integer::intValue).sum();

    // Метод открытия сундука
    public Map<String, Object> openChest(Long userId) {
        Player player = playerService.getPlayer(userId);
        Map<String, Object> response = new HashMap<>();

        // 20% шанс, что сундук — Мимик
        if (random.nextDouble() < 0.2) {
            player.setEnemyName("Мимик");
            player.setEnemyHp(70);
            player.setEnemyMaxHp(70);
            player.setEnemyAttack(20);
            player.setEnemyInitiative(8);
            player.setInCombat(true);
            player.clearBattleLog();
            player.setBattleTurn(1);
            player.addToBattleLog("Сундук оказался Мимиком! Бой начался!");
            player.addToExplorationLog("monster:mimic.png:Сундук оказался Мимиком!");

            response.put("inCombat", true);
            response.put("enemyName", player.getEnemyName());
            response.put("enemyHp", player.getEnemyHp());
            response.put("enemyMaxHp", player.getEnemyMaxHp());
            response.put("message", "Сундук оказался Мимиком!");
            playerService.savePlayer(userId, player);
            return response;
        } else {
            String lootItem = getRandomLoot();
            int currentCount = player.getInventory().getOrDefault(lootItem, 0);
            player.getInventory().put(lootItem, currentCount + 1);
            int goldAmount = 5 * player.getForestLevel() + random.nextInt(10);
            player.setResources(player.getResources() + goldAmount);

            String itemName = capitalize(getItemMessage(lootItem));
            String message = String.format("chest:event_chest.png:Вы нашли <%s.png> %s и %d золота!", lootItem, itemName, goldAmount);
            player.addToExplorationLog(message);

            response.put("message", message);
            response.put("item", lootItem);
            response.put("gold", goldAmount);
            response.put("inCombat", false);
        }
        playerService.savePlayer(userId, player);
        return response;
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    // Выбор случайного предмета на основе весов
    private String getRandomLoot() {
        int roll = random.nextInt(TOTAL_WEIGHT);
        int cumulativeWeight = 0;

        for (Map.Entry<String, Integer> entry : LOOT_WEIGHTS.entrySet()) {
            cumulativeWeight += entry.getValue();
            if (roll < cumulativeWeight) {
                return entry.getKey();
            }
        }
        return "weak_elixir_health"; // Запасной вариант, если что-то пойдёт не так
    }

    // Получение текстового описания предмета
    private String getItemMessage(String item) {
        return switch (item) {
            case "weak_elixir_health" -> "слабый эликсир здоровья";
            case "elixir_health" -> "эликсир здоровья";
            case "strong_elixir_health" -> "сильный эликсир здоровья";
            case "charmed_elixir_health" -> "зачарованный эликсир здоровья";
            case "weak_elixir_stamina" -> "слабый эликсир выносливости";
            case "elixir_stamina" -> "эликсир выносливости";
            case "strong_elixir_stamina" -> "сильный эликсир выносливости";
            case "charmed_elixir_stamina" -> "зачарованный эликсир выносливости";
            default -> "неизвестный предмет";
        };
    }

    private final Random random = new Random();

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
        player.clearBattleLog();

        if (player.isInCombat()) {
            return "Вы не можете исследовать лес во время боя!";
        }

        String[] events = {"monster", "chest", "trap", "boss"};
        String currentEvent = events[random.nextInt(events.length)];

        switch (currentEvent) {
            case "monster" -> {
                player.setEnemyName("Гоблин");
                player.setEnemyHp(50);
                player.setEnemyMaxHp(50);
                player.setEnemyAttack(15);
                player.setEnemyInitiative(5);
                player.clearBattleLog();
                player.setBattleTurn(1);
                player.addToBattleLog("Вы встретили " + player.getEnemyName() + "!");
                // 50% шанс избежать
                if (random.nextBoolean()) {
                    player.addToExplorationLog("monster:goblin.png:Пробираясь через гущу леса вы заметили противника. " +
                            "Монстр занят своими делами и скорее всего вас еще не заметил.");
                } else {
                    player.addToExplorationLog("monster:goblin.png:Вы обратили внимание на чью-то тень в лесу. " +
                            "Пытаясь рассмотреть его получше вы наступили на ветку и похоже " +
                            "он теперь смотрит в вашу стороны");
                }
                return "Начался бой с " + player.getEnemyName();
            }
            case "chest" -> {
                    player.addToExplorationLog("chest:event_chest.png:Вы нашли сундук!");
                    player.setPhysicalAttack(player.getPhysicalAttack() + 5);
                    return "Найден сундук!";
            }
            case "trap" -> {
                player.setInTrap(true);
                player.setTrapEscapeChance(60); // Сброс при новом попадании
                player.setTrapAttempts(0);

                // 50% шанс избежать
                if (random.nextBoolean()) {
                    player.addToExplorationLog("trap_missed:event_trap_escape.png:Вы успешно избежали ловушку!");
                    player.setInTrap(false);
                    return "Вы ловко уклонились от ловушки!";
                } else {
                    int damage = 10 + 5*player.getForestLevel();
                    player.setHp(player.getHp() - damage);
                    player.addToExplorationLog("trap:event_trap.png:Вы упали в ловушку! Урон - " + damage);
                    return "Вы упали в ловушку! Урон: " + damage;
                }
            }
            case "boss" -> {
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
        return "Ничего не произошло";
    }

    // Метод для атаки
    public String attack(Long userId) {
        Player player = playerService.getPlayer(userId);
        if (!player.isInCombat()) return "Вы не в бою!";
        if (player.getEnemyHp() <= 0) {
            player.setInCombat(false);
            player.clearBattleLog();
            return "Враг уже побежден!";
        }
        if (player.getHp() <= 0) {
            player.setInCombat(false);
            player.clearBattleLog();
            return "Духи не могут сражаться!";
        }

        int damage = damageService.calculatePhysicalDamage(player.getPhysicalAttack(), player.getToughness());
        player.setEnemyHp(player.getEnemyHp() - damage);
        player.addToBattleLog("Ход " + player.getBattleTurn() + ":\nВы нанесли " + damage + " урона");
        player.setBattleTurn(player.getBattleTurn() + 1);

        if (player.getEnemyHp() <= 0) {
            player.addToBattleLog(player.getEnemyName() + " повержен!\n");
            String result = String.join("\n", player.getBattleLog());
            player.setInCombat(false);
            dropRunes(player);
            player.clearBattleLog();
            return result;
        }

        int enemyDamage = damageService.calculatePhysicalDamage(player.getEnemyAttack(), player.getToughness());
        player.setHp(player.getHp() - enemyDamage);
        player.addToBattleLog(player.getEnemyName() + " нанес " + enemyDamage + " урона\n");

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
        if (player.getEnemyHp() <= 0) {
            player.setInCombat(false);
            player.clearBattleLog();
            player.addToExplorationLog("forest:forest_v3.png:Враг уже побежден!");
            return "Враг уже побежден!";
        }
        if (player.getHp() <= 0) {
            player.setInCombat(false);
            player.clearBattleLog();
            player.addToExplorationLog("forest:forest_v3 .png:Духам незачем убегать!");
            return "Духам незачем убегать!";
        }
        player.addToBattleLog("Ход " + player.getBattleTurn() + ":\n");
        player.setBattleTurn(player.getBattleTurn() + 1);

        if (random.nextDouble() < 0.1) { // 10% шанс на успех
            player.addToExplorationLog("forest:forest_v2.png:Вы успешно сбежали с поля боя! " +
                    " еще долго рычал в вашу стороны, но опасность уже позади.");
            player.addToBattleLog("Вы успешно сбежали!\n");
            player.setInCombat(false);      // Сбрасываем состояние боя
            player.setEnemyName(null);      // Очищаем имя врага
            player.setEnemyHp(0);           // Очищаем здоровье врага
            player.setEnemyMaxHp(0);        // Очищаем максимальное здоровье врага
        } else {
            player.addToBattleLog("Попытка бегства не удалась, враг незамедлительно этим воспользовался\n");
            // Атака монстра
            int enemyDamage = player.getEnemyAttack() - player.getToughness() / 2;
            player.setHp(player.getHp() - (Math.max(enemyDamage, 0)));
            player.addToBattleLog(player.getEnemyName() + " применил Рассекающий удар и нанес Вам " + enemyDamage + " урона\n");

            if (player.getHp() <= 0) {
                player.addToBattleLog("Вы проиграли...\n");
                String result = String.join("\n", player.getBattleLog());
                resetProgress(player);
                player.setInCombat(false);
                return result;
            }

        }
        return String.join("\n", player.getBattleLog());
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
            return "trap_missed:event_trap_escape.png:Вы успешно выбрались из ловушки и можете продолжить путешествие!";
        } else {
            int damage = 10;
            player.setHp(player.getHp() - damage);

            // Увеличиваем шанс на 6% с каждой попыткой
            player.setTrapEscapeChance(currentChance + 6);

            return "trap:event_trap.png:Попытка не удалась! Получено " + damage + " урона.\nНовый шанс " + player.getTrapEscapeChance() + "%";
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

    // Побег до начала боя
    public Map<String, Object> fleeBeforeCombat(Long userId) {
        Player player = playerService.getPlayer(userId);
        boolean noticed = player.getExplorationLog().getLast().contains("заметил");
        double fleeChance = noticed ? 0.25 : 0.5;
        if (random.nextDouble() < fleeChance) {
            player.addToExplorationLog("forest:forest_v1.png:Вы успешно избежали боя с опасным соперником..." +
                    " а может просто решили поберечь свои силы.");
            player.setInCombat(false);      // Сбрасываем состояние боя
            player.setEnemyName(null);      // Очищаем имя врага
            player.setEnemyHp(0);           // Очищаем здоровье врага
            player.setEnemyMaxHp(0);        // Очищаем максимальное здоровье врага
            return Map.of("message", "Вы успешно сбежали!");
        } else {
            player.setInCombat(true);
            player.clearBattleLog();
            player.addToExplorationLog("monster:goblin.png:Вы успешно сбежали!");
            player.addToBattleLog(player.getEnemyName() + " заметил вас, пробирающегося сквозь кусты, битвы не избежать!");
            return Map.of(
                    "enemyName", player.getEnemyName(),
                    "enemyHp", player.getEnemyHp(),
                    "enemyMaxHp", player.getEnemyMaxHp(),
                    "level", player.getForestLevel()
            );
        }
    }

    public Map<String, Object> returnToCamp(Long userId) {
        Player player = playerService.getPlayer(userId);
        int time = 5 + (100 - player.getStamina()) / 5; // 5-25 сек
        String message = player.getStamina() > 80 ? "Герой бодро возвращается в лагерь" :
                player.getStamina() > 20 ? "Герой не спеша ковыляет в лагерь" :
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