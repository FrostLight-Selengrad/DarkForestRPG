package com.darkforest.bot;

import com.darkforest.service.PlayerService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.botapimethods.BotApiMethod;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.webhook.starter.SpringTelegramWebhookBot;

@Component
public class DarkForestBot extends SpringTelegramWebhookBot {
    private static final Logger log = LogManager.getLogger(DarkForestBot.class);
    private final String botToken;
    private final String botUsername;
    private final String webhookPath;
    private static PlayerService playerService;

    public DarkForestBot(
            @Value("${telegram.bot.token}") String botToken,
            @Value("${telegram.bot.username}") String botUsername,
            @Value("${telegram.bot.webhook-path}") String webhookPath,
            PlayerService playerService) {
        super(
                webhookPath,
                update -> DarkForestBot.onWebhookUpdateReceived(update, playerService), // Передаем обработчик напрямую
                () -> {}, // setWebhook (пока пустой, можно настроить позже)
                () -> {}  // deleteWebhook (пока пустой, можно настроить позже)
        );
        this.botToken = botToken;
        this.botUsername = botUsername;
        this.webhookPath = webhookPath;
        log.info("[INIT] Webhook URL: {}", webhookPath);
        System.out.println("[INIT] Webhook URL: " + webhookPath);
    }

    public static BotApiMethod<?> onWebhookUpdateReceived(Update update, PlayerService playerService) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            Long userId = update.getMessage().getFrom().getId();
            String chatId = update.getMessage().getChatId().toString();
            String text = update.getMessage().getText();

            return SendMessage.builder()
                    .chatId(chatId)
                    .text(processCommand(userId, text))
                    .build();
        }
        return null;
    }

    private static String processCommand(Long userId, String text) {
        if ("/start".equalsIgnoreCase(text)) {
            return handleStartCommand(userId);
        } else if ("/progress".equalsIgnoreCase(text)) {
            return handleProgressCommand(userId);
        }
        return "Неизвестная команда. Используй /start или /progress.";
    }

    private static String handleStartCommand(Long userId) {
        playerService.saveProgress(userId, 1, 0, "[]");
        var progress = playerService.getProgress(userId);
        return progress != null ?
                "Прогресс сохранен: Уровень: " + progress.getLevel() + ", Золото: " + progress.getGold() :
                "Не удалось сохранить прогресс.";
    }

    private static String handleProgressCommand(Long userId) {
        try {
            var progress = playerService.getProgress(userId);
            return progress != null ?
                    "Твой прогресс:\nУровень: " + progress.getLevel() +
                            "\nЗолото: " + progress.getGold() +
                            "\nИнвентарь: " + progress.getInventory() :
                    "Прогресс не найден. Используй /start для начала игры.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Ошибка при получении прогресса: " + e.getMessage();
        }
    }

    public String getBotUsername() {
        return botUsername;
    }

    public String getBotToken() {
        return botToken;
    }

    public String getBotPath() {
        return webhookPath;
    }
}