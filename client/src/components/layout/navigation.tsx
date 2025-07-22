import { Link, useLocation } from "wouter";
import { Bell, ChevronDown } from "lucide-react";

interface NavigationProps {
  title: string;
  showBackButton?: boolean;
}

export function Navigation({ title, showBackButton = false }: NavigationProps) {
  const [, setLocation] = useLocation();

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button 
              onClick={() => setLocation("/")}
              className="flex items-center text-slate-600 hover:text-primary transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
          )}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">S</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="h-5 w-5 text-slate-500 hover:text-primary cursor-pointer" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">S</span>
            </div>
            <span className="text-slate-700 font-medium">Admin</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </nav>
  );
}
