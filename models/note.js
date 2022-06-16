const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
	content: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		required: true,
	},
	important: Boolean,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

noteSchema.set("toJSON", {
	transform: (document, returnObject) => {
		returnObject.id = returnObject._id.toString();
		delete returnObject._id;
		delete returnObject.__v;
	},
});

module.exports = mongoose.model("Note", noteSchema);
