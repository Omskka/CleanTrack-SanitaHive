package dev.cleanhive.teams;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}