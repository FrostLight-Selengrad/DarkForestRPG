package com.darkforest.bot;

import com.darkforest.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.longpolling.TelegramBotsLongPollingApplication;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.generics.TelegramClient;
import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;

import jakarta.annotation.PostConstruct;

@Component
public class DarkForestBot implements LongPollingSingleThreadUpdateConsumer {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Autowired
    private PlayerService playerService;

    private TelegramClient telegramClient;

    @PostConstruct
    public void init() {
        try {
            // Создаём TelegramClient с токеном
            telegramClient = new OkHttpTelegramClient(botToken);
            // Регистрируем бота для Long Polling
            TelegramBotsLongPollingApplication botsApplication = new TelegramBotsLongPollingApplication();
            botsApplication.registerBot(botToken, this);
        } catch (TelegramApiException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void consume(Update update) {
        System.out.println("Received update: " + update);
        if (update.hasMessage() && update.getMessage().hasText()) {
            Long userId = update.getMessage().getFrom().getId();
            String chatId = update.getMessage().getChatId().toString();
            System.out.println("Chat ID: " + chatId);
            String text = update.getMessage().getText();
            System.out.println("Message text: " + text);

            SendMessage message = SendMessage.builder()
                    .chatId(chatId)
                    .text("")
                    .build();

            if ("/start".equals(text)) {
                playerService.saveProgress(userId, 1, 0, "[]");
                message.setText("Добро пожаловать в Dark Forest RPG! Твой путь начинается. Уровень: 1, Золото: 0.");
            } else if ("/progress".equals(text)) {
                var progress = playerService.getProgress(userId);
                message.setText("Твой прогресс:\nУровень: " + progress.getLevel() + "\nЗолото: " + progress.getGold() + "\nИнвентарь: " + progress.getInventory());
            } else {
                message.setText("Неизвестная команда. Используй /start или /progress.");
            }

            try {
                System.out.println("Sending message: " + message.getText());
                telegramClient.execute(message); // Используем TelegramClient для отправки сообщения
                System.out.println("Message sent successfully");
            } catch (TelegramApiException e) {
                System.err.println("Failed to send message: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
