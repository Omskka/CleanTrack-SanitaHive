package dev.cleanhive.rooms;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<Rooms> getAllRooms() {
        return roomRepository.findAll();
    }

    public Rooms saveRoom(Rooms room) {
        return roomRepository.save(room);
    }

    public void deleteRoom(String roomName, String teamId) {
        Optional<Rooms> room = roomRepository.findByRoomNameAndTeamId(roomName, teamId);
        if (room.isPresent()) {
            roomRepository.deleteByRoomNameAndTeamId(roomName, teamId);
        } else {
            throw new RuntimeException("Room not found!");
        }
    }
}