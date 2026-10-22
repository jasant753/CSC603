## Project Structure

```text
capstone-project/
├── compose.yaml                   # Docker Compose configuration for MongoDB
├── .env.example                   # Example environment variables
├── .gitignore                     # Files excluded from Git
├── README.md                      # Project documentation
│
├── back-end/
│   ├── pom.xml                    # Maven dependencies and build configuration
│   └── src/main/
│       ├── java/edu/sfsu/app/
│       │   ├── AppApplication.java        # Spring Boot entry point
│       │   ├── config/
│       │   │   └── WebConfig.java         # CORS configuration
│       │   ├── controller/
│       │   │   └── GameController.java    # Handles player actions
│       │   └── dto/
│       │       └── ApiResponse.java       # Shared API response class
│       └── resources/
│           └── application.properties     # Server port and MongoDB URI
│
└── front-end/
    ├── package.json               # Next.js and React dependencies
    ├── next.config.js             # Next.js configuration
    └── src/app/
        ├── page.js                # Main game interface and player input
        ├── layout.js              # Root layout and application metadata
        └── globals.css            # Global styles
```
### Frontend

The frontend uses **Next.js 15 and React 19**.

- `page.js` contains the main game interface, player input, and API request logic.
- `layout.js` defines the root layout and page metadata.
- `globals.css` controls the application's appearance.
- `next.config.js` contains Next.js configuration and API routing.


### Backend

The backend uses **Java 17, Spring Boot, and MongoDB**.

- `AppApplication.java` starts the Spring Boot application.
- `GameController.java` handles player actions through `POST /api/game/action`.
- `WebConfig.java` configures cross-origin requests from the Next.js frontend.
- `ApiResponse.java` provides a reusable API response structure.
- `application.properties` configures the server port and MongoDB connection.

### Database

MongoDB runs locally using Docker Compose.

The database will eventually store game sessions, player progress, story history, and references to generated images and audio.

The final collection structure will be determined as the gameplay systems are implemented.

### Collection prototypes

### game_session

Stores the current progress of a playthrough.

Retrieve when a player resumes a saved adventure.

```json
{
  "_id": "session_001",
  "title": "The Adventure Begins!",
  "status": "active",
  "createdAt": "2026-10-21T15:00:00Z",
  "updatedAt": "2026-10-21T15:15:00Z",
  "currentState": {
    "location": "Dark Forest",
    "inventory": ["Iron Sword", "Torch"],
    "flags": {
      "metOldWizard": true
    }
  },
  "storySummary": "The player entered the forest and met an old wizard.",
  "lastTurnNumber": 3
}
```

### story_events

Store player actions and the AI-generated response.

When the player enters a new action, the backend can retrieve recent story events and send them to the language model as context.

```json
{
  "_id": "event_003",
  "sessionId": "session_001",
  "turnNumber": 3,
  "playerAction": "I enter the cave",
  "narration": "You step into a dark cave. A strange sound echoes from within.",
  "stateChanges": {
    "location": "Dark Cave",
    "flags": {
      "visitedCave": true
    }
  },
  "createdAt": "2026-10-21T15:15:00Z"
}
```

For example:
Previous events:
1. Player entered the forest.
2. Player met an old wizard.
3. Wizard warned about a cave.

New player action:
"I enter the cave."


### Player Action Workflow Plan

When a player performs an action, the application will process it through the frontend, backend, database, and generative AI model.

1. **Player Action (Next.js)**
    - The player enters an action, such as "I open the chest."
    - The frontend sends the action to the Spring Boot backend.

2. **Retrieve Game Context (Spring Boot + MongoDB)**
    - The backend retrieves the current game session.
    - MongoDB provides the story summary and recent events.

3. **Generate Story Content (Generative AI)**
    - The backend sends the player action and relevant game context to the AI model.
    - The AI generates narration, character dialogue, and proposed changes to the game state.

4. **Update Game State (Spring Boot + MongoDB)**
    - The backend validates the AI's proposed changes.
    - It updates the player's game state and saves the new story event.
    - References to generated images or audio can also be saved.

