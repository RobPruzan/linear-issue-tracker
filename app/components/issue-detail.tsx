"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Circle,
  CircleDot,
  CircleDashed,
  CheckCircle2,
  XCircle,
  SignalHigh,
  Signal,
  SignalMedium,
  SignalLow,
  Minus,
  User,
  Tag,
  Calendar,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  useSelectedIssue,
  useLabels,
  selectIssue,
  updateIssue,
  deleteIssue,
  Status,
  Priority,
  getLabelById,
} from "../store";

const statusConfig: { value: Status; label: string; Icon: typeof Circle; color: string }[] = [
  { value: "backlog", label: "Backlog", Icon: CircleDashed, color: "var(--color-status-backlog)" },
  { value: "todo", label: "Todo", Icon: Circle, color: "var(--color-status-todo)" },
  { value: "in_progress", label: "In Progress", Icon: CircleDot, color: "var(--color-status-progress)" },
  { value: "done", label: "Done", Icon: CheckCircle2, color: "var(--color-status-done)" },
  { value: "cancelled", label: "Cancelled", Icon: XCircle, color: "var(--color-status-cancelled)" },
];

const priorityConfig: { value: Priority; label: string; Icon: typeof Signal; color: string }[] = [
  { value: "urgent", label: "Urgent", Icon: SignalHigh, color: "var(--color-priority-urgent)" },
  { value: "high", label: "High", Icon: SignalHigh, color: "var(--color-priority-high)" },
  { value: "medium", label: "Medium", Icon: SignalMedium, color: "var(--color-priority-medium)" },
  { value: "low", label: "Low", Icon: SignalLow, color: "var(--color-priority-low)" },
  { value: "none", label: "No priority", Icon: Minus, color: "var(--color-priority-none)" },
];

const assignees = [
  "Alex Chen",
  "Jordan Smith",
  "Taylor Brown",
  "Morgan Davis",
  "Casey Wilson",
];

function PropertyRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-24 flex items-center gap-2 text-text-tertiary">
        <Icon size={14} />
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Dropdown<T extends string>({
  value,
  options,
  onChange,
  renderOption,
  renderSelected,
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
  renderOption: (value: T, isSelected: boolean) => React.ReactNode;
  renderSelected: (value: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-bg-hover transition-colors text-sm"
      >
        {renderSelected(value)}
        <ChevronDown size={12} className="text-text-tertiary" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-bg-secondary border border-border rounded-lg shadow-xl py-1 min-w-[160px]">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-bg-hover transition-colors"
            >
              {renderOption(option, value === option)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function IssueDetail() {
  const issue = useSelectedIssue();
  const labels = useLabels();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (issue) {
      setEditedTitle(issue.title);
      setEditedDescription(issue.description);
    }
  }, [issue?.id]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription) {
      descriptionRef.current?.focus();
    }
  }, [isEditingDescription]);

  if (!issue) {
    return null;
  }

  const saveTitle = () => {
    if (editedTitle.trim() && editedTitle !== issue.title) {
      updateIssue(issue.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const saveDescription = () => {
    if (editedDescription !== issue.description) {
      updateIssue(issue.id, { description: editedDescription });
    }
    setIsEditingDescription(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div
        className="md:hidden fixed inset-0 bg-black/50 z-40"
        onClick={() => selectIssue(null)}
      />
      <div className="fixed md:relative inset-y-0 right-0 z-50 w-full sm:w-[400px] h-full bg-bg-secondary border-l border-border-subtle flex flex-col shrink-0">
      <header className="h-12 px-4 flex items-center justify-between border-b border-border-subtle shrink-0">
        <span className="text-xs text-text-tertiary">{issue.identifier}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              deleteIssue(issue.id);
            }}
            className="p-1.5 rounded hover:bg-bg-hover text-text-tertiary hover:text-[#ef4444] transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => selectIssue(null)}
            className="p-1.5 rounded hover:bg-bg-hover text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setEditedTitle(issue.title);
                  setIsEditingTitle(false);
                }
              }}
              className="w-full text-lg font-medium bg-transparent outline-none text-text-primary"
            />
          ) : (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="text-lg font-medium text-text-primary cursor-text hover:bg-bg-hover rounded px-1 -mx-1 transition-colors"
            >
              {issue.title}
            </h2>
          )}
        </div>

        <div className="space-y-1 mb-6 pb-6 border-b border-border-subtle">
          <PropertyRow icon={Circle} label="Status">
            <Dropdown
              value={issue.status}
              options={statusConfig.map((s) => s.value)}
              onChange={(status) => updateIssue(issue.id, { status })}
              renderSelected={(value) => {
                const config = statusConfig.find((s) => s.value === value)!;
                const Icon = config.Icon;
                return (
                  <span className="flex items-center gap-2 text-text-secondary">
                    <Icon size={14} style={{ color: config.color }} />
                    <span className="text-sm">{config.label}</span>
                  </span>
                );
              }}
              renderOption={(value, isSelected) => {
                const config = statusConfig.find((s) => s.value === value)!;
                const Icon = config.Icon;
                return (
                  <span
                    className={`flex items-center gap-2 text-sm ${
                      isSelected ? "text-text-primary" : "text-text-secondary"
                    }`}
                  >
                    <Icon size={14} style={{ color: config.color }} />
                    {config.label}
                  </span>
                );
              }}
            />
          </PropertyRow>

          <PropertyRow icon={Signal} label="Priority">
            <Dropdown
              value={issue.priority}
              options={priorityConfig.map((p) => p.value)}
              onChange={(priority) => updateIssue(issue.id, { priority })}
              renderSelected={(value) => {
                const config = priorityConfig.find((p) => p.value === value)!;
                const Icon = config.Icon;
                return (
                  <span className="flex items-center gap-2 text-text-secondary">
                    <Icon size={14} style={{ color: config.color }} />
                    <span className="text-sm">{config.label}</span>
                  </span>
                );
              }}
              renderOption={(value, isSelected) => {
                const config = priorityConfig.find((p) => p.value === value)!;
                const Icon = config.Icon;
                return (
                  <span
                    className={`flex items-center gap-2 text-sm ${
                      isSelected ? "text-text-primary" : "text-text-secondary"
                    }`}
                  >
                    <Icon size={14} style={{ color: config.color }} />
                    {config.label}
                  </span>
                );
              }}
            />
          </PropertyRow>

          <PropertyRow icon={User} label="Assignee">
            <Dropdown
              value={issue.assignee || "unassigned"}
              options={["unassigned", ...assignees]}
              onChange={(assignee) =>
                updateIssue(issue.id, {
                  assignee: assignee === "unassigned" ? null : assignee,
                })
              }
              renderSelected={(value) => (
                <span className="flex items-center gap-2 text-text-secondary">
                  {value === "unassigned" ? (
                    <span className="text-sm text-text-tertiary">Unassigned</span>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-bg-active flex items-center justify-center text-xs">
                        {value.charAt(0)}
                      </div>
                      <span className="text-sm">{value}</span>
                    </>
                  )}
                </span>
              )}
              renderOption={(value, isSelected) => (
                <span
                  className={`flex items-center gap-2 text-sm ${
                    isSelected ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {value === "unassigned" ? (
                    <span className="text-text-tertiary">Unassigned</span>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-bg-active flex items-center justify-center text-xs">
                        {value.charAt(0)}
                      </div>
                      {value}
                    </>
                  )}
                </span>
              )}
            />
          </PropertyRow>

          <PropertyRow icon={Tag} label="Labels">
            <div className="flex flex-wrap gap-1">
              {issue.labels.length === 0 ? (
                <span className="text-sm text-text-tertiary">None</span>
              ) : (
                issue.labels.map((labelId) => {
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
                })
              )}
            </div>
          </PropertyRow>

          <PropertyRow icon={Calendar} label="Created">
            <span className="text-sm text-text-secondary">
              {formatDate(issue.createdAt)}
            </span>
          </PropertyRow>
        </div>

        <div>
          <div className="text-xs text-text-tertiary mb-2">Description</div>
          {isEditingDescription ? (
            <textarea
              ref={descriptionRef}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={saveDescription}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditedDescription(issue.description);
                  setIsEditingDescription(false);
                }
              }}
              className="w-full min-h-[120px] p-2 bg-bg-hover border border-border rounded text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent resize-none transition-colors"
              placeholder="Add a description..."
            />
          ) : (
            <div
              onClick={() => setIsEditingDescription(true)}
              className={`min-h-[60px] p-2 rounded cursor-text hover:bg-bg-hover transition-colors text-sm ${
                issue.description ? "text-text-secondary" : "text-text-tertiary"
              }`}
            >
              {issue.description || "Add a description..."}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
