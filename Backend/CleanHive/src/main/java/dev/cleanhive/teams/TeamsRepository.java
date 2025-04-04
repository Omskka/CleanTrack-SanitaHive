package dev.cleanhive.teams;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamsRepository extends MongoRepository<Teams, ObjectId> {
    // No additional methods are needed if you're just using basic CRUD operations.
}
