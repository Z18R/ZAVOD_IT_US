const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const port = 5000;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Secret key for JWT (change this for production)
const JWT_SECRET = "password";
// Enable CORS to allow requests from the frontend
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

// MySQL connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // your MySQL username
  password: "", // your MySQL password
  database: "testdb", // your MySQL database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database!");
});

// API endpoint to fetch paginated news for infinite scroll
app.get("/news", (req, res) => {
  const { page = 1, limit = 3 } = req.query; // Default to page 1, limit 3
  const offset = (page - 1) * limit;
  
  const sqlQuery = "SELECT * FROM news LIMIT ? OFFSET ?";
  
  db.query(sqlQuery, [parseInt(limit), parseInt(offset)], (err, results) => {
    if (err) {
      console.error("Error fetching news:", err);
      return res.status(500).send("Error fetching news");
    }
    res.json(results); // Return paginated news data as JSON
  });
});

// API endpoint to fetch news by tag
app.get("/news/tag/:tag", (req, res) => {
  const { tag } = req.params;
  const sqlQuery = "SELECT * FROM news WHERE JSON_CONTAINS(tags, ?)";
  db.query(sqlQuery, [JSON.stringify([tag])], (err, results) => {
    if (err) {
      console.error("Error fetching news by tag:", err);
      return res.status(500).send("Error fetching news by tag");
    }
    res.json(results);
  });
});

// API endpoint to get statistics (views count)
app.get("/news/stats", (req, res) => {
  const sqlQuery = "SELECT SUM(views) AS total_views FROM news";
  
  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Error fetching stats:", err);
      return res.status(500).send("Error fetching stats");
    }
    res.json(results[0]);
  });
});

// API endpoint to create news
app.post("/news", (req, res) => {
  const { title, content, tags, imageUrl } = req.body;
  const sqlQuery = "INSERT INTO news (title, content, tags, imageUrl) VALUES (?, ?, ?, ?)"
  db.query(sqlQuery, [title, content, JSON.stringify(tags), imageUrl], (err, result) => {
    if (err) {
      console.error("Error creating news:", err);
      return res.status(500).send("Error creating news");
    }
    res.status(201).send({
      id: result.insertId,
      title,
      content,
      tags,
      imageUrl,
    });
  });
});

// API endpoint to delete news
app.delete("/news/:title", (req, res) => {
  const { title } = req.params;
  //console.log("Deleting news with ID:", title);

  const sqlQuery = "DELETE FROM news WHERE title = ?";

  db.query(sqlQuery, [title], (err, result) => {
    if (err) {
      console.error("Error deleting news:", err);
      return res.status(500).send("Error deleting news");
    }

    if (result.affectedRows === 0) {
      console.log("No record found with title:", title);
      return res.status(404).send("News not found");
    }

    //console.log("Delete result:", result);
    res.status(200).send({ message: "News deleted successfully" });
  });
});


// API endpoint to like news
app.post("/news/:id/like", (req, res) => {
  const { id } = req.params;
  const sqlQuery = "UPDATE news SET likes = likes + 1 WHERE title = ?";
  
  db.query(sqlQuery, [id], (err, result) => {
    if (err) {
      console.error("Error liking news:", err);
      return res.status(500).send("Error liking news");
    }
    res.status(200).send({ message: "News liked" });
  });
});

// API endpoint to dislike news
app.post("/news/:id/dislike", (req, res) => {
  const { id } = req.params;
  const sqlQuery = "UPDATE news SET likes = likes - 1 WHERE title = ?";
  db.query(sqlQuery, [id], (err, result) => {
    if (err) {
      console.error("Error disliking news:", err);
      return res.status(500).send("Error disliking news");
    }
    res.status(200).send({ message: "News disliked" });
  });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
// API endpoint to fetch top 10 news using stored procedure
app.get("/top10news", (req, res) => {
  const sqlQuery = "CALL GetTop10News()"; // Calling the stored procedure

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Error fetching top 10 news:", err);
      return res.status(500).send("Error fetching top 10 news");
    }
    res.json(results[0]);
  });
});


// Login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  //console.log("Received login request:", username, password);
  const sqlQuery = "SELECT * FROM users WHERE username = ?";
  db.query(sqlQuery, [username], async (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
          console.log("User not found");
          return res.status(401).json({ error: "Invalid username or password" });
      }

      const user = results[0];
     // console.log("User found:", user); 

      const isMatch = await bcrypt.compare(password, user.password_hash);
      //console.log("Password match:", isMatch); 

      if (isMatch) {
          return res.status(401).json({ error: "Invalid username or password" });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, "your_secret_key", { expiresIn: "1h" });

      res.json({ message: "Login successful", token });
  });
});

// Endpoint to get statistics (likes, dislikes, and tags)
app.get("/news/statistics", (req, res) => {
  const sqlQuery = `
    SELECT 
      SUM(likes) AS total_likes, 
      SUM(dislikes) AS total_dislikes,
      (SELECT GROUP_CONCAT(DISTINCT tag) FROM news_tags) AS all_tags
    FROM news
  `;
  
  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Error fetching statistics:", err);
      return res.status(500).send("Error fetching statistics");
    }
    res.json(results[0]);
  });
});
