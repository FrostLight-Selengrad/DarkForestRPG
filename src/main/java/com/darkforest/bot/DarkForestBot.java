package com.darkforest.bot;

import com.darkforest.service.PlayerService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramWebhookBot;
import org.telegram.telegrambots.meta.api.methods.BotApiMethod;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.updates.SetWebhook;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.starter.SpringWebhookBot;

public class DarkForestBot extends SpringWebhookBot {
    private final String botToken;
    private final String botUsername;
    private final String webhookPath;
    private PlayerService playerService;

    public DarkForestBot(
            @Value("${telegrambot.token}") String botToken,
            @Value("${telegrambot.username}") String botUsername,
            @Value("${telegrambot.webhook.path}") String webhookPath,
            @Value("${telegrambot.external.url}") String externalUrl
    ) throws TelegramApiException {
        super(createWebhook(externalUrl + webhookPath));
        this.botToken = botToken;
        this.botUsername = botUsername;
        this.webhookPath = webhookPath;
    }

    private static SetWebhook createWebhook(String url) {
        SetWebhook webhook = new SetWebhook();
        webhook.setUrl(url);
        return webhook;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public String getBotPath() {
        return webhookPath;
    }

    @Override
    public BotApiMethod<?> onWebhookUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            Long userId = update.getMessage().getFrom().getId();
            String chatId = update.getMessage().getChatId().toString();
            String text = update.getMessage().getText();

            SendMessage message = new SendMessage();
            message.setChatId(chatId);

            if ("/start".equals(text)) {
                handleStartCommand(userId, message);
            } else if ("/progress".equals(text)) {
                handleProgressCommand(userId, message);
            } else {
                message.setText("Неизвестная команда. Используй /start или /progress.");
            }

            return message;  // Возвращаем сообщение вместо execute()
        }
        return null;
    }

    private void handleStartCommand(Long userId, SendMessage message) {
        playerService.saveProgress(userId, 1, 0, "[]");
        var progress = playerService.getProgress(userId);
        message.setText(progress != null ?
                "Прогресс сохранен: Уровень: " + progress.getLevel() + ", Золото: " + progress.getGold() :
                "Не удалось сохранить прогресс.");
    }

    private void handleProgressCommand(Long userId, SendMessage message) {
        try {
            var progress = playerService.getProgress(userId);
            message.setText(progress != null ?
                    "Твой прогресс:\nУровень: " + progress.getLevel() +
                            "\nЗолото: " + progress.getGold() +
                            "\nИнвентарь: " + progress.getInventory() :
                    "Прогресс не найден. Используй /start для начала игры.");
        } catch (Exception e) {
            message.setText("Ошибка при получении прогресса: " + e.getMessage());
            e.printStackTrace();
        }
    }
}