package dev.cleanhive.teams;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Document(collection = "teams")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Teams {

    @Id
    private ObjectId id;

    private String teamName;

    // Use List<ObjectId> for employee IDs to support multiple employees
    private List<String> employeeId;

    // ObjectId for the manager
    private String managerId;
}
