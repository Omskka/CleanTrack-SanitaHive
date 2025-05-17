package dev.cleanhive.tasks;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import dev.cleanhive.rooms.Rooms;

@Service
public class TasksService {

    @Autowired
    private TasksRepository tasksRepository;

    // Method to fetch all tasks
    public List<Tasks> allTasks() {
        return tasksRepository.findAll();
    }

    // Create a new task
    public Tasks createTask(Tasks task) {
        return tasksRepository.save(task);
    }

    // Mark task as done
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

    // Delete tasks
    public void deleteTask(String taskId) {
        Optional<Tasks> task = tasksRepository.findByTaskId(taskId); 
        if (task.isPresent()) {
            tasksRepository.deleteByTaskId(taskId);
        } else {
            throw new RuntimeException("Task not found!");
        }
    }

    // Update tasks
    public Tasks updateTask(String taskId, Tasks updatedTask) {
        Optional<Tasks> existingTaskOpt = tasksRepository.findByTaskId(taskId);
        if (existingTaskOpt.isPresent()) {
            Tasks existingTask = existingTaskOpt.get();

            existingTask.setTitle(updatedTask.getTitle());
            existingTask.setDescription(updatedTask.getDescription());
            existingTask.setStartTime(updatedTask.getStartTime());
            existingTask.setEndTime(updatedTask.getEndTime());
            existingTask.setManagerId(updatedTask.getManagerId());
            existingTask.setEmployeeId(updatedTask.getEmployeeId());
            existingTask.setImageUrl(updatedTask.getImageUrl());
            existingTask.setQuestionnaireOne(updatedTask.getQuestionnaireOne());
            existingTask.setQuestionnaireTwo(updatedTask.getQuestionnaireTwo());
            existingTask.setQuestionnaireThree(updatedTask.getQuestionnaireThree());
            existingTask.setQuestionnaireFour(updatedTask.getQuestionnaireFour());
            existingTask.setDone(updatedTask.isDone());

            return tasksRepository.save(existingTask);
        } else {
            throw new RuntimeException("Task not found with taskId: " + taskId);
        }
    }
}
