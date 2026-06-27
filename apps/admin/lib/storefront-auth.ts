import { db } from "@quickdash/db/client"
import { eq, and, inArray } from "@quickdash/db/drizzle"
import { storefronts, workspaces, users, storeSettings } from "@quickdash/db/schema"
import type { NextRequest } from "next/server"

export type StorefrontContext = {
	id: string
	workspaceId: string
	name: string
	domain: string | null
	permissions: {
		products: boolean
		orders: boolean
		customers: boolean
		checkout: boolean
		inventory: boolean
	}
}

export type StorefrontAuthResult =
	| { success: true; storefront: StorefrontContext }
	| { success: false; error: string; status: number }

/**
 * Validate a storefront API request
 * Checks the X-Storefront-Key header against the database
 */
export async function validateStorefrontRequest(
	request: NextRequest
): Promise<StorefrontAuthResult> {
	const apiKey = request.headers.get("X-Storefront-Key")

	if (!apiKey) {
		return {
			success: false,
			error: "Missing X-Storefront-Key header",
			status: 401,
		}
	}

	// Look up storefront by API key, join workspace owner for subscription status
	const [result] = await db
		.select({
			storefront: storefronts,
			workspace: workspaces,
			ownerSubscriptionStatus: users.subscriptionStatus,
		})
		.from(storefronts)
		.innerJoin(workspaces, eq(storefronts.workspaceId, workspaces.id))
		.innerJoin(users, eq(workspaces.ownerId, users.id))
		.where(eq(storefronts.apiKey, apiKey))
		.limit(1)

	if (!result) {
		return {
			success: false,
			error: "Invalid API key",
			status: 401,
		}
	}

	if (!result.storefront.isActive) {
		return {
			success: false,
			error: "Storefront is disabled",
			status: 403,
		}
	}

	// Check workspace owner's subscription status
	if (result.ownerSubscriptionStatus === "canceled") {
		return {
			success: false,
			error: "Workspace subscription is inactive",
			status: 403,
		}
	}

	return {
		success: true,
		storefront: {
			id: result.storefront.id,
			workspaceId: result.storefront.workspaceId,
			name: result.storefront.name,
			domain: result.storefront.domain,
			permissions: result.storefront.permissions ?? {
				products: true,
				orders: true,
				customers: true,
				checkout: true,
				inventory: false,
			},
		},
	}
}

/**
 * Validate storefront has permission for a specific action
 */
export function checkStorefrontPermission(
	storefront: StorefrontContext,
	permission: keyof StorefrontContext["permissions"]
): boolean {
	return storefront.permissions[permission] ?? false
}

/**
 * Build CORS headers, optionally scoped to a storefront's domain
 */
function buildCorsHeaders(origin?: string | null): Record<string, string> {
	return {
		"Access-Control-Allow-Origin": origin || "*",
		"Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, X-Storefront-Key, Authorization",
		...(origin ? { "Vary": "Origin" } : {}),
	}
}

// Default CORS headers (used for error responses before storefront is resolved)
const defaultCorsHeaders = buildCorsHeaders()

function normalizeStorefrontHost(domain?: string | null): string | null {
	if (!domain) {
		return null
	}

	try {
		return new URL(domain.includes("://") ? domain : `https://${domain}`).hostname
	} catch {
		return domain.replace(/^https?:\/\//, "").split("/")[0] || null
	}
}

function originForHost(host: string): string {
	return `https://${host}`
}

function allowedCorsOrigin(requestOrigin: string | null, storefrontDomain: string | null) {
	const storefrontHost = normalizeStorefrontHost(storefrontDomain)

	if (!requestOrigin) {
		return storefrontHost ? originForHost(storefrontHost) : null
	}

	const requestUrl = new URL(requestOrigin)
	const requestHost = requestUrl.hostname

	if (requestHost === "localhost" || requestHost === "127.0.0.1") {
		return requestOrigin
	}

	if (!storefrontHost) {
		return requestOrigin
	}

	const hostWithoutWww = storefrontHost.replace(/^www\./, "")
	const requestWithoutWww = requestHost.replace(/^www\./, "")

	if (requestWithoutWww === hostWithoutWww) {
		return requestOrigin
	}

	return originForHost(storefrontHost)
}

/**
 * Helper to create error responses with CORS
 */
export function storefrontError(message: string, status: number) {
	return Response.json({ error: message }, { status, headers: defaultCorsHeaders })
}

/**
 * Helper to create JSON responses with CORS
 */
export function storefrontJson(data: unknown, status = 200) {
	return Response.json(data, { status, headers: defaultCorsHeaders })
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsOptions() {
	return new Response(null, { status: 204, headers: defaultCorsHeaders })
}

/**
 * Add CORS headers to a response, scoped to the storefront domain if available
 */
function addCorsHeaders(response: Response, origin?: string | null): Response {
	const headers = buildCorsHeaders(origin)
	const newHeaders = new Headers(response.headers)
	Object.entries(headers).forEach(([key, value]) => {
		newHeaders.set(key, value)
	})
	newHeaders.set("Cache-Control", "no-store, max-age=0")
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders,
	})
}

/**
 * Get workspace site mode (maintenance/sandbox/live)
 */
export async function getWorkspaceSiteMode(workspaceId: string): Promise<{
	maintenance: boolean
	sandbox: boolean
}> {
	const settings = await db
		.select({ key: storeSettings.key, value: storeSettings.value })
		.from(storeSettings)
		.where(
			and(
				eq(storeSettings.workspaceId, workspaceId),
				inArray(storeSettings.key, ["maintenance_mode", "sandbox_mode"])
			)
		)

	const s = (key: string) => settings.find((x) => x.key === key)?.value
	return {
		maintenance: s("maintenance_mode") === "true",
		sandbox: s("sandbox_mode") === "true",
	}
}

/**
 * Wrapper for storefront API routes
 * Handles authentication, permission checking, and CORS
 */
export function withStorefrontAuth(
	handler: (
		request: NextRequest,
		storefront: StorefrontContext
	) => Promise<Response>,
	options?: {
		requiredPermission?: keyof StorefrontContext["permissions"]
	}
) {
	return async (request: NextRequest) => {
		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return handleCorsOptions()
		}

		const authResult = await validateStorefrontRequest(request)

		if (!authResult.success) {
			return storefrontError(authResult.error, authResult.status)
		}

		// Check required permission if specified
		if (options?.requiredPermission) {
			if (!checkStorefrontPermission(authResult.storefront, options.requiredPermission)) {
				return storefrontError(
					`Storefront does not have '${options.requiredPermission}' permission`,
					403
				)
			}
		}

		// Scope CORS to the registered storefront domain, while tolerating protocol
		// and www/non-www differences that commonly happen after deployment.
		const requestOrigin = request.headers.get("origin")
		const allowedOrigin = allowedCorsOrigin(requestOrigin, authResult.storefront.domain)

		const response = await handler(request, authResult.storefront)
		return addCorsHeaders(response, allowedOrigin)
	}
}
