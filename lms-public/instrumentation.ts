/**
 * Next.js instrumentation (runs when Node runtime loads).
 * Prevents unhandled promise rejections from crashing the process (e.g. after deploy mismatch).
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("unhandledRejection", (reason, promise) => {
      console.error("[lms-public] Unhandled Rejection at:", promise, "reason:", reason);
      // Don't rethrow - avoid process exit. The request may still return 500.
    });
  }
}
