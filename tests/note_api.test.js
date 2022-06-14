const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const api = supertest(app);

const Note = require("../models/note");

//测试开始的设置，设定一个数组包含两个note对象
beforeEach(async () => {
	await Note.deleteMany({});
	// console.log("cleared");
	/*并行执行承诺
	const noteObject = helper.initialNotes.map((note) => new Note(note));
	const promiseArray = noteObject.map((note) => note.save());
	await Promise.all(promiseArray);
    */

	/*按顺序执行
    for (let note of helper.initialNotes) {
		let noteObject = new Note(note);
		await noteObject.save();
	}
    */
	await Note.insertMany(helper.initialNotes);
	// console.log("done");
});

describe("when there is initially some notes saved", () => {
	//测试是否能返回json格式的数据
	test("notes are returned as json", async () => {
		await api
			.get("/api/notes")
			.expect(200)
			.expect("Content-Type", /application\/json/);
	}, 100000);

	//测试是否能get到所有的note
	test("all notes are returned", async () => {
		const response = await api.get("/api/notes");
		console.log(response.body);
		const notesAtEnd = await helper.notesInDb();
		console.log(notesAtEnd);
		expect(response.body).toHaveLength(helper.initialNotes.length);
	});

	//测试一个note是否被包含在数据库的所有notes里
	test("a special note is within the returned notes", async () => {
		const response = await api.get("/api/notes");
		const contents = response.body.map((note) => note.content);
		expect(contents).toContain("Browser can execute only Javascript");
	});
});

describe("viewing a specific note", () => {
	//测试合法的id能否找到note并查看
	test("succceeds with a vail id", async () => {
		const notesAtStart = await helper.notesInDb();
		const noteToView = notesAtStart[0];
		const resultNote = await api.get(`/api/notes/${noteToView.id}`).expect(200);
		const processedNoteToView = JSON.parse(JSON.stringify(noteToView));
		expect(resultNote.body).toEqual(processedNoteToView);
	});
	//测试不存在的id能否正确返回状态码404
	test("fail with statuscode 404 if note does not exist", async () => {
		const validNoneexistingId = await helper.nonExistingId();
		await api.get(`/api/notes/${validNoneexistingId}`).expect(404);
	});
	//测试不合法的id能否正确返回状态码400
	test("fails with statuscode 400 id is invalid", async () => {
		const invalidId = "5a3d5da5070081a82a32445";
		await api.get(`/api/notes/${invalidId}`).expect(400);
	});
});

describe("addition of a new note", () => {
	//测试合法的note是否可以被添加进数据库
	test("succeed with valid data", async () => {
		const newNote = {
			content: "asyne/await simplifies making async calls",
			important: true,
		};
		await api
			.post("/api/notes")
			.send(newNote)
			.expect(201)
			.expect("Content-Type", /application\/json/);

		const notesAtEnd = await helper.notesInDb();
		expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

		const contents = notesAtEnd.map((note) => note.content);
		expect(contents).toContain("asyne/await simplifies making async calls");
	});

	//测试没有content的note是否无法被添加到数据库
	test("fails with status code 400 if data invalid", async () => {
		const newNote = {
			important: true,
		};
		await api.post("/api/notes").send(newNote).expect(400);

		const notesAtEnd = await helper.notesInDb();

		expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
	});
});
describe("deletion of a note", () => {
	//测试note能否被删除
	test("succeed with status code 204 if id is valid", async () => {
		const notesAtStart = await helper.notesInDb();
		const noteToDelete = notesAtStart[0];

		await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

		const notesAtEnd = await helper.notesInDb();
		expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);
		const contents = notesAtEnd.map((note) => note.content);

		expect(contents).not.toContain(noteToDelete.content);
	});
});

afterAll(() => {
	mongoose.connection.close();
});
