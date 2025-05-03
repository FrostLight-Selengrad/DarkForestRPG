package com.darkforest.telegramrpg.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@Service
public class LocationService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Получение данных локации
    public Map<String, Object> getLocationData(String location) {
        try {
            return objectMapper.readValue(new File("locations/" + location + ".json"), Map.class);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка загрузки данных локации", e);
        }
    }
}