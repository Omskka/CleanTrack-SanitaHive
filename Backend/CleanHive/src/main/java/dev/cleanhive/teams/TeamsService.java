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

    // Add employees to the team
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

    // Remove member from team
    public void removeTeamMember(String managerId, String employeeId) {
        // Find the team by its managerId (NOT by _id)
        Teams team = teamsRepository.findByManagerId(managerId)
                .orElseThrow(() -> new RuntimeException("Team not found with manager ID: " + managerId));

        List<String> employees = team.getEmployeeId();

        if (!employees.remove(employeeId)) {
            throw new RuntimeException("Employee ID not found in team: " + employeeId);
        }

        team.setEmployeeId(employees);
        teamsRepository.save(team);
    }

}