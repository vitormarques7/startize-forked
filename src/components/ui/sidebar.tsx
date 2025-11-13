import { NavLink } from "react-router-dom";
import { Timer, History, LayoutDashboard, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="w-20 bg-card/50 flex flex-col items-center py-6 space-y-6 border-r border-border/50">
      <div className="text-primary font-bold text-2xl">
        <span className="block w-8 h-8 bg-primary rounded-lg"></span>
      </div>
      <nav className="flex flex-col items-center space-y-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `p-3 rounded-lg transition-colors duration-200 ${
              isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <Timer className="w-6 h-6" />
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `p-3 rounded-lg transition-colors duration-200 ${
              isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <History className="w-6 h-6" />
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `p-3 rounded-lg transition-colors duration-200 ${
              isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <LayoutDashboard className="w-6 h-6" />
        </NavLink>
      </nav>
      <div className="mt-auto">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `p-3 rounded-lg transition-colors duration-200 ${
              isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <Settings className="w-6 h-6" />
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;