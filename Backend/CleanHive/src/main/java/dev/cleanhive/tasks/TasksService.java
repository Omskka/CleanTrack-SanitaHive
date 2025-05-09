package dev.cleanhive.tasks;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TasksService {

    @Autowired
    private TasksRepository taskRepository;

    // Method to fetch all tasks
    public List<Tasks> allTasks() {
        return taskRepository.findAll();
    }
}
