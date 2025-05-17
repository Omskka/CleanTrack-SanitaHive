package dev.cleanhive.rooms;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    // Fetch all rooms
    public List<Rooms> getAllRooms() {
        return roomRepository.findAll();
    }

    // Save room to team
    public Rooms saveRoom(Rooms room) {
        return roomRepository.save(room);
    }

    // Delete room from team
    public void deleteRoom(String roomId) {
        Optional<Rooms> room = roomRepository.findByRoomId(roomId);
        if (room.isPresent()) {
            roomRepository.deleteByRoomId(roomId);
        } else {
            throw new RuntimeException("Room not found!");
        }
    }
}