5. **Display Results (Next.js)**
    - The backend returns the generated story content to the frontend.
    - The frontend displays the narration, dialogue, and any available images or audio.




## Initial Setup

### 1. Install Required Software

Download and install the following:

- **Docker Desktop:** https://www.docker.com/products/docker-desktop/
- **Java JDK 17:** https://adoptium.net/
- **Apache Maven:** https://maven.apache.org/download.cgi
- **Node.js (LTS):** https://nodejs.org/

The following steps assume you're using PowerShell

### 2. Configure MongoDB Credentials

From the **project root**, create a local `.env` file.

Open the file and set your MongoDB credentials.

Example:
```dotenv
MONGO_USER=admin
MONGO_PASSWORD=YOUR_PASSWORD
```

### 3. Start Docker Desktop and MongoDB

Open **Docker Desktop** and wait until the Docker engine is running.

From the project root, start MongoDB:

```powershell
docker compose up -d
```

Verify the container is running:

```powershell
docker compose ps
```

The `adventure-mongodb` container should show a status of `Up`.

### 4. Verify the MongoDB Connection

In PowerShell, run:

```powershell
docker exec -it adventure-mongodb mongosh -u adventureadmin -p --authenticationDatabase admin
```

Enter the password from your `.env` file when prompted.

Once inside MongoDB Shell (`mongosh`), run:

```javascript
db.setup_check.insertOne({ message: "Docker connection works" })
db.setup_check.find()
exit
```

The `find()` command should display the test document.

Typing `exit` returns you to PowerShell.

### 5. Configure and Start the Spring Boot Backend

Open a **new PowerShell terminal**.

Navigate to the backend directory

Set the MongoDB connection string:

```powershell
$env:MONGODB_URI = "mongodb://adventureadmin:YOUR_PASSWORD@localhost:27017/adventure_game?authSource=admin"
```

Replace `YOUR_PASSWORD` with the password from your `.env` file.

Start Spring Boot:

```powershell
mvn spring-boot:run
```

Wait until the backend starts successfully.

The backend runs at:

http://localhost:8080

**Keep this terminal open while developing.**

### 6. Install Frontend Dependencies and Start Next.js

Open another **PowerShell terminal**.

Navigate to the frontend directory

Run the following to install the required packages:

```powershell
npm ci
```

Start Next.js:

```powershell
npm run dev
```

Wait until Next.js displays `Ready`.

The frontend runs at:

http://localhost:3000

**Keep this terminal open while developing.**

### 7. Verify the Application

Open your browser and visit:

http://localhost:3000

You should see the GenAI Adventure interface.


## Daily Setup


### 1. Start Docker Desktop

Open **Docker Desktop** and wait until the Docker engine is running.

### 2. Start MongoDB

Start the MongoDB container:

```powershell
docker compose up -d
```

Verify that MongoDB is running:

```powershell
docker compose ps
```

The `adventure-mongodb` container should show a status of `Up`.

### 3. Start the Spring Boot Backend

Open a **second PowerShell terminal**.

Navigate to the backend directory

Set the MongoDB connection string using the credentials from your local `.env` file:

```powershell
$env:MONGODB_URI = "mongodb://admin:password@localhost:27017/adventure_game?authSource=admin"
```

Replace `password` with your MongoDB password. If you chose a different username, replace `admin` as well.

Start Spring Boot:

```powershell
mvn spring-boot:run
```

Wait for the application to start successfully.

The backend runs at:

http://localhost:8080

**Keep this terminal open while developing.**

### 4. Start the Next.js Frontend

Open a **third PowerShell terminal**.

Navigate to the frontend directory:

```powershell
cd C:\path\to\capstone-project\front-end
```

Start Next.js:

```powershell
npm run dev
```

Wait until Next.js displays `Ready`.

The frontend runs at:

http://localhost:3000

**Keep this terminal open while developing.**

### Quick Reference

| Service     | Start Command          | Port  |
|-------------|------------------------|-------|
| MongoDB     | `docker compose up -d` | 27017 |
| Spring Boot | `mvn spring-boot:run`  | 8080  |
| Next.js     | `npm run dev`          | 3000  |
