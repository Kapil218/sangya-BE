import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 10 * 1000, // 10 sec
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 10 sec)
  // Disable the `X-RateLimit-*` headers
  message: { status: 429, message: "Take  is easy!." },
  // Count successful requests (status < 400)
  // store: new rateLimit.MemoryStore(), // Use memory store (default)
});

export { limiter };
