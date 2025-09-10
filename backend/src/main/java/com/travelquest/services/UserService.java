package com.travelquest.services;

import com.travelquest.dto.UserRequestDTO;
import com.travelquest.dto.UserResponseDTO;
import com.travelquest.exceptions.ResourceNotFoundException;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    UserResponseDTO registerUser(UserRequestDTO userDto) throws ResourceNotFoundException;
    UserResponseDTO getUserByEmail(String email) throws ResourceNotFoundException;
    void setProfilePicture(MultipartFile file, String image) throws ResourceNotFoundException;
    void updateName(String username, String newName) throws ResourceNotFoundException;
}
