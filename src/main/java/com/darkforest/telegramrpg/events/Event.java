package com.darkforest.telegramrpg.events;
import com.darkforest.telegramrpg.model.Player;

public interface Event {
    int getWeight();
    String execute(Player player);
}