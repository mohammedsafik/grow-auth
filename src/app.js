const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorMiddleware = require("./middlewares/error.middleware");
const authRoutes = require("./modules/auth/auth.routes");
const cookieParser = require("cookie-parser");
const kycRoutes = require("./modules/kyc.routes");




const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("Cookies received:", req.cookies);
  console.log("Raw cookie header:", req.headers.cookie);

  next();
});

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4200",
  "http://192.168.1.21:4200",
  "https://nhvtkx2d-4200.inc1.devtunnels.ms",
  "https://stainable-gorgeous-snowsuit.ngrok-free.dev"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Groww Clone API is running",
  });
});



// routes will come hereconst authRoutes = require("./modules/auth/auth.routes");

app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);

app.use(errorMiddleware);

module.exports = app;