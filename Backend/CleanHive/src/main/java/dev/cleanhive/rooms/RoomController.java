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
public class RoomController {

    @Autowired
    private RoomService roomService;

    // Fetch all rooms
    @GetMapping
    public ResponseEntity<List<Rooms>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    // Create new room
    @PostMapping
    public ResponseEntity<Rooms> createRoom(@RequestBody Rooms room) {
        return new ResponseEntity<>(roomService.saveRoom(room), HttpStatus.CREATED);
    }

    // ❗️This is your DELETE route using POST (since DELETE might not be supported)
    @PostMapping("/delete")
    public ResponseEntity<?> deleteRoom(@RequestBody Rooms room) {
        try {
            roomService.deleteRoom(room.getRoomId());
            return new ResponseEntity<>("Room deleted successfully!", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
