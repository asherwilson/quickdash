"use client"

import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WorkspaceFeatures } from "@quickdash/db/schema"

export function FeatureGate({
	feature,
	features,
	featureName,
	children,
}: {
	feature: keyof WorkspaceFeatures
	features: WorkspaceFeatures
	featureName: string
	children: React.ReactNode
}) {
	if (features[feature]) {
		return <>{children}</>
	}

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
			<div className="rounded-full bg-muted p-4">
				<Lock className="size-8 text-muted-foreground" />
			</div>
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">{featureName} is not available on your plan</h2>
				<p className="text-sm text-muted-foreground max-w-md">
					This feature is currently disabled while Quickdash is being focused around core commerce workflows.
				</p>
			</div>
			<Button disabled>Unavailable</Button>
		</div>
	)
}

export function FeatureGatePage({
	featureName,
}: {
	feature: keyof WorkspaceFeatures
	features: WorkspaceFeatures
	featureName: string
}) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
			<div className="rounded-full bg-muted p-4">
				<Lock className="size-8 text-muted-foreground" />
			</div>
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">{featureName} is not available on your plan</h2>
				<p className="text-sm text-muted-foreground max-w-md">
					This feature is currently disabled while Quickdash is being focused around core commerce workflows.
				</p>
			</div>
			<Button disabled>Unavailable</Button>
		</div>
	)
}
