package com.travelquest.controllers;

import com.travelquest.dto.UserRequestDTO;
import com.travelquest.dto.UserResponseDTO;
import com.travelquest.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserRequestDTO userDto) {
        return ResponseEntity.ok(userService.registerUser(userDto));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getByEmail(Authentication auth) {
        return ResponseEntity.ok(userService.getUserByEmail(auth.getName()));
    }
}
