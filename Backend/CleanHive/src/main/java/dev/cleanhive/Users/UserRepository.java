package dev.cleanhive.Users;

import java.util.Optional;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, ObjectId> {
    
    // Find user by phone number and password (for login)
    Optional<User> findByPhoneNumberAndPassword(String phoneNumber, String password);
    
    // Check if a user already exists by phone number
    Optional<User> findByPhoneNumber(String phoneNumber);
}