package com.sms.service;

import com.sms.config.JwtUtils;
import com.sms.dto.LoginRequestDto;
import com.sms.dto.LoginResponseDto;
import com.sms.entity.User;
import com.sms.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!matches) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtUtils.generateToken(
                user.getUsername(),
                user.getRole().name(),
                user.getFullName()
        );

        return new LoginResponseDto(token, user.getUsername(), user.getFullName(), user.getRole().name());
    }
}
