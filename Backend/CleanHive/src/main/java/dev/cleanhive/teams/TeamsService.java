package dev.cleanhive.teams;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TeamsService {
    @Autowired
    private TeamsRepository teamsRepository;

    // Method to fetch all teams
    public List<Teams> allTeams() {
        return teamsRepository.findAll();
    }

    public Teams saveTeams(Teams teams) {
        return teamsRepository.save(teams);
    }
}
