package dev.cleanhive.teams;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamsRepository extends MongoRepository<Teams, ObjectId> {
    Optional<Teams> findByManagerId(String managerId);

    Optional<Teams> findByManagerIdStartingWith(String teamCode);

    // Find team by ID
    Optional<Teams> findById(String id);

    // Find team by userID
    Optional<Teams> findByEmployeeIdContaining(String employeeId);

}
