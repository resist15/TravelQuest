package com.travelquest.controllers;

import com.travelquest.dto.UserRequestDTO;
import com.travelquest.dto.UserResponseDTO;
import com.travelquest.exceptions.ResourceNotFoundException;
import com.travelquest.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserRequestDTO userDto) throws ResourceNotFoundException {
        return ResponseEntity.ok(userService.registerUser(userDto));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getByEmail(Authentication auth) throws ResourceNotFoundException {
        return ResponseEntity.ok(userService.getUserByEmail(auth.getName()));
    }

    @PostMapping("/uploadProfile")
    public ResponseEntity<Void> uploadProfilePicture(@RequestParam("file") MultipartFile file, Authentication auth) throws ResourceNotFoundException {
        userService.setProfilePicture(file,auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me/name")
    public ResponseEntity<Void> updateName(
            @RequestParam("name") String name,
            Authentication auth
    ) throws ResourceNotFoundException {
        userService.updateName(auth.getName(), name);
        return ResponseEntity.noContent().build();
    }

}
