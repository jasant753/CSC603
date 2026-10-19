# Back-End (Spring Boot)

## How to Run

Make sure MongoDB is running locally on port 27017, then:

```bash
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.

---

## Project Structure

```
src/main/java/edu/sfsu/app/
  AppApplication.java         entry point
  controller/
    AuthController.java       all routes
  dto/
    ApiResponse.java          generic response wrapper { status, data, error }
    AuthRequest.java          input DTO for /login and /register
    UserResponse.java         output DTO for user data
  model/
    User.java                 MongoDB document for a user
    AuthToken.java            MongoDB document for a session token
  repository/
    UserRepository.java       reads and writes the users collection
    AuthTokenRepository.java  reads and writes the auth_tokens collection
  config/
    WebConfig.java            CORS configuration
src/main/resources/
  application.properties      port and MongoDB URI
```

---

## DTOs

DTOs (Data Transfer Objects) are plain Java classes used to represent the shape of request bodies and response bodies. They replace raw `Map<String, Object>` with named fields, which makes the code easier to read and extend.

### ApiResponse

Every route returns an `ApiResponse<T>`. The type parameter `T` is the shape of the `data` field.

```json
{ "status": true,  "data": { ... }, "error": null    }
{ "status": false, "data": null,    "error": "reason" }
```

Use the `success()` and `error()` helpers in the controller to build these:

```java
return success(new UserResponse(userName));   // 200 with data
return error(400, "userName is required");    // 400 with error message
```

### Adding a DTO

Create a plain class in the `dto/` package with private fields and getters. Add setters for any field that Spring needs to write (input DTOs need setters; output DTOs do not).

```java
// dto/PostResponse.java
package edu.sfsu.app.dto;

public class PostResponse {
    private String id;
    private String title;
    private String content;

    public PostResponse(String id, String title, String content) {
        this.id = id;
        this.title = title;
        this.content = content;
    }

    public String getId()      { return id; }
    public String getTitle()   { return title; }
    public String getContent() { return content; }
}
```

```java
// dto/CreatePostRequest.java
package edu.sfsu.app.dto;

public class CreatePostRequest {
    private String title;
    private String content;

    public String getTitle()   { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
```

---

## How to Add a New Route

All routes live in `AuthController.java`. To add a new endpoint, add a method with the appropriate annotation.

### GET route

```java
// GET /posts
@GetMapping("/posts")
public ResponseEntity<ApiResponse<Object>> getPosts() {
    List<Post> posts = postRepository.findAll();
    return success(posts);  // Spring serializes the list automatically
}
```

### POST route with a request body DTO

```java
// POST /posts
// Body: { "title": "Hello", "content": "World" }
@PostMapping("/posts")
public ResponseEntity<ApiResponse<Object>> createPost(@RequestBody CreatePostRequest body) {
    if (body.getTitle() == null || body.getTitle().isBlank()) {
        return error(400, "title is required");
    }

    Post post = new Post();
    post.setTitle(body.getTitle());
    post.setContent(body.getContent());
    postRepository.save(post);

    return success(null);
}
```

### GET route with a query parameter

```java
// GET /posts/search?title=hello
@GetMapping("/posts/search")
public ResponseEntity<ApiResponse<Object>> searchPosts(@RequestParam String title) {
    List<Post> results = postRepository.findByTitle(title);
    return success(results);
}

// optional param with a default
@GetMapping("/posts/search")
public ResponseEntity<ApiResponse<Object>> searchPosts(
        @RequestParam(defaultValue = "") String title) {
    // ...
}
```

### Reading the auth cookie in a route

Copy this pattern at the top of any route that requires a logged-in user:

```java
@GetMapping("/myroute")
public ResponseEntity<ApiResponse<Object>> myRoute(HttpServletRequest request) {
    String token = getCookieValue(request, "auth");
    if (token == null) return error(401, "Not logged in");

    Optional<AuthToken> authTokenOpt = authTokenRepository.findByToken(token);
    if (authTokenOpt.isEmpty()) return error(401, "Invalid session");

    String userName = authTokenOpt.get().getUserName();
    // now you have the logged-in user's username
}
```

### Adding a second controller

If you want to split routes into a separate file, create a new class in the `controller/` package:

```java
// controller/PostController.java
package edu.sfsu.app.controller;

import edu.sfsu.app.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<Object>> getPosts() {
        return ResponseEntity.ok(new ApiResponse<>(true, postRepository.findAll(), null));
    }
}
```

Spring picks it up automatically. Copy the `success()` and `error()` helpers from `AuthController` into the new controller if you want to use them.

---

## How MongoDB Works

The connection is configured in `src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/app
```

This connects to a local MongoDB instance and uses a database called `app`. MongoDB creates the database automatically the first time data is inserted, so there is no setup SQL or schema to run.

---

## How to Add a New Collection

A collection in MongoDB is like a table in SQL. To add one, you need a model class, a repository interface, and an `@Autowired` field in a controller.

### Step 1 - Create the Model

Create a file in `model/`. Each field in the class becomes a field in the MongoDB document.

```java
// model/Post.java
package edu.sfsu.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "posts")
public class Post {

