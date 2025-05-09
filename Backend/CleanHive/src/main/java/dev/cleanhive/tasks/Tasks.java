package dev.cleanhive.tasks;

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

    // ObjectId for the manager
    private String managerId;

    // ObjectId for the manager
    private String employeeId;

    // Room name
    private String roomName;

    // Task description
    private String description;

    // The starting time
    private String startTime;

    // The ending time
    private String endTime;

    // Questionnaire 1
    private String questionnaireOne;

    // Questionnaire 2
    private String questionnaireTwo;

    // Questionnaire 3
    private String questionnaireThree;

    // Questionnaire 4
    private String questionnaireFour;

    // Task done
    private boolean isDone;

}
