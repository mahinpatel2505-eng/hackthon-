"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardCheck,
  History,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  {
    name: "Operations",
    icon: ArrowLeftRight,
    children: [
      { name: "Receipts", href: "/operations/receipts", icon: ArrowDownToLine },
      { name: "Deliveries", href: "/operations/deliveries", icon: ArrowUpFromLine },
      { name: "Transfers", href: "/operations/transfers", icon: ArrowLeftRight },
      { name: "Adjustments", href: "/operations/adjustments", icon: ClipboardCheck },
      { name: "Move History", href: "/operations/ledger", icon: History },
    ],
  },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Operations"]);

  const toggleItem = (name: string) => {
    setExpandedItems((prev: string[]) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-transform bg-card border-r w-64",
          !isOpen && "-translate-x-full md:translate-x-0 md:w-20"
        )}
      >
        <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold truncate">CoreInventory</h1>
                <p className="text-xs text-muted-foreground truncate">Enterprise v1.0</p>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleItem(item.name)}
                      className={cn(
                        "flex items-center w-full p-2 rounded-lg group transition-colors hover:bg-muted font-medium text-sm",
                        expandedItems.includes(item.name) && "text-primary"
                      )}
                    >
                      <item.icon className="w-5 h-5 transition duration-75" />
                      {isOpen && (
                        <>
                          <span className="ml-3 flex-1 text-left">{item.name}</span>
                          <ChevronRight
                            className={cn(
                              "w-4 h-4 transition-transform",
                              expandedItems.includes(item.name) && "rotate-90"
                            )}
                          />
                        </>
                      )}
                    </button>
                    {isOpen && expandedItems.includes(item.name) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              "flex items-center p-2 rounded-lg text-sm transition-colors hover:bg-muted",
                              pathname === child.href ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                            )}
                          >
                            <child.icon className="w-4 h-4 mr-3" />
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center p-2 rounded-lg group transition-colors hover:bg-muted text-sm font-medium",
                      pathname === item.href ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 transition duration-75" />
                    {isOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t space-y-2">
            {session?.user && isOpen && (
              <div className="px-2 py-3 mb-2 rounded-lg bg-muted/40 overflow-hidden">
                <p className="text-xs font-bold truncate">{session.user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
                <div className="mt-2 text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-full inline-block">
                  {session.user.role}
                </div>
              </div>
            )}
            <Link
              href="/profile"
              className={cn(
                "flex items-center p-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted text-muted-foreground",
                pathname === "/profile" && "bg-primary/10 text-primary"
              )}
            >
              <User className="w-5 h-5" />
              {isOpen && <span className="ml-3">My Profile</span>}
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center w-full p-2 rounded-lg text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              {isOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
