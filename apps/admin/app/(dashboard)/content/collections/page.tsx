import { getCollections } from "./actions"
import { CollectionsTable } from "./collections-table"

export default async function CollectionsPage() {
	const collections = await getCollections()

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<CollectionsTable collections={collections} />
		</div>
	)
}
