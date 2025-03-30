package com.darkforest.bot;

import com.darkforest.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramWebhookBot;
import org.telegram.telegrambots.meta.api.methods.BotApiMethod;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

@Component
public class DarkForestBot extends TelegramWebhookBot {

    @Value("${telegrambot.username}")
    private String botUsername;

    @Value("${telegrambot.token}")
    private String botToken;

    @Value("${telegrambot.webhook.path}")
    private String webhookPath;

    @Autowired
    private PlayerService playerService;

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
            System.out.println("Received update: " + update);
            System.out.println("Chat ID: " + chatId);
            System.out.println("Message text: " + text);

            SendMessage message = new SendMessage();
            message.setChatId(chatId);
            message.setText("");

            if ("/start".equals(text)) {
                playerService.saveProgress(userId, 1, 0, "[]");
                System.out.println("Saved progress for user " + userId);
                var progress = playerService.getProgress(userId);
                if (progress != null) {
                    message.setText("Прогресс сохранен: Уровень: " + progress.getLevel() + ", Золото: " + progress.getGold());
                } else {
                    message.setText("Не удалось сохранить прогресс.");
                }
            } else if ("/progress".equals(text)) {
                try {
                    var progress = playerService.getProgress(userId);
                    if (progress != null) {
                        message.setText("Твой прогресс:\nУровень: " + progress.getLevel() + "\nЗолото: " + progress.getGold() + "\nИнвентарь: " + progress.getInventory());
                    } else {
                        message.setText("Прогресс не найден. Используй /start для начала игры.");
                    }
                } catch (Exception e) {
                    message.setText("Ошибка при получении прогресса: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                message.setText("Неизвестная команда. Используй /start или /progress.");
            }

            try {
                execute(message);
                System.out.println("Message sent successfully: " + message.getText());
            } catch (TelegramApiException e) {
                System.err.println("Failed to send message: " + e.getMessage());
                e.printStackTrace();
            }
        }
        return null;
    }
}