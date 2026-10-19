package edu.sfsu.app.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/game")
public class GameController {

    @PostMapping("/action")
    public Map<String, String> playerAction(
            @RequestBody Map<String, String> request) {

        String action = request.get("action");

        if (action == null || action.isBlank()) {
            return Map.of(
                    "narration",
                    "Please enter an action."
            );
        }

        return Map.of(
                "narration",
                "You chose to: " + action
                        + ". The adventure continues..."
        );
    }
}
