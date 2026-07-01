"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { DragDropHorizontalIcon } from "@hugeicons/core-free-icons"
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	type DragEndEvent,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
	Table,
	TableHeader,
	TableBody,
	TableHead,
	TableRow,
	TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export interface Column<T> {
	key: string
	header: string
	cell: (row: T) => React.ReactNode
	sortable?: boolean
	className?: string
}

interface DataTableProps<T> {
	columns: Column<T>[]
	data: T[]
	searchPlaceholder?: string
	searchKey?: string
	totalCount?: number
	pageSize?: number
	currentPage?: number
	onPageChange?: (page: number) => void
	onRowClick?: (row: T) => void
	selectable?: boolean
	selectedIds?: string[]
	onSelectionChange?: (ids: string[]) => void
	getId?: (row: T) => string
	bulkActions?: React.ReactNode
	filters?: React.ReactNode
	emptyMessage?: string
	emptyDescription?: string
	reorderable?: boolean
	onReorder?: (ids: string[]) => void | Promise<void>
}

function SortableTableRow({
	id,
	className,
	onClick,
	children,
}: {
	id: string
	className?: string
	onClick?: React.MouseEventHandler<HTMLTableRowElement>
	children: React.ReactNode
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id })

	return (
		<TableRow
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
				opacity: isDragging ? 0.5 : 1,
			}}
			className={className}
			onClick={onClick}
		>
			<TableCell data-drag-cell className="w-10" onClick={(e) => e.stopPropagation()}>
				<button
					type="button"
					{...attributes}
					{...listeners}
					className="touch-none cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
					aria-label="Reorder row"
				>
					<HugeiconsIcon icon={DragDropHorizontalIcon} size={16} />
				</button>
			</TableCell>
			{children}
		</TableRow>
	)
}

