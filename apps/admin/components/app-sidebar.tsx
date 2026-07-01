"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AnalyticsUpIcon,
  DashboardSpeed01Icon,
  DeliveryBox01Icon,
  DeliveryTracking01Icon,
  DeliveryTruck01Icon,
  Megaphone01Icon,
  News01Icon,
  Package01Icon,
  RepeatIcon,
  Settings02Icon,
  ShoppingBag01Icon,
  StarIcon,
  UserGroupIcon,
  Building03Icon,
  SaleTag01Icon,
  CheckListIcon,
  ArrowRight01Icon,
  Coins01Icon,
  Add01Icon,
  FlashIcon,
  Home01Icon,
  // Workflow trigger/action icons
  ShoppingCart01Icon,
  UserAdd01Icon,
  Tag01Icon,
  Clock01Icon,
  Calendar01Icon,
  Cursor01Icon,
  Mail01Icon,
  MessageNotification01Icon,
  Database01Icon,
  Link01Icon,
  GitBranchIcon,
  AuctionIcon,
  // Specific trigger icons
  ShoppingCartCheck01Icon,
  CreditCardIcon,
  PackageDeliveredIcon,
  MoneyReceive01Icon,
  UserEdit01Icon,
  PackageAddIcon,
  Alert01Icon,
  PackageRemoveIcon,
  CheckmarkCircle02Icon,
  RefreshIcon,
  CancelCircleIcon,
  CreditCardNotFoundIcon,
  ThumbsUpIcon,
  Flag01Icon,
  PlayIcon,
  TimerIcon,
  HourglassIcon,
  // Specific action icons
  MailSend01Icon,
  FileEditIcon,
  SmartPhone01Icon,
  MessageEdit01Icon,
  Tag02Icon,
  NoteEditIcon,
  Edit01Icon,
  Layers01Icon,
  WebhookIcon,
  SlackIcon,
  FilterIcon,
  PauseIcon,
  CalendarCheckIn01Icon,
  // Additional integration icons
  AiChat02Icon,
  LanguageSkillIcon,
  NewTwitterIcon,
  Facebook01Icon,
  InstagramIcon,
  Linkedin01Icon,
  TiktokIcon,
  PinterestIcon,
  DiscordIcon,
  TelegramIcon,
  WhatsappIcon,
  GoogleIcon,
  GoogleDriveIcon,
  CloudUploadIcon,
  GithubIcon,
  RocketIcon,
  Invoice02Icon,
  Analytics01Icon,
  Globe02Icon,
  FolderAddIcon,
  Ticket02Icon,
  ContactIcon,
  Message01Icon,
  MailAdd01Icon,
  UserAdd02Icon,
  ChartHistogramIcon,
  Notification03Icon,
  FunctionIcon,
  GiftIcon,
  AwardIcon,
} from "@hugeicons/core-free-icons"
import { NavMain } from "@/components/nav-main"
import { StorageIndicator } from "@/components/storage-indicator"
import { useSidebarStateProvider, SidebarStateContext } from "@/lib/use-sidebar-state"
import { useSidebarMode } from "@/lib/sidebar-mode"
import { useWorkflowStore } from "@/lib/workflow-context"
import { TRIGGER_CATEGORIES, ACTION_CATEGORIES } from "@/app/(dashboard)/automation/constants"
import type { WorkflowTrigger, WorkflowAction } from "@quickdash/db/schema"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import type { WorkspaceFeatures } from "@quickdash/db/schema"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { motion, AnimatePresence } from "framer-motion"

