const logger = require("./logger");

const errorHandler = (error, req, res, next) => {
	logger.error(error.message);
	if (error.name === "CastError") {
		return res.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return res.status(400).json({ error: error.message });
	} else if (error.name === "JsonWebTokenErrors") {
		return res.status(401).json({ error: "invalid token" });
	} else if (error.name === "TokenExpiredError") {
		return response.status(401).json({
			error: "token expired",
		});
	}

	next(error);
};

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: "unknown endpoint" });
};

const requestLogger = (req, res, next) => {
	logger.info("Method:", req.method);
	logger.info("Path: ", req.path);
	logger.info("Body: ", req.body);
	logger.info("---");
	next();
};

module.exports = {
	errorHandler,
	unknownEndpoint,
	requestLogger,
};
