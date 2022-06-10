const notesRouter = require("./controllers/notes");
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const config = require("./utils/config");
const middleware = require("./utils/middleware");

logger.info("connecting to", config.MONGODB_URL);

mongoose
	.connect(config.MONGODB_URL)
	.then(() => {
		logger.info("connected to MongoDB");
	})
	.catch((error) => {
		logger.error("error conncecting to MongoDB", error.message);
	});

app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use(middleware.requestLogger);

app.use("/api/notes", notesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
