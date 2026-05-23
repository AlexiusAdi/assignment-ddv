import "dotenv/config";

import { startMailingServiceConsumer } from "../lib/mailing-service";

startMailingServiceConsumer().catch((err) => {
  console.error("[consumer-runner] Fatal error:", err);
  process.exit(1);
});
