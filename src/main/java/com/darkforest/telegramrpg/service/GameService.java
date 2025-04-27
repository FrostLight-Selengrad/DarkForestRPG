package com.darkforest.telegramrpg.service;

import com.darkforest.telegramrpg.model.Player;
import com.darkforest.telegramrpg.events.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class GameService {
    private final PlayerService playerService;
    private final Random random = new Random();
    private final CombatService combatService;
    // Конструктор для внедрения зависимости
    @Autowired
    public GameService(PlayerService playerService, CombatService combatService) {
        this.playerService = playerService;
        this.combatService = combatService;
    }

    private final List<Event> events = Arrays.asList(
            new MonsterEvent(),
            new ChestEvent(),
            new TrapEvent(),
            new BossEvent(),
            new HiddenCacheEvent()
    );

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
    public String openChest(Long userId) {
        Player player = playerService.getPlayer(userId);
        ChestEvent chestEvent = new ChestEvent();
        String message = chestEvent.openChest(player);
        playerService.savePlayer(userId, player);
        return message;
    }

    public String collectCache(Long userId) {
        Player player = playerService.getPlayer(userId);
        HiddenCacheEvent cacheEvent = new HiddenCacheEvent();
        String message = cacheEvent.collectCache(player);
        playerService.savePlayer(userId, player);
        return message;
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

    // Метод для выбора события на основе весов
    private Event selectEvent() {
        int totalWeight = events.stream().mapToInt(Event::getWeight).sum();
        int randomWeight = random.nextInt(totalWeight);
        int cumulativeWeight = 0;
        for (Event event : events) {
            cumulativeWeight += event.getWeight();
            if (randomWeight < cumulativeWeight) {
                return event;
            }
        }
        return events.get(events.size() - 1); // Фолбэк на случай ошибки
    }

    // Метод исследования леса
    public String exploreForest(Long userId) {
        Player player = playerService.getPlayer(userId);
        if (player.isInCombat()) {
            return "Вы не можете исследовать лес во время боя!";
        }
        Event selectedEvent = selectEvent();
        String message = selectedEvent.execute(player);
        playerService.savePlayer(userId, player);
        return message;
    }

    // Метод для атаки
    public Map<String, Object> attack(Long userId) {
        Player player = playerService.getPlayer(userId);
        return combatService.handleAttack(player); // Предполагаемый метод, аналогичный flee
    }

    // Метод для попытки убежать из боя
    public Map<String, Object> tryFlee(Long userId) {
        Player player = playerService.getPlayer(userId);
        return combatService.handleFleeAttempt(player);
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