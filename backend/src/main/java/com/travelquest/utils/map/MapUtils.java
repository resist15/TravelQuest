package com.travelquest.utils.map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MapUtils {
    private final ObjectMapper objectMapper;

    @Value("${maptiler.api.key}")
    private String maptilerApiKey;

    public Map<String, String> reverseGeocode(double latitude, double longitude) {
        Map<String, String> result = new HashMap<>();
        result.put("city", null);
        result.put("region", null);
        result.put("country", null);

        try {
            String url = String.format(
                    "https://api.maptiler.com/geocoding/%f,%f.json?key=%s&language=en",
                    longitude, latitude, maptilerApiKey
            );

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.err.println("Non-200 response from MapTiler: " + response.body());
                return result;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode features = root.get("features");

            if (features != null && features.isArray()) {
                for (JsonNode feature : features) {
                    JsonNode placeTypes = feature.get("place_type");
                    String name = feature.get("text").asText();

                    for (JsonNode type : placeTypes) {
                        String typeValue = type.asText();
                        switch (typeValue) {
                            case "place", "locality", "municipality", "localadmin" -> result.putIfAbsent("city", name);
                            case "region", "subregion" -> result.putIfAbsent("region", name);
                            case "country" -> result.putIfAbsent("country", name);
                        }
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("Reverse geocoding failed: " + e.getMessage());
        }

        return result;
    }

}
