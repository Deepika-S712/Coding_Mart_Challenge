package com.sms.repository;

import com.sms.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<User> findById(Long id);
    User save(User user);
    long count();
    List<User> findAll();
    void deleteById(Long id);
    void deleteAll();
}
