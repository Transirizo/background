const notesRouter = require("./controllers/notes");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const config = require("./utils/config");
const middleware = require("./utils/middleware");
app.use(cors());

logger.info("connecting to", config.MONGODB_URL);

mongoose
	.connect(config.MONGODB_URL)
	.then(() => {
		logger.info("connected to MongoDB");
	})
	.catch((error) => {
		logger.error("error conncecting to MongoDB", error.message);
	});

app.use(express.json());
app.use(express.static("build"));

app.use(middleware.requestLogger);

app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
