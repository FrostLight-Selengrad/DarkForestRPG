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
        System.out.println("Attempting to load location: " + location);
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream("locations/" + location + ".json")) {
            if (inputStream == null) {
                System.err.println("Location file not found: " + location);
                throw new IOException("Location file not found: " + location);
            }
            Map<String, Object> locationData = objectMapper.readValue(inputStream, Map.class);
            System.out.println("Successfully loaded location data: " + locationData);
            return locationData;
        } catch (IOException e) {
            System.err.println("Error loading location data for " + location + ": " + e.getMessage());
            throw new RuntimeException("Ошибка загрузки данных локации", e);
        }
    }
}