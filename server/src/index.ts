import app from './app';

// Local / long-running server entry point. On Vercel the app is served as a
// serverless function instead (see api/index.ts), so this listen() is only used
// for local development and traditional (non-serverless) hosting.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
