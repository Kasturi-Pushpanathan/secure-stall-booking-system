package com.bookfair.Stall_Reservation.controller.admin;

import com.bookfair.Stall_Reservation.service.ContentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/content")
public class AdminContentController {

    private static final List<String> EDITABLE_KEYS = List.of(
            "home.title",
            "home.description",
            "home.videoUrl",
            "contact.email",
            "contact.phone",
            "contact.address",
            "contact.content");

    private static final List<String> ALLOWED_VIDEO_TYPES = List.of(
            "video/mp4", "video/webm", "video/ogg");

    private final ContentService contentService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public AdminContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    /** Get all editable site content */
    @GetMapping
    public ResponseEntity<Map<String, String>> getAll() {
        return ResponseEntity.ok(contentService.getAll(EDITABLE_KEYS));
    }

    /** Update site content — accepts a map of key→value pairs */
    @PutMapping
    public ResponseEntity<Map<String, String>> update(@RequestBody Map<String, String> body) {
        for (Map.Entry<String, String> entry : body.entrySet()) {
            if (EDITABLE_KEYS.contains(entry.getKey())) {
                contentService.set(entry.getKey(), entry.getValue());
            }
        }
        return ResponseEntity.ok(contentService.getAll(EDITABLE_KEYS));
    }

    /** Upload a video file and store its URL in home.videoUrl */
    @PostMapping("/upload-video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No file selected"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_VIDEO_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Only MP4, WebM, and OGG video formats are allowed"));
        }

        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, "videos");
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }
        String filename = "home-video-" + UUID.randomUUID().toString().substring(0, 8) + extension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Store the served URL in site content
        String videoUrl = "/uploads/videos/" + filename;
        contentService.set("home.videoUrl", videoUrl);

        return ResponseEntity.ok(Map.of(
                "message", "Video uploaded successfully",
                "videoUrl", videoUrl));
    }

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp");

    /** Upload an image file and return its URL */
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No file selected"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Only JPEG, PNG, GIF, and WebP image formats are allowed"));
        }

        Path uploadPath = Paths.get(uploadDir, "images");
        Files.createDirectories(uploadPath);

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }
        String filename = "event-" + UUID.randomUUID().toString().substring(0, 8) + extension;

        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String imageUrl = "/uploads/images/" + filename;
        return ResponseEntity.ok(Map.of(
                "message", "Image uploaded successfully",
                "url", imageUrl));
    }

    /** Delete about page content */
    @DeleteMapping("/about")
    public ResponseEntity<Void> deleteAbout() {
        contentService.delete("about.content");
        return ResponseEntity.noContent().build();
    }
}
