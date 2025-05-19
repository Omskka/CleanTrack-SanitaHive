package dev.cleanhive.tasks;

import java.time.Instant;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "tasks")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Tasks {
    @Id
    private ObjectId id;

    // taskId
    private String taskId;

    // ObjectId for the manager
    private String managerId;

    // ObjectId for the employee
    private String employeeId;

    // Room name
    private String title;

    // Task description
    private String description;

    // The starting time
    private Instant startTime;

    // The ending time
    private Instant endTime;

    // URL or file path of the task-related image
    private String imageUrl;

    // Questionnaire 1
    private String questionnaireOne;

    // Questionnaire 2
    private String questionnaireTwo;

    // Questionnaire 3
    private String questionnaireThree;

    // Questionnaire 4
    private String questionnaireFour;

    // Questionnaire 5
    private String questionnaireFive;

    // Task done
    private boolean done;
}
