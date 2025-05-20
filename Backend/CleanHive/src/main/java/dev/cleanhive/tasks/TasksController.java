package dev.cleanhive.tasks;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import dev.cleanhive.rooms.Rooms;

@RestController
@RequestMapping("/api/v1/tasks")
public class TasksController {

    @Autowired
    private TasksService tasksService;

    @Autowired
    private TasksRepository tasksRepository;

    // Get all tasks
    @GetMapping
    public ResponseEntity<List<Tasks>> getAllTasks() {
        return new ResponseEntity<>(tasksService.allTasks(), HttpStatus.OK);
    }

    // Create a new task
    @PostMapping
    public ResponseEntity<Tasks> createTask(@RequestBody Tasks task) {
        Tasks createdTask = tasksService.createTask(task);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    // Mark task as done
    @PutMapping("/{taskId}/complete")
    public ResponseEntity<?> markTaskAsDone(@PathVariable String taskId) {
        Optional<Tasks> taskOptional = tasksRepository.findByTaskId(taskId);
        if (taskOptional.isPresent()) {
            Tasks task = taskOptional.get();
            task.setDone(true); // mark task as done
            tasksRepository.save(task);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
        }
    }

    // Update tasks
    @PutMapping("update/{taskId}")
    public ResponseEntity<?> updateTask(@PathVariable String taskId, @RequestBody Tasks updatedTask) {
        try {
            Tasks task = tasksService.updateTask(taskId, updatedTask);
            return new ResponseEntity<>(task, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // ❗️This is your DELETE route using POST
    @PostMapping("/delete")
    public ResponseEntity<?> deleteTask(@RequestBody Tasks task) {
        try {
            tasksService.deleteTask(task.getTaskId());
            return new ResponseEntity<>("Task deleted successfully!", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // Evaluate task status
    @GetMapping("/{taskId}/status")
    public ResponseEntity<String> getTaskStatus(@PathVariable String taskId) {
        Optional<Tasks> taskOptional = tasksRepository.findByTaskId(taskId);
        if (taskOptional.isPresent()) {
            String status = tasksService.evaluateStatus(taskOptional.get());
            return ResponseEntity.ok(status);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
        }
    }
}
