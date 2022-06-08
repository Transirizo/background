const mongoose = require("mongoose");

const url = process.env.MONGODB_URL;

console.log("connecting to", url);
console.log("test");
mongoose
	.connect(url)
	.then((res) => {
		console.log("connected to MongoDB");
	})
	.catch((error) => {
		console.log("error conncecting to MongoDB", error.message);
	});

const noteSchema = new mongoose.Schema({
	content: String,
	date: Date,
	important: Boolean,
});

noteSchema.set("toJSON", {
	transform: (document, returnObject) => {
		returnObject.id = returnObject._id.toString();
		delete returnObject._id;
		delete returnObject.__v;
	},
});

module.exports = mongoose.model("Note", noteSchema);
