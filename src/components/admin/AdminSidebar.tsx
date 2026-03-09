import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, BookOpen, Bot, Hand, Video, MessageSquare,
  Film, IndianRupee, CreditCard, BarChart3, Bell, CalendarDays,
  Database, HardDrive, Shield, Settings, LifeBuoy, UserCog,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const groups = [
  {
    label: "Platform",
    items: [
      { title: "Overview", url: "/admin", icon: LayoutDashboard },
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Spiritual Content", url: "/admin/content", icon: BookOpen },
      { title: "AI Systems", url: "/admin/ai-systems", icon: Bot },
      { title: "Palm Reading", url: "/admin/palm-reading", icon: Hand },
      { title: "Live Darshan", url: "/admin/darshan", icon: Video },
      { title: "Community", url: "/admin/community", icon: MessageSquare },
      { title: "Bhakti Shorts", url: "/admin/shorts", icon: Film },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Donations", url: "/admin/donations", icon: IndianRupee },
      { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Notifications", url: "/admin/notifications", icon: Bell },
      { title: "Calendar", url: "/admin/calendar", icon: CalendarDays },
      { title: "Database", url: "/admin/database", icon: Database },
      { title: "Storage", url: "/admin/storage", icon: HardDrive },
      { title: "Roles", url: "/admin/roles", icon: UserCog },
      { title: "Security", url: "/admin/security", icon: Shield },
      { title: "Settings", url: "/admin/settings", icon: Settings },
      { title: "Support", url: "/admin/support", icon: LifeBuoy },
    ],
  },
];

export default function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  const isActive = (url: string) =>
    url === "/admin" ? pathname === "/admin" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <SidebarContent className="bg-sidebar pt-2">
        {!collapsed && (
          <div className="px-4 py-3 mb-2">
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🕉️ BhaktVerse
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Admin Console
            </p>
          </div>
        )}
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              {g.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url} className="transition-colors">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
