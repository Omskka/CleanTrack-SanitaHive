package dev.cleanhive.rooms;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import dev.cleanhive.teams.Teams;
import dev.cleanhive.teams.TeamsService;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomsController {

    @Autowired
    private RoomsService roomsService;

    // Get all Rooms
    @GetMapping
    public ResponseEntity<List<Rooms>> getAllRooms() {
        return new ResponseEntity<List<Rooms>>(roomsService.allTeams(), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Rooms> createRoom(@RequestBody Rooms room) {
        Rooms savedRoom = roomsService.saveRooms(room);
        return new ResponseEntity<>(savedRoom, HttpStatus.CREATED);
    }
}
