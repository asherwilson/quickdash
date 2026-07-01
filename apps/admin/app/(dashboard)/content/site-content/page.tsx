import { getSiteContent } from "../actions"
import { SiteContentEditor } from "./site-content-editor"

export default async function SiteContentPage() {
	const items = await getSiteContent()

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<SiteContentEditor items={items} />
		</div>
	)
}
