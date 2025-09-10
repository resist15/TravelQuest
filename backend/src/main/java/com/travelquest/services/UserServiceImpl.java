package com.travelquest.services;

import com.travelquest.dto.UserRequestDTO;
import com.travelquest.dto.UserResponseDTO;
import com.travelquest.entity.User;
import com.travelquest.enums.Role;
import com.travelquest.exceptions.ResourceNotFoundException;
import com.travelquest.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public UserResponseDTO registerUser(UserRequestDTO dto) throws ResourceNotFoundException {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ResourceNotFoundException("User already exists with email: " + dto.getEmail());
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .profilePicture(dto.getProfilePicture())
                .role(Role.USER)
                .build();

        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public void updateName(String username, String newName) throws ResourceNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setName(newName);
        userRepository.save(user);
    }

    @Override
    public UserResponseDTO getUserByEmail(String email) throws ResourceNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return toDTO(user);
    }

    @Override
    @Transactional
    public void setProfilePicture(MultipartFile image, String email) throws ResourceNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        String url = "";
        if (image == null || image.isEmpty()) {
            return;
        }
        try {
            url = cloudinaryService.uploadImage(image,user.getId().toString(),user.getId().toString());
        } catch (IOException e) {
            throw new RuntimeException("Image upload failed", e);
        }
        user.setProfilePicture(url);
        userRepository.save(user);
    }

    private UserResponseDTO toDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setJoinedAt(LocalDateTime.now());
        dto.setProfilePicture(user.getProfilePicture());
        return dto;
    }
}
