require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// import the instantiation of the apollo server
const server = require("./gql-schema/queries.js");

let databaseURL =
  process.env.DATABASE_URL ||
  "mongodb+srv://admin_mongo_db:fjfranklao@qsolutions-6tdfk.mongodb.net/qsolutions?retryWrites=true&w=majority";

mongoose.connect(databaseURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// increase the limit of upload file size
// app.use(bodyParser.json({ limit: "15mb" }));

// allow users to access a folder in the server by serving the static data
// syntax : app.use("/path", express.static("folder to serve"))
// app.use("/images", express.static("images"));

mongoose.connection.once("open", () => {
  console.log("now connected to the online mongodb server");
});

// make the express app be served by ApolloServer
server.applyMiddleware({
  app,
  // path: "/batch47"
});

let port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`🚀 server ready at port ${port}${server.graphqlPath}`);
});
