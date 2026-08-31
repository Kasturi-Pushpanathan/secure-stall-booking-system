package com.bookfair.Stall_Reservation.service.impl;

import com.bookfair.Stall_Reservation.entity.SiteContent;
import com.bookfair.Stall_Reservation.repository.SiteContentRepository;
import com.bookfair.Stall_Reservation.service.ContentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ContentServiceImpl implements ContentService {

    private final SiteContentRepository repository;

    public ContentServiceImpl(SiteContentRepository repository) {
        this.repository = repository;
    }

    @Override
    public String get(String key) {
        return repository.findByContentKey(key)
                .map(SiteContent::getContentValue)
                .orElse("");
    }

    @Override
    public Map<String, String> getAll(List<String> keys) {
        Map<String, String> result = new LinkedHashMap<>();
        for (String key : keys) {
            result.put(key, get(key));
        }
        return result;
    }

    @Override
    @Transactional
    public void set(String key, String value) {
        SiteContent content = repository.findByContentKey(key).orElse(new SiteContent());
        content.setContentKey(key);
        content.setContentValue(value);
        repository.save(content);
    }

    @Override
    @Transactional
    public void delete(String key) {
        repository.deleteByContentKey(key);
    }
}
