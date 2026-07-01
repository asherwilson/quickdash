"use client"

import { Save } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FloatingSaveButtonProps = ComponentProps<typeof Button> & {
	children: ReactNode
}

export function FloatingSaveButton({
	children,
	className,
	...props
}: FloatingSaveButtonProps) {
	return (
		<div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
			<Button
				className={cn("h-11 rounded-full px-5 shadow-lg shadow-black/15", className)}
				{...props}
			>
				<Save className="size-4" />
				{children}
			</Button>
		</div>
	)
}
