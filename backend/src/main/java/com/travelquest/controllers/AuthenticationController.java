package com.travelquest.controllers;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.travelquest.dto.AuthenticationRequest;
import com.travelquest.dto.AuthenticationResponse;
import com.travelquest.enums.Role;
import com.travelquest.services.CustomUserDetailsService;
import com.travelquest.utils.JwtUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationManager authManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public AuthenticationResponse login(@RequestBody AuthenticationRequest request) {
        var authToken = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
        authManager.authenticate(authToken);

        var user = userDetailsService.getUserByEmail(request.getEmail());
        String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return new AuthenticationResponse(jwt);
    }

}
