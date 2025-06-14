package dev.cleanhive.tasks;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TasksRepository extends MongoRepository<Tasks, ObjectId> {
    Optional<Tasks> findByTaskId(String taskId);
    Optional<Tasks> deleteByTaskId(String taskId);
}
