/**
 * This script is used to populate database with fake data
 */
import { Illustration } from "../backend/types";
import getDbConnection from "../backend/getDbConnection";

const fakeImages = (): Illustration[] => {
  return Array.from(Array(100)).map((_, i) => ({
    name: `Illustration ${i + 1}`,
    preview: `https://picsum.photos/seed/${i + 1}/300/300`,
  }));
};

(async () => {
  const db = await getDbConnection();

  // (re-)create illustrations table
  await db.exec("DROP TABLE IF EXISTS illustrations;");
  await db.exec(`CREATE TABLE illustrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, 
        preview TEXT,
        impressions INTEGER DEFAULT 0,
        uses INTEGER DEFAULT 0
        );`);
  await db.exec(
    `INSERT INTO illustrations(name, preview) VALUES${fakeImages().map(
      ({ name, preview }: Illustration) => `("${name}","${preview}") `
    )};`
  );
})();
