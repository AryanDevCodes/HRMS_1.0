package com.workzen.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @Value("${server.port:8081}")
    private String serverPort;
    

    public String storeFile(MultipartFile file, String subDirectory) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Failed to store empty file");
        }
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, subDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        
        // Store file
        Path destinationPath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
        
        return "/uploads/" + subDirectory + "/" + uniqueFilename;
    }
    

    public String storeCompanyLogo(MultipartFile file) throws IOException {
        return storeFile(file, "company-logos");
    }
    

    public String storeProfilePicture(MultipartFile file) throws IOException {
        return storeFile(file, "profile-pictures");
    }
    
    
    public String storeDocument(MultipartFile file) throws IOException {
        return storeFile(file, "documents");
    }

    public void deleteFile(String fileUrl) throws IOException {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        String relativePath = fileUrl.replace("/uploads/", "");
        Path filePath = Paths.get(uploadDir, relativePath);
        
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
    }
    
    /**
     * Validate file type for images
     */
    public boolean isValidImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (
            contentType.equals("image/jpeg") ||
            contentType.equals("image/jpg") ||
            contentType.equals("image/png") ||
            contentType.equals("image/gif") ||
            contentType.equals("image/webp")
        );
    }
    
    /**
     * Validate file size (in bytes)
     */
    public boolean isValidFileSize(MultipartFile file, long maxSizeInBytes) {
        return file.getSize() <= maxSizeInBytes;
    }
}