export function DataTable<T>({
	columns,
	data,
	searchPlaceholder = "Search...",
	searchKey: _searchKey = "search",
	totalCount,
	pageSize = 25,
	currentPage,
	onPageChange,
	onRowClick,
	selectable = false,
	selectedIds = [],
	onSelectionChange,
	getId,
	bulkActions,
	filters,
	emptyMessage = "No results found",
	emptyDescription,
	reorderable = false,
	onReorder,
}: DataTableProps<T>) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [search, setSearch] = React.useState("")

	// Internal page state for tables that don't manage pagination externally
	const [internalPage, setInternalPage] = React.useState(1)
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	// Server-side pagination: totalCount is provided, data is already the current page
	const isServerPaginated = totalCount !== undefined

	// Effective page: use controlled prop if provided, URL param, or internal state
	const urlPage = searchParams.get("page")
	const effectivePage = currentPage ?? (urlPage ? parseInt(urlPage, 10) : internalPage)

	const filteredData = React.useMemo(() => {
		if (!search.trim()) return data
		const term = search.toLowerCase()
		return data.filter((row) => {
			const values = Object.values(row as Record<string, unknown>)
			return values.some((val) => {
				if (val == null) return false
				return String(val).toLowerCase().includes(term)
			})
		})
	}, [data, search])

	// For client-side pagination: slice data to current page
	// For server-side pagination: data is already the right page
	const total = isServerPaginated ? totalCount : filteredData.length
	const totalPages = Math.ceil(total / pageSize)

	const displayData = React.useMemo(() => {
		if (isServerPaginated) {
			// Server already sent only the current page's data
			return filteredData
		}
		// Client-side pagination: slice to current page
		const start = (effectivePage - 1) * pageSize
		return filteredData.slice(start, start + pageSize)
	}, [filteredData, isServerPaginated, effectivePage, pageSize])

	const handlePageChange = React.useCallback(
		(page: number) => {
			if (onPageChange) {
				onPageChange(page)
			} else if (isServerPaginated) {
				// Server-side pagination without explicit handler: update URL
				const params = new URLSearchParams(searchParams.toString())
				params.set("page", String(page))
				router.push(`${pathname}?${params.toString()}`, { scroll: true })
			} else {
				// Client-side pagination: update internal state
				setInternalPage(page)
			}
		},
		[onPageChange, isServerPaginated, router, pathname, searchParams]
	)

	const allSelected = displayData.length > 0 && getId && selectedIds.length === displayData.length
	const someSelected = selectedIds.length > 0 && !allSelected

	const toggleAll = () => {
		if (!getId || !onSelectionChange) return
		if (allSelected) {
			onSelectionChange([])
		} else {
			onSelectionChange(displayData.map(getId))
		}
	}

	const toggleRow = (id: string) => {
		if (!onSelectionChange) return
		if (selectedIds.includes(id)) {
			onSelectionChange(selectedIds.filter((i) => i !== id))
		} else {
			onSelectionChange([...selectedIds, id])
		}
	}

	const handleDragEnd = (event: DragEndEvent) => {
		if (!reorderable || !getId || !onReorder) return
		const { active, over } = event
		if (!over || active.id === over.id) return

		const oldIndex = displayData.findIndex((row) => getId(row) === active.id)
		const newIndex = displayData.findIndex((row) => getId(row) === over.id)
		if (oldIndex === -1 || newIndex === -1) return

		const nextRows = [...displayData]
		const [moved] = nextRows.splice(oldIndex, 1)
		nextRows.splice(newIndex, 0, moved)
		onReorder(nextRows.map(getId))
	}

	// Range of items being shown
	const startItem = isServerPaginated
		? (effectivePage - 1) * pageSize + 1
		: (effectivePage - 1) * pageSize + 1
	const endItem = Math.min(startItem + pageSize - 1, total)

	return (
		<div className="space-y-3">
			{selectedIds.length > 0 && bulkActions && (
				<div className="flex items-center justify-end gap-2">
					<span className="text-sm text-muted-foreground">
						{selectedIds.length} selected
					</span>
					{bulkActions}
				</div>
			)}
			<div className="flex flex-col sm:flex-row sm:items-center gap-3">
				<div className="sm:flex-1">
					<Input
						placeholder={searchPlaceholder}
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							if (!isServerPaginated) setInternalPage(1)
						}}
						className="h-9"
					/>
				</div>
				{filters && (
					<div className="hidden sm:flex items-center gap-2 shrink-0">
						{filters}
					</div>
				)}
			</div>
			{filters && (
				<div className="flex flex-wrap items-center gap-2 w-full sm:hidden">
					{filters}
				</div>
			)}

			<div className="rounded-lg border overflow-x-auto">
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<Table className="min-w-150">
					<TableHeader>
						<TableRow>
							{reorderable && <TableHead className="w-10" />}
							{selectable && (
								<TableHead className="w-10">
									<Checkbox
										checked={allSelected ? true : someSelected ? "indeterminate" : false}
										onCheckedChange={toggleAll}
									/>
								</TableHead>
							)}
							{columns.map((col) => (
								<TableHead key={col.key} className={col.className}>
									{col.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{displayData.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length + (selectable ? 1 : 0) + (reorderable ? 1 : 0)}
									className="h-32 text-center"
								>
									<div className="space-y-1">
										<p className="text-sm text-muted-foreground">{emptyMessage}</p>
										{emptyDescription && (
											<p className="text-xs text-muted-foreground/60">{emptyDescription}</p>
										)}
									</div>
								</TableCell>
							</TableRow>
						) : reorderable && getId ? (
							<SortableContext items={displayData.map(getId)} strategy={verticalListSortingStrategy}>
								{displayData.map((row, i) => {
								const id = getId?.(row) ?? String(i)
								return (
									<SortableTableRow
										key={id}
										id={id}
										className={cn(
											onRowClick && "cursor-pointer",
											selectedIds.includes(id) && "bg-muted/50"
										)}
										onClick={(e) => {
											const target = e.target as HTMLElement
											if (target.closest('[role="checkbox"]') || target.closest('[data-checkbox-cell]') || target.closest('[data-drag-cell]')) return
											onRowClick?.(row)
										}}
									>
										{selectable && (
											<TableCell data-checkbox-cell onClick={(e) => e.stopPropagation()}>
												<Checkbox
													checked={selectedIds.includes(id)}
													onCheckedChange={() => toggleRow(id)}
												/>
											</TableCell>
										)}
										{columns.map((col) => (
											<TableCell key={col.key} className={col.className}>
												{col.cell(row)}
											</TableCell>
										))}
									</SortableTableRow>
								)
							})}
							</SortableContext>
						) : (
							displayData.map((row, i) => {
								const id = getId?.(row) ?? String(i)
								return (
									<TableRow
										key={id}
										className={cn(
											onRowClick && "cursor-pointer",
											selectedIds.includes(id) && "bg-muted/50"
										)}
										onClick={(e) => {
											const target = e.target as HTMLElement
											if (target.closest('[role="checkbox"]') || target.closest('[data-checkbox-cell]')) return
											onRowClick?.(row)
										}}
									>
										{selectable && (
											<TableCell data-checkbox-cell onClick={(e) => e.stopPropagation()}>
												<Checkbox
													checked={selectedIds.includes(id)}
													onCheckedChange={() => toggleRow(id)}
												/>
											</TableCell>
										)}
										{columns.map((col) => (
											<TableCell key={col.key} className={col.className}>
												{col.cell(row)}
											</TableCell>
										))}
									</TableRow>
								)
							})
						)}
					</TableBody>
				</Table>
				</DndContext>
			</div>

			{/* Pagination - always show when there are multiple pages */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing {startItem}–{endItem} of {total}
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={effectivePage <= 1}
							onClick={() => handlePageChange(effectivePage - 1)}
						>
							Previous
						</Button>
						<span className="text-sm text-muted-foreground">
							Page {effectivePage} of {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							disabled={effectivePage >= totalPages}
							onClick={() => handlePageChange(effectivePage + 1)}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
