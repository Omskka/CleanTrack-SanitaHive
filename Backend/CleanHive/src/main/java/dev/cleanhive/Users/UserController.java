package dev.cleanhive.Users;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.allUsers());
    }

    // Register a new user with phone number validation
    @PostMapping
    public ResponseEntity<?> addUser(@RequestBody User user) {
        try {
            User createdUser = userService.saveUser(user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // New endpoint to handle login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        Optional<User> authenticatedUser = userService.authenticateUser(user.getPhoneNumber(), user.getPassword());

        if (authenticatedUser.isPresent()) {
            return new ResponseEntity<>(authenticatedUser.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid phone number or password", HttpStatus.UNAUTHORIZED);
        }
    }

}
