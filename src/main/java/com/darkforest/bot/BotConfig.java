package com.darkforest.bot;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.starter.SpringWebhookBot;

@Configuration
public class BotConfig {

    @Bean
    public TelegramBotsApi telegramBotsApi(SpringWebhookBot bot) throws TelegramApiException {
        TelegramBotsApi api = new TelegramBotsApi();
        api.registerBot(bot, bot.getBotPath());
        return api;
    }
}