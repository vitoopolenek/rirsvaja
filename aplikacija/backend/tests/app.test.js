const request = require("supertest");

const BASE_URL = "http://localhost:5001"; // Use the running server's URL

describe("API Tests with Running Server", () => {
  it("should fetch all employees", async () => {
    const response = await request(BASE_URL).get("/api/employees");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0); // Ensure employees exist
  });

  it("should login successfully with valid credentials for bob", async () => {
    const response = await request(BASE_URL).post("/api/login").send({
      username: "bob",
      password: "geslo123",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.username).toBe("bob");
  });

  it("should login successfully with valid credentials for jane", async () => {
    const response = await request(BASE_URL).post("/api/login").send({
      username: "jane",
      password: "geslo123",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.username).toBe("jane");
  });

  it("should fail login with invalid credentials", async () => {
    const response = await request(BASE_URL).post("/api/login").send({
      username: "invalid_user",
      password: "wrong_password",
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should fetch work entries for employee ID 1", async () => {
    const response = await request(BASE_URL).get("/api/entries").query({
      employeeId: 1,
    });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0); // Ensure entries exist for employee ID 1
  });

  it("should return empty work entries for invalid employee ID", async () => {
    const response = await request(BASE_URL).get("/api/entries").query({
      employeeId: 9999, // Non-existent employee ID
    });
    expect(response.status).toBe(404);
    expect(response.body.length).toBe(undefined);
  });

  it("should update a work entry for ID 1", async () => {
    const response = await request(BASE_URL).put("/api/entries/1").send({
      hoursWorked: 10,
      date: "2024-11-21",
      description: "Updated work entry",
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Data updated successfully");
  });

  it("should fetch monthly hours for employee ID 1 in November", async () => {
    const response = await request(BASE_URL).get("/api/entries/month").query({
      employeeId: 1,
      month: 11,
    });
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0); // Ensure monthly hours exist for employee ID 1
  });


  it("should fail to update a non-existent work entry", async () => {
    const response = await request(BASE_URL).put("/api/entries/9999").send({
      hoursWorked: 5,
      date: "2024-11-21",
      description: "Non-existent entry",
    });
    expect(response.status).toBe(404); // Assume 404 is returned for non-existent entries
  });
});