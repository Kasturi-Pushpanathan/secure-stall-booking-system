package com.bookfair.Stall_Reservation.repository;

import com.bookfair.Stall_Reservation.entity.User;
import com.bookfair.Stall_Reservation.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(UserRole role);

    List<User> findByRoleAndActiveTrue(UserRole role);
}
