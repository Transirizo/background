const notesRouter = require("express").Router();
const Note = require("../models/note");

notesRouter.get("/", async (req, res) => {
	const notes = await Note.find({});
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
	const findNote = await Note.findById(req.params.id);
	if (findNote) {
		res.json(findNote);
	} else {
		res.status(404).end();
	}
});

notesRouter.post("/", async (req, res) => {
	const body = req.body;
	if (body.content === undefined) {
		return res.status(400).json({
			error: "content missing",
		});
	}
	const note = new Note({
		content: body.content,
		important: body.important || false,
		date: new Date(),
	});
	const savedNote = await note.save();
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
