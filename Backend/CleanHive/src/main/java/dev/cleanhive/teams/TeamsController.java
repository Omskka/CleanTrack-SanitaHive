package dev.cleanhive.teams;

import java.util.List;
import java.util.Optional;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import dev.cleanhive.rooms.Rooms;

@RestController
@RequestMapping("/api/v1/teams")
public class TeamsController {

    @Autowired
    private TeamsService teamsService;

    // Get all Teams
    @GetMapping
    public ResponseEntity<List<Teams>> getAllTeams() {
        return new ResponseEntity<>(teamsService.allTeams(), HttpStatus.OK);
    }

    // Get team by managerId
    @GetMapping("/{managerId}")
    public ResponseEntity<Teams> getTeamByManagerId(@PathVariable String managerId) {
        Optional<Teams> team = teamsService.getTeamByManagerId(managerId);
        return team.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new team
    @PostMapping
    public ResponseEntity<Teams> createTeam(@RequestBody Teams team) {
        Teams savedTeam = teamsService.saveTeams(team);
        return new ResponseEntity<>(savedTeam, HttpStatus.CREATED);
    }

    @GetMapping("/by-teamcode/{teamCode}")
    public ResponseEntity<Teams> getTeamByTeamCode(@PathVariable String teamCode) {
        Optional<Teams> team = teamsService.getTeamByTeamCode(teamCode);
        return team.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/add-employee/{managerId}")
    public ResponseEntity<Teams> addEmployeeToTeam(@PathVariable String managerId,
            @RequestBody Map<String, String> body) {
        String employeeId = body.get("employeeId");
        Optional<Teams> teamOptional = teamsService.getTeamByManagerId(managerId); // ← Use managerId to get the team

        if (teamOptional.isPresent()) {
            Teams updatedTeam = teamsService.addEmployeeToTeam(teamOptional.get(), employeeId);
            return ResponseEntity.ok(updatedTeam);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/by-employee/{employeeId}")
    public ResponseEntity<Teams> getTeamByEmployeeId(@PathVariable String employeeId) {
        Optional<Teams> team = teamsService.getTeamByEmployeeId(employeeId);
        return team.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ❗️Remove member from team
    @PostMapping("/remove-member")
    public ResponseEntity<?> removeTeamMember(@RequestBody Map<String, String> payload) {
        try {
            String managerId = payload.get("managerId");
            String employeeId = payload.get("employeeId");

            teamsService.removeTeamMember(managerId, employeeId);
            return new ResponseEntity<>("Member removed from team successfully!", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}