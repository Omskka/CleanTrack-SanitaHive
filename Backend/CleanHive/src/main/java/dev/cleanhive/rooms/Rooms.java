package dev.cleanhive.rooms;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Document(collection = "rooms")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Rooms {

    @Id
    private ObjectId id;

    private String roomId;

    private String roomName;

    private String roomFloor;

    private String teamId;
}
