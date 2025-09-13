import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import auth from "./routes/auth.js";
import onboarding from "./routes/onboarding.js";
import productRoute from "./routes/productRoute.js";
import orderRoute from "./routes/orderRoute.js";
import onboardingCharity from "./routes/onboardingCharity.js";

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
app.route("/api/onboardingcharity", onboardingCharity)
app.route("/api/onboarding", onboarding);
app.route("/api/productRoute", productRoute);
app.route("/api/orderRoute", orderRoute)

app.get("/", (c) => {
  return c.text("Muahahaha dor!");
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
