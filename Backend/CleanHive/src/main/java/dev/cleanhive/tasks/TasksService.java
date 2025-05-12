package dev.cleanhive.tasks;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TasksService {

    @Autowired
    private TasksRepository tasksRepository;

    // Method to fetch all tasks
    public List<Tasks> allTasks() {
        return tasksRepository.findAll();
    }

    public boolean markTaskAsDone(String taskId) {
        Optional<Tasks> opt = tasksRepository.findByTaskId(taskId);
        if (opt.isPresent()) {
            Tasks t = opt.get();
            t.setDone(true);
            tasksRepository.save(t);
            return true;
        }
        return false;
    }

}
