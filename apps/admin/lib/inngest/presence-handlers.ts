import { inngest } from "../inngest"
import { db } from "@quickdash/db"
import { userPresence, pageViewers } from "@quickdash/db/schema"
import { lt } from "@quickdash/db/drizzle"

// Clean up stale presence records every 15 minutes
// Note: Primary presence tracking now uses Redis with auto-expiring keys
// This cron is for DB fallback cleanup only
export const cleanupStalePresence = inngest.createFunction(
	{ id: "cleanup-stale-presence" },
	{ cron: "0 * * * *" }, // Every hour — primary presence is in Redis, this is fallback cleanup only
	async ({ step }) => {
		const staleThreshold = 5 * 60 * 1000 // 5 minutes in ms
		const cutoff = new Date(Date.now() - staleThreshold)

		const deletedPresence = await step.run("cleanup-user-presence", async () => {
			const result = await db
				.delete(userPresence)
				.where(lt(userPresence.lastSeenAt, cutoff))
				.returning({ id: userPresence.id })

			return result.length
		})

		const deletedPageViewers = await step.run("cleanup-page-viewers", async () => {
			const result = await db
				.delete(pageViewers)
				.where(lt(pageViewers.viewingSince, cutoff))
				.returning({ id: pageViewers.id })

			return result.length
		})

		return {
			success: true,
			deletedPresence,
			deletedPageViewers,
		}
	}
)

export const presenceHandlers = [
	cleanupStalePresence,
]
