package dev.cleanhive.rooms;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoomsService {
    @Autowired
    private RoomsRepository roomsRepository;

    // Method to fetch all rooms
    public List<Rooms> allTeams() {
        return roomsRepository.findAll();
    }

    // Save room to db
    public Rooms saveRooms(Rooms rooms) {
        return roomsRepository.save(rooms);
    }
}
