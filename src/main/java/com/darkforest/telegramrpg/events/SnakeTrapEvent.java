package com.darkforest.telegramrpg.events;

import java.util.Map;
import java.util.Random;

public class SnakeTrapEvent implements Event {
    private final Random random = new Random();
    int agility;

    public SnakeTrapEvent(int agility) {
        this.agility = agility;
    }

    public SnakeTrapEvent() {}

    @Override
    public int getWeight(int luck) {
        int weight = 25;
        weight = Math.round(weight * (1 + (float) luck / (luck + 50)));
        return weight;
    }

    @Override
    public String getEventType() {
        return "snake_trap_event";
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> eventData) {
        String message = "Пока вы пробирались сквозь лес, вы не заметили, как оказались прямо перед змеёй, свисающей с ветки.";

        eventData.put("message", message);

        return eventData;
    }

    @Override
    public Map<String, Object> interact(int forestLevel, int luck, Map<String, Object> eventData) {
        String message = null;

        if (eventData.get("type").equals("snake_trap_event")) {
            int escapeChance = 500 + Math.round((float) (100 * luck) / (luck + 100));
            int luckyChance = Math.round((float) (100 * luck) / (luck + 100));

            if (escapeChance > random.nextInt(1001)) {
                eventData.put("type", "trap_escape_event");
                message = "Ваша реакция и ловкость помогли избежать укуса змеи и вы успешно отбились от гада!";
            } else {
                if (luckyChance > random.nextInt(1001)) {
                    eventData.put("type", "trap_escape_event");
                    message = "Удача улыбнулась вам и вы ловким ударом руки расправились с неприятелем!";
                } else {
                    eventData.put("type", "trap_not_escape_event");
                    int damage = Math.round(20 * forestLevel * (1 + (float) random.nextInt(21) / 100));
                    eventData.put("damage", damage);
                    message = "Ни смотря на весь опыт - вам не хватило ни ловкости ни удачи," +
                            " чтобы отбиться от врага и его клыки впиваются в вашу руку, нанося " +damage+ " урона";
                }
            }
        } else {
            eventData.put("type", "trap_escape_event");
            message = "Разделавшись с врагом вы понимаете, что это не была победа и" +
                    " вам еще много предстоит научиться";
        }
        eventData.put("message", message);
        return eventData;
    }
}