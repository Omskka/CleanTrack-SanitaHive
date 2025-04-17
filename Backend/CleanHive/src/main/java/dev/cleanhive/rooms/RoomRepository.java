package dev.cleanhive.rooms;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import dev.cleanhive.rooms.Rooms;

public interface RoomRepository extends MongoRepository<Rooms, ObjectId> {
    Optional<Rooms> findByRoomNameAndTeamId(String roomName, String teamId);
    void deleteByRoomNameAndTeamId(String roomName, String teamId);
}