const data = {
  navOverview: [
    {
      title: "Dashboard",
      url: "/",
      icon: DashboardSpeed01Icon,
      isActive: true,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: AnalyticsUpIcon,
      items: [
        { title: "Overview", url: "/analytics" },
        { title: "Sales Reports", url: "/analytics/sales" },
        { title: "Subscriptions", url: "/analytics/subscriptions" },
        { title: "Traffic", url: "/analytics/traffic" },
        { title: "Customer Insights", url: "/analytics/customers" },
      ],
    },
  ],
  navStore: [
    {
      title: "Orders",
      url: "/orders",
      icon: ShoppingBag01Icon,
      items: [
        { title: "All Orders", url: "/orders" },
        { title: "Fulfillment", url: "/orders/fulfillment" },
      ],
    },
    {
      title: "Products",
      url: "/products",
      icon: Package01Icon,
      items: [
        { title: "All Products", url: "/products" },
        { title: "Categories", url: "/products/categories" },
        { title: "Variants", url: "/products/variants" },
      ],
    },
    {
      title: "Reviews",
      url: "/reviews",
      icon: StarIcon,
      items: [
        { title: "All Reviews", url: "/reviews" },
        { title: "Pending", url: "/reviews/pending" },
      ],
    },
    {
      title: "Auctions",
      url: "/auctions",
      icon: Coins01Icon,
      items: [
        { title: "Active", url: "/auctions" },
        { title: "Drafts", url: "/auctions/drafts" },
        { title: "Closed", url: "/auctions/closed" },
      ],
    },
    {
      title: "Customers",
      url: "/customers",
      icon: UserGroupIcon,
      items: [
        { title: "All Customers", url: "/customers" },
        { title: "Segments", url: "/customers/segments" },
        { title: "Loyalty & Rewards", url: "/customers/loyalty" },
        { title: "Gift Cards", url: "/customers/gift-cards" },
      ],
    },
  ],
  navOperations: [
    {
      title: "Inventory",
      url: "/inventory",
      icon: DeliveryBox01Icon,
      items: [
        { title: "Stock Levels", url: "/inventory" },
        { title: "Alerts", url: "/inventory/alerts" },
        { title: "Activity Log", url: "/inventory/activity" },
      ],
    },
    {
      title: "Subscriptions",
      url: "/subscriptions",
      icon: RepeatIcon,
      items: [
        { title: "Active", url: "/subscriptions" },
        { title: "Paused", url: "/subscriptions/paused" },
        { title: "Canceled", url: "/subscriptions/canceled" },
        { title: "Dunning", url: "/subscriptions/dunning" },
      ],
    },
    {
      title: "Shipping",
      url: "/shipping",
      icon: DeliveryTracking01Icon,
      items: [
        { title: "Carriers & Rates", url: "/shipping" },
        { title: "Labels", url: "/shipping/labels" },
        { title: "Tracking", url: "/shipping/tracking" },
      ],
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: DeliveryTruck01Icon,
      items: [
        { title: "All Suppliers", url: "/suppliers" },
        { title: "Purchase Orders", url: "/suppliers/purchase-orders" },
      ],
    },
    {
      title: "Marketing",
      url: "/marketing",
      icon: Megaphone01Icon,
      items: [
        { title: "Discounts & Coupons", url: "/marketing" },
        { title: "Campaigns", url: "/marketing/campaigns" },
        { title: "Email Templates", url: "/marketing/email-templates" },
        { title: "Referrals", url: "/marketing/referrals" },
      ],
    },
    {
      title: "Content",
      url: "/content",
      icon: News01Icon,
      items: [
        { title: "Blog Posts", url: "/content" },
        { title: "Pages", url: "/content/pages" },
        { title: "All Collections", url: "/content/collections" },
        { title: "Site Content", url: "/content/site-content" },
        { title: "Media Library", url: "/content/media" },
      ],
    },
  ],
}

