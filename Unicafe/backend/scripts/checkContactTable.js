import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, "../unicafe.db");
const db = new sqlite3.Database(dbPath);

console.log("Checking database tables...\n");

db.all(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  (err, tables) => {
    if (err) {
      console.error("Error:", err);
      db.close();
      return;
    }

    console.log("All tables:");
    tables.forEach((table) => console.log("  -", table.name));

    const hasContactTable = tables.some((t) => t.name === "contact_messages");
    console.log("\ncontact_messages table exists:", hasContactTable);

    if (hasContactTable) {
      db.all("PRAGMA table_info(contact_messages)", (err, columns) => {
        if (err) {
          console.error("Error getting columns:", err);
        } else {
          console.log("\ncontact_messages columns:");
          columns.forEach((col) => console.log("  -", col.name, ":", col.type));
        }
        db.close();
      });
    } else {
      console.log("\n❌ contact_messages table NOT FOUND!");
      console.log(
        "You need to restart the backend server to run the migration."
      );
      db.close();
    }
  }
);