    @Id
    private String id;        // auto-generated by MongoDB

    private String userName;
    private String title;
    private String content;

    public String getId()          { return id; }

    public String getUserName()    { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getTitle()       { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent()     { return content; }
    public void setContent(String content) { this.content = content; }
}
```

Every field needs a getter and setter so Spring can read and write the document.

### Step 2 - Create the Repository

Create a file in `repository/`. This interface gives you built-in methods to save, find, and delete documents. Spring generates the implementation automatically.

```java
// repository/PostRepository.java
package edu.sfsu.app.repository;

import edu.sfsu.app.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {

    // Spring generates this query from the method name:
    // db.posts.find({ userName: "..." })
    List<Post> findByUserName(String userName);

    List<Post> findByTitle(String title);
}
```

The method name convention maps directly to MongoDB queries:

| Method name | MongoDB query |
|---|---|
| `findByUserName(String u)` | `{ userName: u }` |
| `findByTitle(String t)` | `{ title: t }` |
| `findByUserNameAndTitle(String u, String t)` | `{ userName: u, title: t }` |

`MongoRepository` also provides built-in methods at no cost:

```java
repository.save(post);           // insert or update
repository.findAll();            // get every document
repository.findById(id);         // find by _id, returns Optional<Post>
repository.deleteById(id);       // delete by _id
repository.delete(post);         // delete a specific object
```

### Step 3 - Inject and Use in a Controller

Add an `@Autowired` field for the repository and call its methods from route handlers:

```java
@Autowired
private PostRepository postRepository;

@GetMapping("/posts")
public ResponseEntity<ApiResponse<Object>> getPosts(HttpServletRequest request) {
    String token = getCookieValue(request, "auth");
    if (token == null) return error(401, "Not logged in");

    Optional<AuthToken> authTokenOpt = authTokenRepository.findByToken(token);
    if (authTokenOpt.isEmpty()) return error(401, "Invalid session");

    String userName = authTokenOpt.get().getUserName();
    List<Post> posts = postRepository.findByUserName(userName);
    return success(posts);
}

@PostMapping("/posts")
public ResponseEntity<ApiResponse<Object>> createPost(
        @RequestBody CreatePostRequest body,
        HttpServletRequest request) {

    String token = getCookieValue(request, "auth");
    if (token == null) return error(401, "Not logged in");

    Optional<AuthToken> authTokenOpt = authTokenRepository.findByToken(token);
    if (authTokenOpt.isEmpty()) return error(401, "Invalid session");

    if (body.getTitle() == null || body.getTitle().isBlank()) {
        return error(400, "title is required");
    }

    Post post = new Post();
    post.setUserName(authTokenOpt.get().getUserName());
    post.setTitle(body.getTitle());
    post.setContent(body.getContent());
    postRepository.save(post);

    return success(null);
}
```

### Checklist for a New Collection

1. Create `model/YourModel.java` with `@Document(collection = "yourCollection")`
2. Add private fields with getters and setters
3. Create `repository/YourModelRepository.java` extending `MongoRepository<YourModel, String>`
4. Add query methods using the `findByFieldName` naming convention
5. Create `dto/YourRequest.java` for the request body (fields + getters + setters)
6. Create `dto/YourResponse.java` for the response data (fields + constructor + getters)
7. Add `@Autowired private YourModelRepository yourModelRepository;` in a controller
8. Write route methods that call `save()`, `findBy...()`, etc. and return `success()` or `error()`
