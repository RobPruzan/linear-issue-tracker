"use client";

import { useState, useRef, useEffect } from "react";
import {
  Circle,
  CircleDot,
  CircleDashed,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  SignalHigh,
  Signal,
  SignalMedium,
  SignalLow,
  Minus,
} from "lucide-react";
import {
  useFilteredIssues,
  useStore,
  selectIssue,
  setSearchQuery,
  updateIssue,
  createIssue,
  Issue,
  Status,
  Priority,
  getLabelById,
} from "../store";

const statusIcons: Record<Status, typeof Circle> = {
  backlog: CircleDashed,
  todo: Circle,
  in_progress: CircleDot,
  done: CheckCircle2,
  cancelled: XCircle,
};

const statusColors: Record<Status, string> = {
  backlog: "var(--color-status-backlog)",
  todo: "var(--color-status-todo)",
  in_progress: "var(--color-status-progress)",
  done: "var(--color-status-done)",
  cancelled: "var(--color-status-cancelled)",
};

const priorityIcons: Record<Priority, typeof Signal> = {
  urgent: SignalHigh,
  high: SignalHigh,
  medium: SignalMedium,
  low: SignalLow,
  none: Minus,
};

const priorityColors: Record<Priority, string> = {
  urgent: "var(--color-priority-urgent)",
  high: "var(--color-priority-high)",
  medium: "var(--color-priority-medium)",
  low: "var(--color-priority-low)",
  none: "var(--color-priority-none)",
};

function StatusDropdown({
  status,
  onChange,
  onClose,
}: {
  status: Status;
  onChange: (s: Status) => void;
  onClose: () => void;
}) {
  const statuses: { value: Status; label: string }[] = [
    { value: "backlog", label: "Backlog" },
    { value: "todo", label: "Todo" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
    { value: "cancelled", label: "Cancelled" },
  ];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-1 z-50 bg-bg-secondary border border-border rounded-lg shadow-xl py-1 min-w-[140px]"
      onClick={(e) => e.stopPropagation()}
    >
      {statuses.map((s) => {
        const Icon = statusIcons[s.value];
        return (
          <button
            key={s.value}
            onClick={() => {
              onChange(s.value);
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
              status === s.value
                ? "bg-bg-hover text-text-primary"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            <Icon size={14} style={{ color: statusColors[s.value] }} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function PriorityDropdown({
  priority,
  onChange,
  onClose,
}: {
  priority: Priority;
  onChange: (p: Priority) => void;
  onClose: () => void;
}) {
  const priorities: { value: Priority; label: string }[] = [
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
    { value: "none", label: "No priority" },
  ];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-1 z-50 bg-bg-secondary border border-border rounded-lg shadow-xl py-1 min-w-[140px]"
      onClick={(e) => e.stopPropagation()}
    >
      {priorities.map((p) => {
        const Icon = priorityIcons[p.value];
        return (
          <button
            key={p.value}
            onClick={() => {
              onChange(p.value);
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
              priority === p.value
                ? "bg-bg-hover text-text-primary"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            <Icon size={14} style={{ color: priorityColors[p.value] }} />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

function IssueRow({ issue, isSelected }: { issue: Issue; isSelected: boolean }) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const StatusIcon = statusIcons[issue.status];
  const PriorityIcon = priorityIcons[issue.priority];

  return (
    <div
      onClick={() => selectIssue(issue.id)}
      className={`group flex items-center gap-3 px-4 py-2 border-b border-border-subtle cursor-pointer transition-colors ${
        isSelected ? "bg-bg-hover" : "hover:bg-bg-hover"
      }`}
    >
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowStatusDropdown(!showStatusDropdown);
          }}
          className="p-0.5 rounded hover:bg-bg-active transition-colors"
        >
          <StatusIcon
            size={16}
            style={{ color: statusColors[issue.status] }}
          />
        </button>
        {showStatusDropdown && (
          <StatusDropdown
            status={issue.status}
            onChange={(s) => updateIssue(issue.id, { status: s })}
            onClose={() => setShowStatusDropdown(false)}
          />
        )}
      </div>

      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPriorityDropdown(!showPriorityDropdown);
          }}
          className="p-0.5 rounded hover:bg-bg-active transition-colors"
        >
          <PriorityIcon
            size={14}
            style={{ color: priorityColors[issue.priority] }}
          />
        </button>
        {showPriorityDropdown && (
          <PriorityDropdown
            priority={issue.priority}
            onChange={(p) => updateIssue(issue.id, { priority: p })}
            onClose={() => setShowPriorityDropdown(false)}
          />
        )}
      </div>

      <span className="hidden sm:inline text-xs text-text-tertiary w-[60px] shrink-0">
        {issue.identifier}
      </span>

      <span className="flex-1 text-sm text-text-primary truncate min-w-0">
        {issue.title}
      </span>

      <div className="hidden sm:flex items-center gap-2">
        {issue.labels.map((labelId) => {
          const label = getLabelById(labelId);
          if (!label) return null;
          return (
            <span
              key={labelId}
              className="px-1.5 py-0.5 text-xs rounded"
              style={{
                backgroundColor: `${label.color}20`,
                color: label.color,
              }}
            >
              {label.name}
            </span>
          );
        })}
      </div>

      {issue.assignee && (
        <div className="hidden sm:flex w-6 h-6 rounded-full bg-bg-active items-center justify-center text-xs font-medium text-text-secondary shrink-0">
          {issue.assignee.charAt(0)}
        </div>
      )}
    </div>
  );
}

function NewIssueInput({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (title.trim()) {
      createIssue({ title: title.trim() });
      setTitle("");
      onClose();
    }
  };

  return (
    <div className="border-b border-border-subtle">
      <div className="flex items-center gap-3 px-4 py-2">
        <CircleDashed size={16} className="text-text-tertiary" />
        <Minus size={14} className="text-text-tertiary" />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") onClose();
          }}
          placeholder="Issue title"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          Create
        </button>
        <button
          onClick={onClose}
          className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function IssueList() {
  const issues = useFilteredIssues();
  const selectedIssueId = useStore((s) => s.selectedIssueId);
  const searchQuery = useStore((s) => s.searchQuery);
  const activeView = useStore((s) => s.activeView);
  const filterStatus = useStore((s) => s.filterStatus);
  const [showNewIssue, setShowNewIssue] = useState(false);

  const viewTitles = {
    all: "All Issues",
    active: "Active",
    backlog: "Backlog",
  };

  const title = filterStatus
    ? filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1).replace("_", " ")
    : viewTitles[activeView];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-bg-primary">
      <header className="h-12 px-4 pl-14 md:pl-4 flex items-center justify-between border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-text-primary">{title}</h1>
          <span className="text-xs text-text-tertiary">{issues.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-48 h-7 pl-7 pr-2 bg-bg-secondary border border-border-subtle rounded text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
            />
          </div>

          <button
            onClick={() => setShowNewIssue(true)}
            className="flex items-center gap-1 h-7 px-2 bg-accent text-white text-sm rounded hover:bg-accent-hover transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {showNewIssue && <NewIssueInput onClose={() => setShowNewIssue(false)} />}

        {issues.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            isSelected={selectedIssueId === issue.id}
          />
        ))}

        {issues.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
            <p className="text-sm">No issues found</p>
          </div>
        )}
      </div>
    </div>
  );
}
