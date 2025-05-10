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

    public Optional<Teams> getTeamByTeamCode(String teamCode) {
        return teamsRepository.findByManagerIdStartingWith(teamCode);
    }

    public Optional<Teams> getTeamById(String id) {
        return teamsRepository.findById(id);
    }

    public Teams addEmployeeToTeam(Teams team, String employeeId) {
        if (!team.getEmployeeIds().contains(employeeId)) {
            team.getEmployeeIds().add(employeeId);
            return teamsRepository.save(team);
        }
        return team;
    }

    // Fetch team by employeeID
    public Optional<Teams> getTeamByEmployeeId(String employeeId) {
        return teamsRepository.findByEmployeeIdContaining(employeeId);
    }
}