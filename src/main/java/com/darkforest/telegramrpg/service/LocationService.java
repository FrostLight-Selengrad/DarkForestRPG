package com.darkforest.telegramrpg.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

@Service
public class LocationService {
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> getLocationData(String location) {
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream("locations/" + location + ".json")) {
            if (inputStream == null) {
                throw new IOException("Location file not found: " + location);
            }
            return objectMapper.readValue(inputStream, Map.class);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка загрузки данных локации", e);
        }
    }
}