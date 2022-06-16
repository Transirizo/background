const notesRouter = require("express").Router();
const Note = require("../models/note");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const getTokenFrom = (req) => {
	const authorization = req.get("authorization");
	if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
		return authorization.substring(7);
	}
	return null;
};

notesRouter.get("/", async (req, res) => {
	const notes = await Note.find({}).populate("user", { username: 1, name: 1 });
	res.json(notes);
});

notesRouter.get("/:id", async (req, res) => {
	// Note.findById(req.params.id)
	// 	.then((note) => {
	// 		if (note) {
	// 			res.json(note);
	// 		} else {
	// 			res.status(404).end();
	// 		}
	// 	})
	// 	.catch((error) => next(error));
	if (req.params.id.length !== 24) {
		return res.status(400).end();
	}

	const findNote = await Note.findById(req.params.id);
	if (findNote) {
		res.json(findNote);
	} else {
		res.status(404).end();
	}
});

notesRouter.post("/", async (req, res) => {
	const body = req.body;
	const token = getTokenFrom(req);
	const decodedToken = jwt.verify(token, process.env.SECRET);

	if (!decodedToken.id) {
		return res.status(401).json({
			error: "token missing or invalid",
		});
	}

	const user = await User.findById(decodedToken.id);

	if (body.content === undefined) {
		return res.status(400).json({
			error: "content missing",
		});
	}

	const note = new Note({
		content: body.content,
		important: body.important || false,
		date: new Date(),
		user: user._id,
	});
	const savedNote = await note.save();
	user.notes = user.notes.concat(savedNote._id);
	await user.save();
	res.status(201).json(savedNote);
	console.log("have saved");
});

notesRouter.delete("/:id", async (req, res) => {
	// Note.findByIdAndRemove(req.params.id)
	// 	.then(() => {
	// 		res.status(204).end();
	// 	})
	// 	.catch((error) => next(error));
	await Note.findByIdAndRemove(req.params.id);
	res.status(204).end();
});

notesRouter.put("/:id", (req, res, next) => {
	const { content, important } = req.body;

	Note.findByIdAndUpdate(
		req.params.id,
		{ content, important },
		{ new: true, runValidators: true, context: "query" }
	)
		.then((updatedNote) => {
			res.json(updatedNote);
		})
		.catch((error) => next(error));
});

module.exports = notesRouter;
