require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI || MONGODB_URI.includes("<username>")) {
  console.warn("WARNING: MONGODB_URI is not set or uses a placeholder. Server will fail to connect to DB.");
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB connection error:", err));

// Counter Schema for auto-incrementing ID
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1 }
});
const Counter = mongoose.model("Counter", counterSchema);

// Student Schema
const studentSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  course: { type: String, required: true, trim: true },
  semester: { type: Number, required: true, min: 1 }
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Pre-save hook to handle auto-incrementing `id`
studentSchema.pre("save", async function() {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "studentId" },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this.id = counter.seq;
  }
});

const Student = mongoose.model("Student", studentSchema);

function validateStudent(body, partial = false) {
  const errors = [];

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim() === "") {
      errors.push("name must be a non-empty string");
    }
  }

  if (!partial || body.email !== undefined) {
    if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.push("email must be a valid email address");
    }
  }

  if (!partial || body.course !== undefined) {
    if (typeof body.course !== "string" || body.course.trim() === "") {
      errors.push("course must be a non-empty string");
    }
  }

  if (!partial || body.semester !== undefined) {
    if (!Number.isInteger(body.semester) || body.semester < 1) {
      errors.push("semester must be an integer greater than or equal to 1");
    }
  }

  return errors;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required: [name, email, course, semester]
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         name:
 *           type: string
 *           example: Aarav Patel
 *         email:
 *           type: string
 *           format: email
 *           example: aarav@example.com
 *         course:
 *           type: string
 *           example: Computer Science
 *         semester:
 *           type: integer
 *           minimum: 1
 *           example: 5
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Validation failed
 *         details:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @openapi
 * /students:
 *   get:
 *     summary: List all students
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Students returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       500:
 *         description: Unexpected server error
 */
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find({}, "-_id -__v");
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: [err.message] });
  }
});

/**
 * @openapi
 * /students/{id}:
 *   get:
 *     summary: Get one student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Student found
 *       404:
 *         description: Student not found
 *       500:
 *         description: Unexpected server error
 */
app.get("/students/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Student not found", details: [`No student exists with id ${req.params.id}`] });
  }

  try {
    const student = await Student.findOne({ id }, "-_id -__v");
    if (!student) {
      return res.status(404).json({ error: "Student not found", details: [`No student exists with id ${id}`] });
    }
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: [err.message] });
  }
});

/**
 * @openapi
 * /students:
 *   post:
 *     summary: Create a student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created
 *       400:
 *         description: Invalid request body
 */
app.post("/students", async (req, res) => {
  const errors = validateStudent(req.body);

  if (errors.length) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  try {
    const existing = await Student.findOne({ email: req.body.email.trim() });
    if (existing) {
      errors.push("email must be unique");
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const student = new Student({
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      course: req.body.course.trim(),
      semester: req.body.semester
    });

    await student.save();
    res.status(201).location(`/students/${student.id}`).json(student);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: [err.message] });
  }
});

/**
 * @openapi
 * /students/{id}:
 *   put:
 *     summary: Replace/update a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Student updated
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Student not found
 */
app.put("/students/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Student not found", details: [`No student exists with id ${req.params.id}`] });
  }

  const errors = validateStudent(req.body);
  if (errors.length) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  try {
    const existingEmail = await Student.findOne({ email: req.body.email.trim(), id: { $ne: id } });
    if (existingEmail) {
      errors.push("email must be unique");
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { id },
      {
        name: req.body.name.trim(),
        email: req.body.email.trim(),
        course: req.body.course.trim(),
        semester: req.body.semester
      },
      { returnDocument: 'after', runValidators: true }
    ).select("-_id -__v");

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found", details: [`No student exists with id ${id}`] });
    }

    res.status(200).json(updatedStudent);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: [err.message] });
  }
});

/**
 * @openapi
 * /students/{id}:
 *   patch:
 *     summary: Partially update a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Student updated
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Student not found
 */
app.patch("/students/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Student not found", details: [`No student exists with id ${req.params.id}`] });
  }

  const allowed = ["name", "email", "course", "semester"];
  const unknown = Object.keys(req.body).filter(k => !allowed.includes(k));
  const errors = validateStudent(req.body, true);

  if (unknown.length) errors.push(`Unknown fields: ${unknown.join(", ")}`);
  if (Object.keys(req.body).length === 0) errors.push("At least one field is required");

  if (errors.length) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  try {
    if (req.body.email !== undefined) {
      const existingEmail = await Student.findOne({ email: req.body.email.trim(), id: { $ne: id } });
      if (existingEmail) {
        errors.push("email must be unique");
        return res.status(400).json({ error: "Validation failed", details: errors });
      }
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.email !== undefined) updates.email = req.body.email.trim();
    if (req.body.course !== undefined) updates.course = req.body.course.trim();
    if (req.body.semester !== undefined) updates.semester = req.body.semester;

    const updatedStudent = await Student.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    ).select("-_id -__v");

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found", details: [`No student exists with id ${id}`] });
    }

    res.status(200).json(updatedStudent);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: [err.message] });
  }
});

/**
 * @openapi
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Student deleted
 *       404:
 *         description: Student not found
 */
app.delete("/students/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Student not found", details: [`No student exists with id ${req.params.id}`] });
  }

  try {
    const deleted = await Student.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ error: "Student not found", details: [`No student exists with id ${id}`] });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: [err.message] });
  }
});

// JSON parse and generic error handling
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON", details: ["Request body contains malformed JSON"] });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error", details: ["Unexpected server-side failure"] });
});

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "RESTful Student Management API",
      version: "1.0.0",
      description: "Lab 4 Student REST API using Express.js and MongoDB Atlas"
    },
    servers: [{ url: `http://localhost:${PORT}` }]
  },
  apis: [__filename]
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/openapi.json", (req, res) => res.json(swaggerSpec));

app.get("/", (req, res) => {
  res.json({
    message: "RESTful Student Management API",
    documentation: "/api-docs",
    openapi: "/openapi.json"
  });
});

app.listen(PORT, () => {
  console.log(`Express Student API running at http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
