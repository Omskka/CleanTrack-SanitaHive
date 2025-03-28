package dev.cleanhive.Users;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Method to fetch all users
    public List<User> allUsers() {
        return userRepository.findAll();
    }

    // Method to save a new user
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Authenticate user by phone number and password
    public Optional<User> authenticateUser(long phoneNumber, String password) {
        return userRepository.findByPhoneNumberAndPassword(phoneNumber, password);
    }
}
