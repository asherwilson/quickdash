import { Suspense } from "react"
import { getActiveAuctions } from "./actions"
import { AuctionsTable } from "./auctions-table"

export default async function AuctionsPage() {
	const { items, totalCount } = await getActiveAuctions()

	return (
		<div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 pt-0">
			<Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
				<AuctionsTable auctions={items} totalCount={totalCount} view="active" />
			</Suspense>
		</div>
	)
}
