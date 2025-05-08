package com.darkforest.telegramrpg.events;

import java.util.Map;

public interface Event {
    int getWeight();
    Map<String, Object> execute(Map<String, Object> playerData);
}