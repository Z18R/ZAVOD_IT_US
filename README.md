# ZAVOD_IT_US
ReactAPP-MySql

## Demo Video

Watch the demo of the functionality here: https://youtu.be/eGi2e6rLnGM

# News Portal Project

This project is a simple news portal where you can view and manage news. It uses React for the frontend, MySQL for the backend database, and Express.js to handle API requests. The admin panel allows for creating and deleting news, and the frontend dynamically displays data from the database.

## Prerequisites

Before setting up this project, ensure you have the following:

- **XAMPP** installed to run the MySQL and Apache servers.
- **Node.js** and **npm** installed for running the frontend.
- **MySQL database** with the provided configuration.

---

## Step 1: Set up XAMPP and MySQL

1. **Start XAMPP**:
   - Open XAMPP Control Panel and start the **Apache** and **MySQL** services.

2. **Database connection setup**:
   Use the following credentials to connect to your MySQL database:
   ```js
   const db = mysql.createConnection({
     host: "localhost",
     user: "root", // your MySQL username
     password: "", // your MySQL password
     database: "testdb", // your MySQL database name
   });
3.Create a stored procedure: Open phpMyAdmin on your browser at:

http://localhost/phpmyadmin/index.php?route=/database/routines&type=PROCEDURE&db=testdb


Create a procedure called GetTop10News:

DELIMITER $$
CREATE PROCEDURE GetTop10News()
BEGIN
    SELECT 
        Id,
        Title, 
        Content, 
        Tags, 
        ImageUrl, 
        Likes, 
        Dislikes 
    FROM News
    ORDER BY Id DESC
    LIMIT 10;
END$$
DELIMITER ;


Frontend (React)
1.Install React and Dependencies:

    Navigate to the frontend directory and run:

npx create-react-app news-portal
cd news-portal
npm install react-router-dom axios bootstrap

2.React Routes:

    / → Homepage (Displays a list of news)
    /news → Displays a list of all news
    /news/tag/:tag → Displays news filtered by a specific tag
    /admin → Admin panel for creating and deleting news


3.Bootstrap for styling:

    Add Bootstrap to your index.js:

import 'bootstrap/dist/css/bootstrap.min.css';

4.Example JSON data: Here's an example of the data structure for news in your frontend:

{
  "title": "New Technology Announced",
  "text": "A breakthrough in AI technology has been announced.",
  "tags": ["Technology", "AI"],
  "image": "https://example.com/image.jpg"
}


Step 3: Backend (Express)

    Install Express:
        Navigate to the backend directory and initialize the project:

mkdir backend
cd backend
npm init -y
npm install express mysql body-parser cors

Backend Routes:

    GET /news → Fetch all news.
    POST /news → Create a new news entry.
    DELETE /news/:id → Delete a specific news entry by id.

Example of a simple Express route for fetching news:

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "testdb",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database!");
});

// Get all news
app.get("/news", (req, res) => {
  db.query("SELECT * FROM News", (err, result) => {
    if (err) return res.status(500).send("Error fetching news");
    res.json(result);
  });
});

// Delete news
app.delete("/news/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM News WHERE Id = ?", [id], (err, result) => {
    if (err) return res.status(500).send("Error deleting news");
    res.status(200).send({ message: "News deleted successfully" });
  });
});

// Create news
app.post("/news", (req, res) => {
  const { title, text, tags, image } = req.body;
  const query = "INSERT INTO News (Title, Content, Tags, ImageUrl) VALUES (?, ?, ?, ?)";
  db.query(query, [title, text, JSON.stringify(tags), image], (err, result) => {
    if (err) return res.status(500).send("Error inserting news");
    res.status(201).send({ message: "News created successfully" });
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});


Step 4: Admin Panel and Login Page

    Login Page: Create a simple login page in React to authenticate admins. Example React Login component:

import { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      // Redirect to the Admin Panel
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Login</button>
    </form>
  );
};

Admin Panel: Create an Admin Panel to handle news creation and deletion.



Step 5: Navbar

Your React Navbar could look something like this:

import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <Link className="navbar-brand" to="/">News Portal</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/news">All News</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/news/tag/:tag">By Tag</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/admin">Admin Panel</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};


Developer
Joezer Cardoza
