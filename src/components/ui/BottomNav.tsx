import { NavLink } from "react-router-dom";
import { Timer, History, LayoutDashboard, Settings } from "lucide-react";

const BottomNav = () => {
  return (
    <nav className="w-full bg-card/80 backdrop-blur-sm border-t border-border flex justify-around items-center h-16">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${
            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`
        }
      >
        <Timer className="w-5 h-5" />
        <span className="text-xs">Timer</span>
      </NavLink>
      <NavLink
        to="/history"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${
            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`
        }
      >
        <History className="w-5 h-5" />
        <span className="text-xs">Histórico</span>
      </NavLink>
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${
            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-xs">Painel</span>
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${
            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`
        }
      >
        <Settings className="w-5 h-5" />
        <span className="text-xs">Ajustes</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;