function DigitalClock() {
  const [time, setTime] = React.useState<Date | null>(null)

  React.useEffect(() => {
    // Set initial time on mount (client-side only)
    setTime(new Date())

    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!time) {
    // Return placeholder during SSR/hydration
    return <span className="font-mono text-2xl font-medium tabular-nums">--:--</span>
  }

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  return (
    <div className="flex items-baseline gap-1">
      <span className="font-mono text-2xl font-medium tabular-nums">
        {displayHours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-muted-foreground font-medium">{ampm}</span>
    </div>
  )
}

function WorkflowHeader() {
  return (
    <div className="flex items-center justify-center py-3">
      <DigitalClock />
    </div>
  )
}

// Icon mappings for workflow triggers and actions
const TRIGGER_CATEGORY_ICONS: Record<string, typeof ShoppingCart01Icon> = {
  orders: ShoppingCart01Icon,
  customers: UserGroupIcon,
  products: Package01Icon,
  subscriptions: RepeatIcon,
  reviews: StarIcon,
  auctions: AuctionIcon,
  cart: ShoppingCart01Icon,
  giftcards: GiftIcon,
  loyalty: StarIcon,
  inbox: Mail01Icon,
  webhooks: WebhookIcon,
  forms: FileEditIcon,
  referrals: UserAdd01Icon,
  schedule: Calendar01Icon,
  manual: Cursor01Icon,
}

// Specific icons for each trigger value
const TRIGGER_ICONS: Record<string, typeof ShoppingCart01Icon> = {
  // Orders
  "order.created": ShoppingCartCheck01Icon,
  "order.paid": CreditCardIcon,
  "order.fulfilled": PackageDeliveredIcon,
  "order.cancelled": CancelCircleIcon,
  "order.refunded": MoneyReceive01Icon,
  // Customers
  "customer.created": UserAdd01Icon,
  "customer.updated": UserEdit01Icon,
  "customer.tag_added": Tag01Icon,
  // Products
  "product.created": PackageAddIcon,
  "product.updated": Edit01Icon,
  "product.low_stock": Alert01Icon,
  "product.out_of_stock": PackageRemoveIcon,
  // Subscriptions
  "subscription.created": CheckmarkCircle02Icon,
  "subscription.renewed": RefreshIcon,
  "subscription.cancelled": CancelCircleIcon,
  "subscription.payment_failed": CreditCardNotFoundIcon,
  // Reviews
  "review.created": Edit01Icon,
  "review.approved": ThumbsUpIcon,
  "review.reported": Flag01Icon,
  // Auctions
  "auction.started": PlayIcon,
  "auction.bid_placed": AuctionIcon,
  "auction.ending_soon": TimerIcon,
  "auction.ended": HourglassIcon,
  // Cart
  "cart.abandoned": ShoppingCart01Icon,
  "cart.recovered": ShoppingCartCheck01Icon,
  // Gift Cards
  "giftcard.purchased": GiftIcon,
  "giftcard.redeemed": Ticket02Icon,
  "giftcard.low_balance": Alert01Icon,
  // Loyalty
  "loyalty.points_earned": StarIcon,
  "loyalty.tier_changed": AwardIcon,
  "loyalty.reward_redeemed": GiftIcon,
  // Inbox
  "inbox.email_received": Mail01Icon,
  "inbox.email_replied": MailSend01Icon,
  // Webhooks
  "webhook.received": WebhookIcon,
  // Forms
  "form.submitted": FileEditIcon,
  // Referrals
  "referral.signup": UserAdd01Icon,
  "referral.conversion": MoneyReceive01Icon,
  // Schedule
  "schedule.cron": CalendarCheckIn01Icon,
  "schedule.interval": Clock01Icon,
  // Manual
  "manual.trigger": Cursor01Icon,
}

const ACTION_CATEGORY_ICONS: Record<string, typeof Mail01Icon> = {
  email: Mail01Icon,
  notifications: MessageNotification01Icon,
  data: Database01Icon,
  ai: AiChat02Icon,
  social: NewTwitterIcon,
  communication: Message01Icon,
  google: GoogleIcon,
  microsoft: Globe02Icon,
  productivity: CheckListIcon,
  github: GithubIcon,
  cloudflare: Globe02Icon,
  aws: CloudUploadIcon,
  deployment: RocketIcon,
  crm: ContactIcon,
  ecommerce: ShoppingBag01Icon,
  analytics: Analytics01Icon,
  integrations: Link01Icon,
  utilities: Settings02Icon,
  flow: GitBranchIcon,
}

// Specific icons for each action value
const ACTION_ICONS: Record<string, typeof Mail01Icon> = {
  // Email
  "email.send": MailSend01Icon,
  "email.send_template": FileEditIcon,
  // Notifications
  "notification.push": SmartPhone01Icon,
  "notification.sms": MessageEdit01Icon,
  // Data
  "customer.add_tag": Tag01Icon,
  "customer.remove_tag": Tag02Icon,
  "customer.update_field": UserEdit01Icon,
  "order.add_note": NoteEditIcon,
  "order.update_status": Edit01Icon,
  "product.update_stock": Layers01Icon,
  // AI & Bots
  "ai.generate_text": AiChat02Icon,
  "ai.analyze_sentiment": AiChat02Icon,
  "ai.categorize": AiChat02Icon,
  "ai.translate": LanguageSkillIcon,
  "ai.summarize": AiChat02Icon,
  // Social Media
  "twitter.post": NewTwitterIcon,
  "twitter.dm": NewTwitterIcon,
  "facebook.post": Facebook01Icon,
  "facebook.message": Facebook01Icon,
  "instagram.post": InstagramIcon,
  "instagram.story": InstagramIcon,
  "linkedin.post": Linkedin01Icon,
  "tiktok.post": TiktokIcon,
  "pinterest.pin": PinterestIcon,
  "threads.post": NewTwitterIcon,
  // Communication
  "slack.send_message": SlackIcon,
  "discord.send_message": DiscordIcon,
  "discord.create_thread": DiscordIcon,
  "teams.send_message": Globe02Icon,
  "telegram.send_message": TelegramIcon,
  "whatsapp.send_message": WhatsappIcon,
  // Google Suite
  "google_sheets.add_row": GoogleIcon,
  "google_sheets.update_row": GoogleIcon,
  "google_docs.create": GoogleIcon,
  "google_slides.create": GoogleIcon,
  "google_drive.upload": GoogleDriveIcon,
  "google_drive.create_folder": FolderAddIcon,
  "google_calendar.create_event": Calendar01Icon,
  "gmail.send": MailSend01Icon,
  // Microsoft Suite
  "outlook.send_email": MailSend01Icon,
  "excel.add_row": Database01Icon,
  "word.create_doc": FileEditIcon,
  "powerpoint.create": FileEditIcon,
  "onedrive.upload": CloudUploadIcon,
  "microsoft_todo.create_task": CheckListIcon,
  // Productivity
  "notion.create_page": FileEditIcon,
  "notion.update_database": Database01Icon,
  "airtable.create_record": Database01Icon,
  "trello.create_card": CheckListIcon,
  "asana.create_task": CheckListIcon,
  "monday.create_item": CheckListIcon,
  "clickup.create_task": CheckListIcon,
  "jira.create_issue": Ticket02Icon,
  "linear.create_issue": Ticket02Icon,
  // GitHub
  "github.create_issue": GithubIcon,
  "github.create_pr_comment": GithubIcon,
  "github.trigger_workflow": GithubIcon,
  "github.create_release": GithubIcon,
  // Cloudflare
  "cloudflare.purge_cache": Globe02Icon,
  "cloudflare.create_dns_record": Globe02Icon,
  "cloudflare_r2.upload": CloudUploadIcon,
  // AWS
  "aws_s3.upload": CloudUploadIcon,
  "aws_sns.publish": Notification03Icon,
  "aws_sqs.send_message": MessageNotification01Icon,
  "aws_lambda.invoke": FunctionIcon,
  "aws_ses.send_email": MailSend01Icon,
  // Deployment
  "vercel.deploy": RocketIcon,
  "vercel.redeploy": RocketIcon,
  "netlify.trigger_build": RocketIcon,
  // CRM
  "hubspot.create_contact": ContactIcon,
  "hubspot.create_deal": SaleTag01Icon,
  "salesforce.create_lead": ContactIcon,
  "pipedrive.create_deal": SaleTag01Icon,
  "zendesk.create_ticket": Ticket02Icon,
  "intercom.send_message": Message01Icon,
  "freshdesk.create_ticket": Ticket02Icon,
  // E-commerce
  "shopify.create_order": ShoppingBag01Icon,
  "stripe.create_invoice": Invoice02Icon,
  "mailchimp.add_subscriber": MailAdd01Icon,
  "klaviyo.add_profile": UserAdd02Icon,
  "sendgrid.send_email": MailSend01Icon,
  // Analytics
  "segment.track": Analytics01Icon,
  "mixpanel.track": ChartHistogramIcon,
  "posthog.capture": Analytics01Icon,
  // Integrations
  "webhook.send": WebhookIcon,
  "http.request": Globe02Icon,
  // Flow Control
  "condition.if": FilterIcon,
  "delay.wait": PauseIcon,
  "delay.wait_until": CalendarCheckIn01Icon,
}


// Hook for managing workflow sidebar open state
function useWorkflowSidebarState() {
  const defaultOpen = new Set(["trigger-orders", "trigger-customers", "action-email", "action-notifications"])
  const [openItems, setOpenItems] = React.useState<Set<string>>(() => {
    if (typeof window === "undefined") return defaultOpen
    const stored = localStorage.getItem("workflow-sidebar-open")
    if (stored) {
      try {
        return new Set(JSON.parse(stored))
      } catch {
        return defaultOpen
      }
    }
    return defaultOpen
  })

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      localStorage.setItem("workflow-sidebar-open", JSON.stringify([...next]))
      return next
    })
  }

  return { openItems, toggle }
}

