
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MessageSquare, LogOut, User, Settings } from "lucide-react";
import { Logo } from "./Logo";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const { messages } = useData();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Count unread messages for the current user
  const unreadMessages = messages.filter(
    msg => msg.recipientId === currentUser?.id && !msg.isRead
  ).length;

  // Mock notifications
  const notifications = [
    { 
      id: 1, 
      title: "New Job Assigned", 
      description: "You've been assigned a new residential project", 
      time: "5 minutes ago",
      read: false,
      type: "job"
    },
    { 
      id: 2, 
      title: "Task Completed", 
      description: "Site analysis for Project Alpha has been completed", 
      time: "2 hours ago",
      read: false,
      type: "task"
    },
    { 
      id: 3, 
      title: "System Update", 
      description: "The platform will be under maintenance tomorrow at 2AM", 
      time: "5 hours ago",
      read: true,
      type: "system"
    },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Get notification badge style based on type
  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'job':
        return <Badge className="bg-blue-500">Job</Badge>;
      case 'task':
        return <Badge className="bg-green-500">Task</Badge>;
      case 'system':
        return <Badge className="bg-orange-500">System</Badge>;
      default:
        return <Badge>Info</Badge>;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center space-x-2 md:hidden">
          <Logo size="sm" />
          <span className="font-bold text-xl">ArchiConnect</span>
        </Link>

        {currentUser ? (
          <div className="flex items-center ml-auto space-x-4">
            <Link to="/messages">
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <span className="notification-badge">
                    {unreadMessages}
                  </span>
                )}
              </Button>
            </Link>
            
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="notification-badge">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer ${!notification.read ? 'bg-muted/20' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                          <div>{getNotificationBadge(notification.type)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-2 border-t text-center">
                  <Button variant="link" className="w-full text-sm">
                    Mark all as read
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    {currentUser.avatarUrl ? (
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name} 
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                    <span className="inline-flex items-center rounded-md bg-architect-light/50 px-2 py-1 text-xs font-medium text-architect-dark mt-2 w-min capitalize">
                      {currentUser.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                {currentUser.role === "admin" && (
                  <Link to="/settings">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="ml-auto space-x-2">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Register</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
