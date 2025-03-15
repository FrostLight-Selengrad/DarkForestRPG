package com.darkforest.repository;

import com.darkforest.entity.PlayerProgress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerProgressRepository extends JpaRepository<PlayerProgress, Long> {
}