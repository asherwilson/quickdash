"use server"

import { eq, and, desc, count, inArray } from "@quickdash/db/drizzle"
import { db } from "@quickdash/db/client"
import { reviews, users } from "@quickdash/db/schema"
import { logAudit } from "@/lib/audit"
import { requireWorkspace, checkWorkspacePermission } from "@/lib/workspace"

async function requireReviewsPermission() {
	const workspace = await requireWorkspace()
	const canManage = await checkWorkspacePermission("canManageProducts")
	if (!canManage) {
		throw new Error("You don't have permission to manage reviews")
	}
	return workspace
}

interface GetReviewsParams {
	page?: number
	pageSize?: number
	status?: string
}

export async function getReviews(params: GetReviewsParams = {}) {
	const workspace = await requireWorkspace()
	const { page = 1, pageSize = 25, status } = params
	const offset = (page - 1) * pageSize

	const conditions = [
		eq(reviews.workspaceId, workspace.id),
	]

	if (status && status !== "all") {
		conditions.push(eq(reviews.status, status))
	}

	const where = and(...conditions)

	const [items, [total]] = await Promise.all([
		db
			.select({
				id: reviews.id,
				reviewerName: users.name,
				reviewerEmail: users.email,
				rating: reviews.rating,
				title: reviews.title,
				content: reviews.body,
				status: reviews.status,
				isFeatured: reviews.isVerifiedPurchase,
				createdAt: reviews.createdAt,
			})
			.from(reviews)
			.innerJoin(users, eq(reviews.userId, users.id))
			.where(where)
			.orderBy(desc(reviews.createdAt))
			.limit(pageSize)
			.offset(offset),
		db.select({ count: count() }).from(reviews).where(where),
	])

	return {
		items: items.map((item) => ({
			...item,
			content: item.content ?? "",
			isFeatured: item.isFeatured ?? false,
		})),
		totalCount: Number(total.count),
	}
}

export async function getReview(id: string) {
	const workspace = await requireWorkspace()

	const [entry] = await db
		.select({
			id: reviews.id,
			reviewerName: users.name,
			reviewerEmail: users.email,
			rating: reviews.rating,
			title: reviews.title,
			content: reviews.body,
			status: reviews.status,
			isFeatured: reviews.isVerifiedPurchase,
			createdAt: reviews.createdAt,
			updatedAt: reviews.updatedAt,
		})
		.from(reviews)
		.innerJoin(users, eq(reviews.userId, users.id))
		.where(
			and(
				eq(reviews.id, id),
				eq(reviews.workspaceId, workspace.id)
			)
		)
		.limit(1)

	if (!entry) throw new Error("Review not found")
	return {
		...entry,
		content: entry.content ?? "",
		isFeatured: entry.isFeatured ?? false,
	}
}

export async function moderateReview(id: string, status: "approved" | "rejected") {
	const workspace = await requireReviewsPermission()

	const [entry] = await db
		.select({ id: reviews.id })
		.from(reviews)
		.where(
			and(
				eq(reviews.id, id),
				eq(reviews.workspaceId, workspace.id)
			)
		)
		.limit(1)

	if (!entry) throw new Error("Review not found")

	await db
		.update(reviews)
		.set({ status, updatedAt: new Date(), moderatedAt: new Date() })
		.where(eq(reviews.id, id))

	await logAudit({
		action: "product.updated",
		targetType: "review",
		targetId: id,
		metadata: { action: `review_${status}` },
	})

	return { id, status }
}

export async function toggleFeatured(id: string, isFeatured: boolean) {
	const workspace = await requireReviewsPermission()

	const [entry] = await db
		.select({ id: reviews.id })
		.from(reviews)
		.where(
			and(
				eq(reviews.id, id),
				eq(reviews.workspaceId, workspace.id)
			)
		)
		.limit(1)

	if (!entry) throw new Error("Review not found")

	await db
		.update(reviews)
		.set({ isVerifiedPurchase: isFeatured, updatedAt: new Date() })
		.where(eq(reviews.id, id))

	return { id, isFeatured }
}

export async function deleteReview(id: string) {
	const workspace = await requireReviewsPermission()

	const [entry] = await db
		.select({ id: reviews.id })
		.from(reviews)
		.where(
			and(
				eq(reviews.id, id),
				eq(reviews.workspaceId, workspace.id)
			)
		)
		.limit(1)

	if (!entry) throw new Error("Review not found")

	await db.delete(reviews).where(eq(reviews.id, id))

	await logAudit({
		action: "product.deleted",
		targetType: "review",
		targetId: id,
		metadata: { action: "review_deleted" },
	})
}

export async function bulkModerate(ids: string[], status: "approved" | "rejected") {
	const workspace = await requireReviewsPermission()

	const entries = await db
		.select({ id: reviews.id })
		.from(reviews)
		.where(
			and(
				inArray(reviews.id, ids),
				eq(reviews.workspaceId, workspace.id)
			)
		)

	if (entries.length === 0) return

	await db
		.update(reviews)
		.set({ status, updatedAt: new Date(), moderatedAt: new Date() })
		.where(inArray(reviews.id, entries.map((entry) => entry.id)))

	await logAudit({
		action: "product.updated",
		targetType: "review",
		metadata: { action: `bulk_${status}`, count: entries.length },
	})
}
