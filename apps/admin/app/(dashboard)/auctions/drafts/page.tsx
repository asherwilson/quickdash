import { Suspense } from "react"
import { getDraftAuctions } from "../actions"
import { AuctionsTable } from "../auctions-table"

export default async function DraftAuctionsPage() {
	const { items, totalCount } = await getDraftAuctions()

	return (
		<div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 pt-0">
			<Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
				<AuctionsTable auctions={items} totalCount={totalCount} view="drafts" />
			</Suspense>
		</div>
	)
}
