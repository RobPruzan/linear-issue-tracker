"use client";

import {
  Circle,
  CircleDot,
  CircleDashed,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Inbox,
  ListTodo,
  Archive,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useStore, setActiveView, Status, setFilterStatus } from "../store";

const statusConfig: { status: Status; label: string; Icon: typeof Circle; colorVar: string }[] = [
  { status: "backlog", label: "Backlog", Icon: CircleDashed, colorVar: "var(--color-status-backlog)" },
  { status: "todo", label: "Todo", Icon: Circle, colorVar: "var(--color-status-todo)" },
  { status: "in_progress", label: "In Progress", Icon: CircleDot, colorVar: "var(--color-status-progress)" },
  { status: "done", label: "Done", Icon: CheckCircle2, colorVar: "var(--color-status-done)" },
  { status: "cancelled", label: "Cancelled", Icon: XCircle, colorVar: "var(--color-status-cancelled)" },
];

export function Sidebar() {
  const activeView = useStore((s) => s.activeView);
  const filterStatus = useStore((s) => s.filterStatus);
  const issues = useStore((s) => s.issues);

  const getCountForStatus = (status: Status) => issues.filter((i) => i.status === status).length;
  const getActiveCount = () => issues.filter((i) => i.status === "in_progress" || i.status === "todo").length;
  const getBacklogCount = () => issues.filter((i) => i.status === "backlog").length;

  return (
    <aside className="w-[220px] h-full flex flex-col bg-bg-secondary border-r border-border-subtle">
      <div className="h-12 px-3 flex items-center border-b border-border-subtle">
        <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-bg-hover transition-colors">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center text-xs font-medium">
            W
          </div>
          <span className="text-sm font-medium text-text-primary">Workspace</span>
          <ChevronDown size={14} className="text-text-tertiary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-2 mb-4">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors text-sm">
            <Search size={16} />
            <span>Search</span>
            <span className="ml-auto text-xs text-text-tertiary">⌘K</span>
          </button>
        </div>

        <nav className="px-2 space-y-0.5">
          <button
            onClick={() => {
              setActiveView("all");
              setFilterStatus(null);
            }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
              activeView === "all" && !filterStatus
                ? "bg-bg-hover text-text-primary"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            <Inbox size={16} />
            <span>All Issues</span>
            <span className="ml-auto text-xs text-text-tertiary">{issues.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveView("active");
              setFilterStatus(null);
            }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
              activeView === "active"
                ? "bg-bg-hover text-text-primary"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            <ListTodo size={16} />
            <span>Active</span>
            <span className="ml-auto text-xs text-text-tertiary">{getActiveCount()}</span>
          </button>

          <button
            onClick={() => {
              setActiveView("backlog");
              setFilterStatus(null);
            }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
              activeView === "backlog"
                ? "bg-bg-hover text-text-primary"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            <Archive size={16} />
            <span>Backlog</span>
            <span className="ml-auto text-xs text-text-tertiary">{getBacklogCount()}</span>
          </button>
        </nav>

        <div className="mt-6 px-2">
          <div className="px-2 py-1.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
            By Status
          </div>
          <nav className="mt-1 space-y-0.5">
            {statusConfig.map(({ status, label, Icon, colorVar }) => (
              <button
                key={status}
                onClick={() => {
                  setActiveView("all");
                  setFilterStatus(filterStatus === status ? null : status);
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                  filterStatus === status
                    ? "bg-bg-hover text-text-primary"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                }`}
              >
                <Icon size={16} style={{ color: colorVar }} />
                <span>{label}</span>
                <span className="ml-auto text-xs text-text-tertiary">{getCountForStatus(status)}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-2 border-t border-border-subtle">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors text-sm">
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
