import {
  LayoutDashboard, Users, Shield, UserCog, Calendar,
  MapPin, ClipboardCheck, HeartPulse, DollarSign,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Players", url: "/players", icon: Users },
  { title: "Teams", url: "/teams", icon: Shield },
  { title: "Coaches", url: "/coaches", icon: UserCog },
  { title: "Schedules", url: "/schedules", icon: Calendar },
  { title: "Venues", url: "/venues", icon: MapPin },
  { title: "Attendance", url: "/attendance", icon: ClipboardCheck },
  { title: "Injuries", url: "/injuries", icon: HeartPulse },
  { title: "Finance", url: "/finance", icon: DollarSign },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-7 w-7 text-sidebar-primary" />
              <span className="font-bold text-lg text-sidebar-foreground">SportsMgr</span>
            </div>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
