package com.bookfair.Stall_Reservation.repository;

import com.bookfair.Stall_Reservation.entity.SiteContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SiteContentRepository extends JpaRepository<SiteContent, Long> {

    Optional<SiteContent> findByContentKey(String contentKey);

    void deleteByContentKey(String contentKey);
}
