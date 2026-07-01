import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@quickdash/db/client"
import { eq, and, inArray, asc } from "@quickdash/db/drizzle"
import { users, storeSettings, contentCollections } from "@quickdash/db/schema"
import { DynamicFavicon } from "@/components/dynamic-favicon"
import { AppSidebar } from "@/components/app-sidebar"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { BreadcrumbProvider } from "@/components/breadcrumb-context"
import { CommandMenuWrapper } from "@/components/command-menu-wrapper"
import { HeaderToolbar } from "@/components/header-toolbar"
import { ModeBanner } from "@/components/mode-banner"
import { PusherProvider } from "@/components/pusher-provider"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"
import { MusicPlayerProvider, MusicPlayerLoader } from "@/components/music-player"
import { ToolbarProvider, ToolbarPanel, WidgetPanels } from "@/components/toolbar"
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts"
import { SidebarModeProvider } from "@/lib/sidebar-mode"
import { getUserWorkspaces, getActiveWorkspace } from "@/lib/workspace"
import { SidebarSwipe } from "@/components/sidebar-swipe"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { RightSidebarProvider } from "@/components/ui/right-sidebar"
import { UserStatusProvider } from "@/components/user-status-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  // Get fresh user data from database (not session cache)
  let user: { role: string | null; name: string | null; image: string | null; onboardingCompletedAt: Date | null } | undefined
  try {
    const [dbUser] = await db
      .select({
        role: users.role,
        name: users.name,
        image: users.image,
        onboardingCompletedAt: users.onboardingCompletedAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
    user = dbUser
  } catch {
    // Database query failed - fall back to session data
    user = undefined
  }

  // If user doesn't exist in DB anymore (e.g. DB was cleared), kill the session
  if (!user) {
    try {
      await auth.api.signOut({ headers: await headers() })
    } catch {}
    redirect("/login")
  }

  // Redirect to onboarding if not completed
  if (!user.onboardingCompletedAt) {
    redirect("/onboarding")
  }

  // Fetch workspace data for the sidebar
  const [workspaces, activeWorkspace] = await Promise.all([
    getUserWorkspaces(),
    getActiveWorkspace(),
  ])

  // Fetch workspace branding if we have an active workspace
  let workspaceFavicon: string | null = null
  let workspaceStoreName: string | null = null
  let workspaceTagline: string | null = null
  let workspaceStorefrontUrl: string | null = null
  let workspaceCustomDomain: string | null = null
  let workspaceMaintenanceMode = false
  let workspaceSandboxMode = false
  if (activeWorkspace?.id) {
    const brandingSettings = await db
      .select({ key: storeSettings.key, value: storeSettings.value })
      .from(storeSettings)
      .where(and(
        eq(storeSettings.workspaceId, activeWorkspace.id),
        inArray(storeSettings.key, ["store_favicon_url", "store_name", "store_tagline", "storefront_url", "custom_domain", "maintenance_mode", "sandbox_mode"])
      ))
    for (const setting of brandingSettings) {
      if (setting.key === "store_favicon_url") workspaceFavicon = setting.value
      if (setting.key === "store_name") workspaceStoreName = setting.value
      if (setting.key === "store_tagline") workspaceTagline = setting.value
      if (setting.key === "storefront_url") workspaceStorefrontUrl = setting.value
      if (setting.key === "custom_domain") workspaceCustomDomain = setting.value
      if (setting.key === "maintenance_mode") workspaceMaintenanceMode = setting.value === "true"
      if (setting.key === "sandbox_mode") workspaceSandboxMode = setting.value === "true"
    }
  }

  // Fetch workspace content collections for sidebar
  let collections: { slug: string; name: string; icon: string | null }[] = []
  if (activeWorkspace?.id) {
    collections = await db
      .select({
        slug: contentCollections.slug,
        name: contentCollections.name,
        icon: contentCollections.icon,
      })
      .from(contentCollections)
      .where(
        and(
          eq(contentCollections.workspaceId, activeWorkspace.id),
          eq(contentCollections.isActive, true)
        )
      )
      .orderBy(asc(contentCollections.sortOrder))
  }

  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <>
    <DynamicFavicon
      faviconUrl={workspaceFavicon}
      storeName={workspaceStoreName}
      tagline={workspaceTagline}
    />
    <ModeBanner initialMaintenanceMode={workspaceMaintenanceMode} initialSandboxMode={workspaceSandboxMode} />
    <PusherProvider
      pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY}
      pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER}
      workspaceId={activeWorkspace?.id ?? null}
    >
      <UserStatusProvider>
        <MusicPlayerProvider>
          <ToolbarProvider features={activeWorkspace?.features}>
              <SidebarModeProvider>
                <SidebarProvider defaultOpen={sidebarOpen} className="flex-col">
                <RightSidebarProvider defaultOpen={false}>
                  <CommandMenuWrapper />
                  <KeyboardShortcutsProvider>
                    <BreadcrumbProvider>
                      <header className="sticky top-[var(--mode-banner-height,0px)] z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                        <div className="flex min-w-0 items-center gap-3 px-4">
                          {/* Mobile sidebar trigger */}
                          <SidebarTrigger className="md:hidden" />
                          <WorkspaceSwitcher
                            workspaces={workspaces}
                            activeWorkspace={activeWorkspace}
                            className="h-10 w-[min(240px,45vw)] max-w-none justify-start gap-2 px-2"
                            iconClassName="size-7"
                          />
                          <div className="min-w-0 overflow-x-auto sm:overflow-hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
                            <BreadcrumbNav />
                          </div>
                        </div>
                        <HeaderToolbar
                          storefrontUrl={workspaceCustomDomain || workspaceStorefrontUrl}
                          initialMaintenanceMode={workspaceMaintenanceMode}
                          initialSandboxMode={workspaceSandboxMode}
                          user={{
                            name: user?.name || session.user.name,
                            email: session.user.email,
                            avatar: user?.image || "",
                          }}
                        />
                      </header>
                      <div className="flex min-h-0 flex-1">
                        <AppSidebar
                          collections={collections}
                          features={activeWorkspace?.features}
                          className="h-[calc(100svh-4rem-var(--mode-banner-height,0px))] max-h-[calc(100svh-4rem-var(--mode-banner-height,0px))]"
                        />
                        <SidebarSwipe />
                        <SidebarInset className="md:flex md:flex-col h-[calc(100svh-4rem-var(--mode-banner-height,0px))] max-h-[calc(100svh-4rem-var(--mode-banner-height,0px))]">
                          <main className="flex flex-1 flex-col pt-4">
                            {children}
                          </main>
                        </SidebarInset>
                      </div>
                    </BreadcrumbProvider>
                    {/* Toolbar Panel - needs RightSidebarProvider */}
                    <ToolbarPanel />
                    <WidgetPanels />
                  </KeyboardShortcutsProvider>
                </RightSidebarProvider>
              </SidebarProvider>
              </SidebarModeProvider>

            {/* Music Player - loads user tracks */}
            <MusicPlayerLoader />
          </ToolbarProvider>
        </MusicPlayerProvider>
      </UserStatusProvider>
    </PusherProvider>
    </>
  )
}
