package com.darkforest.telegramrpg.events;

import com.darkforest.telegramrpg.model.Player;
import java.util.Map;

public interface Event {
    int getWeight();
    Map<String, Object> execute(Map<String, Object> playerData);
}