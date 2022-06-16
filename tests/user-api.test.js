const bcrypt = require("bcrypt");
const User = require("../models/user");
const helper = require("./test_helper");
const app = require("../app");
const supertest = require("supertest");

const api = supertest(app);

describe("when there is initially one user in db", () => {
	beforeEach(async () => {
		await User.deleteMany({});
		const passwordHash = await bcrypt.hash("sekret", 10);
		const user = new User({
			username: "root",
			name: "Superuser",
			passwordHash,
		});
		await user.save();
	});

	test("creation succeed with a fresh username", async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: "transirizo",
			name: "Transirizo Chan",
			password: "wodemima",
		};

		await api.post("/api/users").send(newUser).expect(201);

		const usersAtEnd = await helper.usersInDb();
		console.log(usersAtEnd);
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

		const usernames = usersAtEnd.map((user) => user.username);

		expect(usernames).toContain(newUser.username);
	});

	test("creation fails with proper statuscode and message if username already taken", async () => {
		const usersAtStart = await helper.usersInDb();
		const newUser = {
			username: "root",
			name: "Superuser",
			password: "supermima",
		};
		const result = await api.post("/api/users").send(newUser).expect(400);
		expect(result.body.error).toContain("username must be unique");

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toEqual(usersAtStart);
	});
});
