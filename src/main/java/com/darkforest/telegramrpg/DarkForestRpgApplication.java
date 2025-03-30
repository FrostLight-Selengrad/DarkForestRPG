package com.darkforest.telegramrpg;

import com.darkforest.bot.DarkForestBot;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DarkForestRpgApplication {

    public static void main(String[] args) {
        DarkForestBot bot = new DarkForestBot();
        SpringApplication.run(DarkForestRpgApplication.class, args);
    }

}
