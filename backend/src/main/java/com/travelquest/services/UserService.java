package com.travelquest.services;

import com.travelquest.dto.UserRequestDTO;
import com.travelquest.dto.UserResponseDTO;

public interface UserService {
    UserResponseDTO registerUser(UserRequestDTO userDto);
    UserResponseDTO getUserByEmail(String email);
}
