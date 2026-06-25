// Vercel serverless entry point. An Express app is itself a (req, res) handler,
// so re-exporting it as the default export lets Vercel run the whole API as one
// function. The vercel.json rewrite sends every /api/* request here, and the
// app's own /api/* routes match on the preserved original URL.
import app from '../server/src/app';

export default app;
