package dev.cleanhive.tasks;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import dev.cleanhive.rooms.Rooms;

public interface TasksRepository extends MongoRepository<Tasks, ObjectId> {

}
