package com.bookfair.Stall_Reservation.controller;

import com.bookfair.Stall_Reservation.service.ContentService;
import com.bookfair.Stall_Reservation.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final ContentService contentService;
    private final EventService eventService;

    public PublicController(ContentService contentService, EventService eventService) {
        this.contentService = contentService;
        this.eventService = eventService;
    }

    @GetMapping("/home")
    public ResponseEntity<Map<String, String>> home() {
        return ResponseEntity.ok(Map.of(
                "title", contentService.get("home.title"),
                "description", contentService.get("home.description"),
                "videoUrl", contentService.get("home.videoUrl")));
    }

    @GetMapping("/about")
    public ResponseEntity<Map<String, String>> about() {
        return ResponseEntity.ok(Map.of(
                "content", contentService.get("about.content")));
    }

    @GetMapping("/contact")
    public ResponseEntity<Map<String, String>> contact() {
        Map<String, String> result = new LinkedHashMap<>();
        result.put("email", contentService.get("contact.email"));
        result.put("phone", contentService.get("contact.phone"));
        result.put("address", contentService.get("contact.address"));
        result.put("content", contentService.get("contact.content"));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/events/upcoming")
    public ResponseEntity<List<Map<String, Object>>> upcomingEvents() {
        return ResponseEntity.ok(eventService.listUpcoming());
    }
}
