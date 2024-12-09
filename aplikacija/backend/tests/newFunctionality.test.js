const request = require("supertest");

const BASE_URL = "http://localhost:5000";

test("Fetch total hours API with valid dates", async () => {
  const res = await request(BASE_URL)
    .get("/api/entries/total-hours")
    .query({ startDate: "2024-11-01", endDate: "2024-11-30" });

  expect(res.statusCode).toBe(200);
  expect(res.body).toBeInstanceOf(Array);
  expect(res.body[0]).toHaveProperty("employee_id");
  expect(res.body[0]).toHaveProperty("employee_name");
  expect(res.body[0]).toHaveProperty("total_hours");
});

test("Fetch total hours API with no data for given dates", async () => {
    const res = await request("http://localhost:5000")
      .get("/api/entries/total-hours")
      .query({ startDate: "2000-01-01", endDate: "2000-01-31" });
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(0); 
  });
  
  test("Fetch total hours API with missing parameters", async () => {
    const res = await request("http://localhost:5000")
      .get("/api/entries/total-hours")
      .query({ startDate: "2024-11-01" }); 
  
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
  
  test("Fetch total hours API with invalid date format", async () => {
    const res = await request("http://localhost:5000")
      .get("/api/entries/total-hours")
      .query({ startDate: "invalid-date", endDate: "2024-11-30" });
  
    expect(res.statusCode).toBe(400); 
    expect(res.body).toHaveProperty("error");
  });
  
  test("Fetch total hours API for valid dates with partial data", async () => {
    const res = await request("http://localhost:5000")
      .get("/api/entries/total-hours")
      .query({ startDate: "2024-11-01", endDate: "2024-11-15" });
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0); 
    res.body.forEach((employee) => {
      expect(employee).toHaveProperty("employee_id");
      expect(employee).toHaveProperty("employee_name");
      expect(employee).toHaveProperty("total_hours");
    });
  });
  