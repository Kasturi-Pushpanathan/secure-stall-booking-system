package com.bookfair.Stall_Reservation.service.impl;

import com.bookfair.Stall_Reservation.entity.Stall;
import com.bookfair.Stall_Reservation.repository.StallRepository;
import com.bookfair.Stall_Reservation.service.StallService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StallServiceImpl implements StallService {

    private final StallRepository stallRepository;

    public StallServiceImpl(StallRepository stallRepository) {
        this.stallRepository = stallRepository;
    }

    @Override
    public List<Stall> getStallsByEventId(Long eventId) {
        return stallRepository.findByEventIdOrderByStallCode(eventId);
    }

    @Override
    public Stall getById(Long id) {
        return stallRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public void toggleBlock(Long stallId, boolean blocked) {
        Stall stall = stallRepository.findById(stallId).orElse(null);
        if (stall != null) {
            stall.setBlocked(blocked);
            stallRepository.save(stall);
        }
    }

    @Override
    @Transactional
    public void saveAll(List<Stall> stalls) {
        stallRepository.saveAll(stalls);
    }
}

