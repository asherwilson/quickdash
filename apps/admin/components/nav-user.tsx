"use client"

import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UnfoldMoreIcon,
  Logout01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { signOut } from "@/lib/auth-client"
import { logSignOut } from "@/app/(dashboard)/settings/sessions/sign-out-action"
import { useUserStatus } from "@/hooks/use-user-status"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { StatusDot, StatusIndicator } from "@/components/presence/status-indicator"
import type { UserStatusMode } from "@/hooks/use-user-status"

const STATUS_OPTIONS: { value: UserStatusMode; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "online", label: "Online" },
  { value: "idle", label: "Idle" },
  { value: "dnd", label: "Do Not Disturb" },
  { value: "offline", label: "Invisible" },
]

export function NavUser({
  user,
  variant = "sidebar",
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  variant?: "sidebar" | "avatar"
}) {
  const { isMobile, state } = useSidebar()
  const router = useRouter()
  const { status, mode, setMode } = useUserStatus()

  const handleSignOut = async () => {
    await logSignOut()
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
        },
      },
    })
  }

  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const isCollapsed = state === "collapsed"
  const currentStatusOption = STATUS_OPTIONS.find(s => s.value === mode) || STATUS_OPTIONS[0]

  const cycleStatus = () => {
    const currentIndex = STATUS_OPTIONS.findIndex(s => s.value === mode)
    const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length
    setMode(STATUS_OPTIONS[nextIndex].value)
  }

  const avatarTrigger = (
    <button
      type="button"
      className="relative flex size-8 items-center justify-center overflow-visible rounded-lg outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:opacity-85"
      aria-label="Open account menu"
    >
      <Avatar className="h-8 w-8 rounded-lg">
        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
      </Avatar>
      <StatusDot status={status} className="ring-background" />
    </button>
  )

  const menuContent = (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      side={isMobile ? "bottom" : variant === "avatar" ? "bottom" : "right"}
      align="end"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-sm px-1 py-1.5 text-left text-sm transition-colors hover:bg-accent"
          onClick={() => router.push("/settings/account")}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
        </button>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => router.push("/settings")}>
        <HugeiconsIcon icon={Settings02Icon} size={16} />
        Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault()
          cycleStatus()
        }}
        className="gap-2"
      >
        <StatusIndicator status={status} size="sm" />
        <span>{currentStatusOption.label}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleSignOut}>
        <HugeiconsIcon icon={Logout01Icon} size={16} />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )

  if (variant === "avatar") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {avatarTrigger}
        </DropdownMenuTrigger>
        {menuContent}
      </DropdownMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="overflow-visible! data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="relative overflow-visible!">
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <StatusDot status={status} />
              </div>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <HugeiconsIcon icon={UnfoldMoreIcon} size={16} className="ml-auto" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {menuContent}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
