const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

const bcrypt = require("bcrypt");
const dbPath = path.join(__dirname, "userData.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const passwordLength = password.length;
  //   console.log(passwordLength);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
            INSERT INTO
                user (username,name,password,gender,location)
            VALUES ('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
    await db.run(createUserQuery);
    response.send("User created successfully");
  } else if (dbUser !== undefined && passwordLength < 5) {
    response.status(400);
    response.send("Password is too short");
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

// app.post();
