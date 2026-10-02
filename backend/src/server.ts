import "dotenv/config";
import app from "./app";

const port = Number(process.env.PORT ?? 5000);

app.listen(port, "0.0.0.0", () => {
  console.log(`PlayMate API running on port ${port}`);
});
