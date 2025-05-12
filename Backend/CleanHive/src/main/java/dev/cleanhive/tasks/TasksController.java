package dev.cleanhive.tasks;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
public class TasksController {

    @Autowired
    private TasksService tasksService;

    // Get all tasks
    @GetMapping
    public ResponseEntity<List<Tasks>> getAllTasks() {
        return new ResponseEntity<>(tasksService.allTasks(), HttpStatus.OK);
    }

    @Autowired
    private TasksRepository tasksRepository;

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
}
