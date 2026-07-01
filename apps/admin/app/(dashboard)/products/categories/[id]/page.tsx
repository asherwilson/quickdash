import { notFound } from "next/navigation"
import { getCategory, getAllCategories } from "../actions"
import { CategoryEditForm } from "./category-edit-form"

interface PageProps {
	params: Promise<{ id: string }>
}

export default async function CategoryDetailPage({ params }: PageProps) {
	const { id } = await params

	let category
	try {
		category = await getCategory(id)
	} catch {
		notFound()
	}

	const { items: categories } = await getAllCategories()

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
			<CategoryEditForm category={category} categories={categories} />
		</div>
	)
}
