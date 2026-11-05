import "dotenv/config";

console.log("API key loaded:", !!process.env.GOOGLE_API_KEY);

const { default: app } = await import("./app.js");
const { connectDB } = await import("./config/database.js");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();