function WorkflowSidebarContent() {
  const workflow = useWorkflowStore()
  const { openItems, toggle } = useWorkflowSidebarState()

  // All trigger and action categories
  const allTriggers = Object.entries(TRIGGER_CATEGORIES)
  const allActions = Object.entries(ACTION_CATEGORIES)

  // Show loading state if workflow context is not yet available
  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  return (
    <>
      {/* Triggers */}
      {!workflow.hasTrigger && (
        <SidebarGroup>
          <SidebarGroupLabel>Triggers</SidebarGroupLabel>
          <SidebarMenu>
            {allTriggers.map(([key, category]) => {
              const CategoryIcon = TRIGGER_CATEGORY_ICONS[key] || FlashIcon
              const isOpen = openItems.has(`trigger-${key}`)

              return (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    tooltip={category.label}
                    onClick={() => toggle(`trigger-${key}`)}
                    data-state={isOpen ? "open" : "closed"}
                  >
                    <HugeiconsIcon icon={CategoryIcon} size={16} />
                    <span>{category.label}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    className="data-[state=open]:rotate-90 transition-transform duration-200"
                    onClick={() => toggle(`trigger-${key}`)}
                    data-state={isOpen ? "open" : "closed"}
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <SidebarMenuSub>
                          {category.triggers.map((t) => {
                            const TriggerIcon = TRIGGER_ICONS[t.value] || CategoryIcon
                            return (
                              <SidebarMenuSubItem key={t.value}>
                                <SidebarMenuSubButton
                                  onClick={() => workflow.addTriggerNode(t.value as WorkflowTrigger, t.label, category.label)}
                                  className="cursor-pointer"
                                >
                                  <HugeiconsIcon icon={TriggerIcon} size={14} className="text-muted-foreground shrink-0" />
                                  <span>{t.label}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      )}

      {/* Actions */}
      <SidebarGroup>
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
        <SidebarMenu>
          {allActions.map(([key, category]) => {
            const CategoryIcon = ACTION_CATEGORY_ICONS[key] || Add01Icon
            const isOpen = openItems.has(`action-${key}`)
            const isDisabled = !workflow.hasTrigger

            return (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton
                  tooltip={category.label}
                  onClick={() => !isDisabled && toggle(`action-${key}`)}
                  data-state={isOpen ? "open" : "closed"}
                  className={cn(isDisabled && "opacity-50 cursor-not-allowed")}
                >
                  <HugeiconsIcon icon={CategoryIcon} size={16} />
                  <span>{category.label}</span>
                </SidebarMenuButton>
                <SidebarMenuAction
                  className={cn(
                    "data-[state=open]:rotate-90 transition-transform duration-200",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !isDisabled && toggle(`action-${key}`)}
                  data-state={isOpen ? "open" : "closed"}
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                  <span className="sr-only">Toggle</span>
                </SidebarMenuAction>
                <AnimatePresence initial={false}>
                  {isOpen && !isDisabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <SidebarMenuSub>
                        {category.actions.map((a) => {
                          const ActionIcon = ACTION_ICONS[a.value] || CategoryIcon
                          return (
                            <SidebarMenuSubItem key={a.value}>
                              <SidebarMenuSubButton
                                onClick={() => workflow.addActionNode(a.value as WorkflowAction, a.label, category.label)}
                                className="cursor-pointer"
                              >
                                <HugeiconsIcon icon={ActionIcon} size={14} className="text-muted-foreground shrink-0" />
                                <span>{a.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}

function NormalSidebarContent({
  navOverview,
  navOperations,
  navStore
}: {
  navOverview: typeof data.navOverview
  navOperations: typeof data.navOperations
  navStore: typeof data.navStore
}) {
  return (
    <>
      <NavMain label="Overview" labelIcon={Home01Icon} items={navOverview} />
      <NavMain label="Store" labelIcon={Building03Icon} items={navStore} />
      <NavMain label="Operations" labelIcon={Layers01Icon} items={navOperations} />
    </>
  )
}

type CollectionNavItem = {
  slug: string
  name: string
  icon: string | null
}

export function AppSidebar({
  collections = [],
  features,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  collections?: CollectionNavItem[]
  features?: WorkspaceFeatures
}) {
  const sidebarState = useSidebarStateProvider()
  const { mode } = useSidebarMode()
  const isWorkflowMode = mode === "workflow"
  const isMobile = useIsMobile()

  // On mobile: collapsible (sheet behavior)
  // On desktop: fixed sidebar (no collapse) - same as messages layout
  const collapsible = isMobile ? "icon" : "none"

  // Helper: lock a sub-item if feature is disabled
  const lockSub = React.useCallback(
    (sub: { title: string; url: string }, feature: keyof WorkspaceFeatures) =>
      features && !features[feature] ? { ...sub, locked: true } : sub,
    [features]
  )

  // Build Operations section, including dynamic Content nav items from collections.
  const navOperations = React.useMemo(() => {
    const contentItems = [
      { title: "Blog Posts", url: "/content" },
      { title: "Pages", url: "/content/pages" },
      ...collections.map((c) => ({
        title: c.name,
        url: `/content/collections/${c.slug}`,
      })),
      lockSub({ title: "All Collections", url: "/content/collections" }, "collections"),
      lockSub({ title: "Site Content", url: "/content/site-content" }, "siteContent"),
      lockSub({ title: "Media Library", url: "/content/media" }, "mediaLibrary"),
      lockSub({ title: "Media Converter", url: "/content/media/converter" }, "mediaLibrary"),
    ]

    return data.navOperations.map((item) => {
      if (item.title === "Content") {
        return { ...item, items: contentItems }
      }
      if (item.title === "Marketing" && item.items) {
        return {
          ...item,
          items: item.items.map((sub) => {
            if (sub.title === "Campaigns") return lockSub(sub, "campaigns")
            if (sub.title === "Email Templates") return lockSub(sub, "emailTemplates")
            return sub
          }),
        }
      }
      if (item.title === "Subscriptions" && features && !features.subscriptions) {
        return { ...item, locked: true }
      }
      if (item.title === "Suppliers" && features && !features.suppliers) {
        return { ...item, locked: true }
      }
      if (item.title === "Shipping" && item.items) {
        return {
          ...item,
          items: item.items.map((sub) => {
            if (sub.title === "Tracking") return lockSub(sub, "tracking")
            return sub
          }),
        }
      }
      return item
    })
  }, [collections, features, lockSub])

  // Gate Store section items + sub-items
  const navStore = React.useMemo(() => {
    return data.navStore.map((item) => {
      if (item.title === "Reviews" && features && !features.reviews) {
        return { ...item, locked: true }
      }
      if (item.title === "Auctions" && features && !features.auctions) {
        return { ...item, locked: true }
      }
      if (item.title === "Customers" && item.items) {
        return {
          ...item,
          items: item.items.map((sub) => {
            if (sub.title === "Segments") return lockSub(sub, "segments")
            if (sub.title === "Loyalty & Rewards") return lockSub(sub, "loyalty")
            if (sub.title === "Gift Cards") return lockSub(sub, "giftCards")
            return sub
          }),
        }
      }
      return item
    })
  }, [features, lockSub])

  // Gate Overview section (Analytics)
  const navOverview = React.useMemo(() => {
    return data.navOverview.map((item) => {
      if (item.title === "Analytics" && features && !features.analytics) {
        return { ...item, locked: true }
      }
      return item
    })
  }, [features])

  return (
    <SidebarStateContext.Provider value={sidebarState}>
      <Sidebar variant="inset" collapsible={collapsible} {...props}>
        {isWorkflowMode && (
          <SidebarHeader>
            <WorkflowHeader />
          </SidebarHeader>
        )}
            <SidebarContent
              className={isWorkflowMode ? undefined : "pt-2"}
              onScrollPosition={isWorkflowMode ? undefined : sidebarState.setScrollPosition}
              initialScrollTop={isWorkflowMode ? 0 : sidebarState.scrollPosition}
            >
              {isWorkflowMode ? (
                <WorkflowSidebarContent />
              ) : (
                <NormalSidebarContent navOverview={navOverview} navOperations={navOperations} navStore={navStore} />
              )}
            </SidebarContent>
            <SidebarFooter>
              <StorageIndicator />
            </SidebarFooter>
      </Sidebar>
    </SidebarStateContext.Provider>
  )
}
