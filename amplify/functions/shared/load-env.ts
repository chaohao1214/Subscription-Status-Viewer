import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

// Auto-execute on import
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
