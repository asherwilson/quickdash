"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Logout02Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { Building2, Loader2, Sparkles, Store, Users } from "lucide-react"
import {
  createWorkspaceAction,
  deleteWorkspaceAction,
  leaveWorkspaceAction,
  setActiveWorkspace,
  type WorkspaceContext,
  type WorkspaceWithRole,
} from "@/lib/workspace"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const workspaceTypes = [
  { id: "ecommerce", label: "Online Store", icon: Store },
  { id: "community", label: "Community", icon: Users },
  { id: "agency", label: "Agency", icon: Building2 },
  { id: "other", label: "Other", icon: Sparkles },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (workspaceId: string) => void
}) {
  const [name, setName] = React.useState("")
  const [workspaceType, setWorkspaceType] = React.useState("ecommerce")
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || isPending) return

    setIsPending(true)
    setError(null)

    try {
      const result = await createWorkspaceAction(name.trim(), workspaceType)
      if (result.error) {
        setError(result.error)
      } else if (result.workspaceId) {
        setName("")
        setWorkspaceType("ecommerce")
        onOpenChange(false)
        onCreated(result.workspaceId)
      }
    } catch {
      setError("Failed to create workspace")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              Your workspace is where you manage a store, community, client, or project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="My Awesome Store"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>What will you use it for?</Label>
              <div className="grid grid-cols-2 gap-2">
                {workspaceTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setWorkspaceType(type.id)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all",
                      workspaceType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted hover:bg-muted/80"
                    )}
                  >
                    <type.icon className="size-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspace,
}: {
  workspaces: WorkspaceWithRole[]
  activeWorkspace: WorkspaceContext | WorkspaceWithRole | null
}) {
  const router = useRouter()
  const [switching, setSwitching] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [deleteWorkspace, setDeleteWorkspace] = React.useState<WorkspaceWithRole | null>(null)
  const [leaveWorkspace, setLeaveWorkspace] = React.useState<WorkspaceWithRole | null>(null)
  const [actionPending, setActionPending] = React.useState(false)

  const handleWorkspaceSwitch = async (workspaceId: string) => {
    if (switching) return
    if (workspaceId === activeWorkspace?.id) {
      router.push("/")
      return
    }

    setSwitching(true)
    try {
      await setActiveWorkspace(workspaceId)
      router.refresh()
    } finally {
      setSwitching(false)
    }
  }

  const handleWorkspaceCreated = async (workspaceId: string) => {
    await setActiveWorkspace(workspaceId)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteWorkspace || actionPending) return
    setActionPending(true)
    try {
      const result = await deleteWorkspaceAction(deleteWorkspace.id)
      if (!result.error) router.refresh()
    } finally {
      setActionPending(false)
      setDeleteWorkspace(null)
    }
  }

  const handleLeave = async () => {
    if (!leaveWorkspace || actionPending) return
    setActionPending(true)
    try {
      const result = await leaveWorkspaceAction(leaveWorkspace.id)
      if (!result.error) router.refresh()
    } finally {
      setActionPending(false)
      setLeaveWorkspace(null)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-8 min-w-0 max-w-[220px] items-center gap-2 rounded-lg border border-input bg-background px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-semibold text-primary-foreground">
              {getInitials(activeWorkspace?.name || "Workspace")}
            </span>
            <span className="truncate">{activeWorkspace?.name || "Workspace"}</span>
            <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.map((workspace) => {
            const isActive = workspace.id === activeWorkspace?.id
            const isOwner = workspace.role === "owner"

            return (
              <React.Fragment key={workspace.id}>
                <DropdownMenuItem
                  onClick={() => handleWorkspaceSwitch(workspace.id)}
                  className="gap-2"
                  disabled={switching}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                    {getInitials(workspace.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{workspace.name}</span>
                    <span className="block text-xs capitalize text-muted-foreground">{workspace.role}</span>
                  </span>
                  {isActive && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-primary" />}
                </DropdownMenuItem>
                <div className="flex gap-1 px-2 pb-1">
                  <button
                    type="button"
                    onClick={() => router.push("/settings")}
                    className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <HugeiconsIcon icon={Settings01Icon} size={13} />
                    Settings
                  </button>
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => setDeleteWorkspace(workspace)}
                      className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={13} />
                      Delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setLeaveWorkspace(workspace)}
                      className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <HugeiconsIcon icon={Logout02Icon} size={13} />
                      Leave
                    </button>
                  )}
                </div>
              </React.Fragment>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <HugeiconsIcon icon={Add01Icon} size={16} />
            Create Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleWorkspaceCreated}
      />

      <AlertDialog open={!!deleteWorkspace} onOpenChange={(open) => !open && setDeleteWorkspace(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteWorkspace?.name}&quot; and all of its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionPending ? "Deleting..." : "Delete Workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!leaveWorkspace} onOpenChange={(open) => !open && setLeaveWorkspace(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose access to &quot;{leaveWorkspace?.name}&quot;. You will need to be invited again to rejoin it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              disabled={actionPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionPending ? "Leaving..." : "Leave Workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
