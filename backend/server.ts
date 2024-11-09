import express, { Request, Response } from "express";
import path from "path";
import getDbConnection from "./getDbConnection";
import { Illustration } from "./types";

// <<<<<< Improvement Todos >>>>>>>>
// Step 1: Convert codebase to typescript - Done
// Step 2: The global variable can cause race condition, concurrency issue or an in-memeory issue as the app grows - Done
// Step 3: Use singleton design pattern so we don't have to open a DB connection everytime - Done
// Step 4: Prevent sql injection vulnerability - Done
// Step 5: Change /api/illustrations/:id to patch instead of get since it's an update - Done
// Step 6: Implement error handling and validation to ensure code fail gracefully - Done
// Step 7: Use transactions for update queries - Done
// Step 8: APIs should respond with meaningful response and data - Done
// Step 9: General fixes/refactoring (if needed)

// <<<<<< Access Production Readiness >>>>>>>>
// 1. Pagination to fix illustrations load time - Done
// 2. Proper Error handling - Done
// 3. Build and compile TS into javasctip and have a prod start script

const app = express();
 
app.get("/api/illustrations", async (req: Request, res: Response) => {
  const db = await getDbConnection();
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 100
    const offset = (Number(page) - 1) * Number(limit)
    
    // Introduce transactions to ensure read/write are consistent
    await db.exec("BEGIN TRANSACTION");

    const query = "SELECT * FROM illustrations LIMIT ? OFFSET ?;";
    const illustrations: Illustration = await db.all(query, [limit, offset]);

    // update the impressions count for all illustrations
    await db.exec("UPDATE illustrations SET impressions = impressions + 1");

    // Commit the transaction if everything goes well.
    await db.exec("COMMIT");
    // return reasonable status and response
    return res.status(200).json({
      data: illustrations,
      message: "All illustration retrieved successfully",
    });
  } catch (error) {
    db.each("ROLLBACK");
    console.error("Error fetching illustrations:", error);
    return res
      .status(500)
      .json({ data: null, error: "Error fetching illustrations" });
  }
});

// Update endpoint to patch
app.patch("/api/illustrations/:id", async (req: Request, res: Response) => {
  const db = await getDbConnection();
  try {
    const id = parseInt(req.params.id, 10);

    // Check if Id is a valid string
    if (isNaN(id)) {
      console.log("Invalid ID parameter");
    }

    // Introduce transactions to ensure write is consistent
    await db.exec("BEGIN TRANSACTION");

    // Use parameterized query to prevent SQL injection
    const query = "UPDATE illustrations SET uses = uses + 1 WHERE id = ?";
    await db.run(query, id);

    // Commit the transaction
    await db.exec("COMMIT");

    return res.status(200).json({
      data: null,
      message: `Illustration with id:${id} updated successfully`,
    });
  } catch (error) {
    // Roll Back in case of error
    await db.exec("ROLLBACK");
    return res
      .status(500)
      .json({ data: null, error: "Error updating uses count" });
  }
});

app.use(express.static(path.join(__dirname, ".")));

app.listen(778, () => console.log("Listening to port 778"));
