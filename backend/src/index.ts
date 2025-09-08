import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import auth from "./routes/auth.js";

const app = new Hono();

// CORS middleware
app.use(
  "*",
  cors({
    origin: "http://localhost:5173", // Vite dev server default port
    credentials: true,
  })
);

// Routes
app.route("/api/auth", auth);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
