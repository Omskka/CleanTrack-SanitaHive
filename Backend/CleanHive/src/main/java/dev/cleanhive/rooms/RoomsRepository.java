package dev.cleanhive.rooms;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import dev.cleanhive.rooms.Rooms;

public interface RoomsRepository extends MongoRepository<Rooms, ObjectId> {
    // No additional methods are needed if you're just using basic CRUD operations.
}
