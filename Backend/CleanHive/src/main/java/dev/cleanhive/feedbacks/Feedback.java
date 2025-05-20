package dev.cleanhive.feedbacks;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Document(collection = "feedbacks")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Feedback {
    @Id
    private ObjectId id;

    // FeedbackId
    private String feedbackId;

    // RoomId
    private String roomId;

    // Rating
    private int rating;

    // Category
    private String category;

    // Description
    private String description;

    // Submission time
    private String submissionTime;
}
