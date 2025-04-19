package dev.cleanhive.teams;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TeamsService {
    @Autowired
    private TeamsRepository teamsRepository;

    // Fetch all teams
    public List<Teams> allTeams() {
        return teamsRepository.findAll();
    }

    // Save team to db
    public Teams saveTeams(Teams teams) {
        return teamsRepository.save(teams);
    }

    // 🔥 Get team by managerId (needed for your GET /api/v1/teams/{managerId}
    // route)
    public Optional<Teams> getTeamByManagerId(String managerId) {
        return teamsRepository.findByManagerId(managerId);
    }
}