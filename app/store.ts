import { useState, useEffect } from "react";

export type Status = "backlog" | "todo" | "in_progress" | "done" | "cancelled";
export type Priority = "none" | "low" | "medium" | "high" | "urgent";

export interface Issue {
  id: string;
  identifier: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string | null;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  issueCount: number;
}

interface StoreState {
  issues: Issue[];
  labels: Label[];
  projects: Project[];
  selectedIssueId: string | null;
  activeView: "all" | "active" | "backlog";
  filterStatus: Status | null;
  searchQuery: string;
}

type Listener = () => void;

const labels: Label[] = [
  { id: "1", name: "bug", color: "#ef4444" },
  { id: "2", name: "feature", color: "#6366f1" },
  { id: "3", name: "improvement", color: "#22c55e" },
  { id: "4", name: "documentation", color: "#f59e0b" },
  { id: "5", name: "design", color: "#ec4899" },
];

const assignees = [
  "Alex Chen",
  "Jordan Smith",
  "Taylor Brown",
  "Morgan Davis",
  "Casey Wilson",
  null,
];

const issueTitles = [
  "Fix authentication flow on mobile devices",
  "Add dark mode support to settings panel",
  "Optimize database queries for user search",
  "Implement real-time notifications",
  "Update API documentation for v2 endpoints",
  "Refactor payment processing module",
  "Add export functionality for reports",
  "Fix memory leak in WebSocket connection",
  "Improve error handling in file upload",
  "Add keyboard shortcuts for common actions",
  "Implement user invitation flow",
  "Fix timezone issues in scheduling",
  "Add batch delete for archived items",
  "Improve loading states across the app",
  "Fix race condition in data sync",
  "Add support for custom fields",
  "Implement audit logging",
  "Fix pagination in activity feed",
  "Add two-factor authentication",
  "Improve search relevance algorithm",
  "Fix CSS overflow issues on small screens",
  "Add webhook configuration UI",
  "Implement data backup automation",
  "Fix email template rendering",
  "Add role-based access control",
];

const descriptions = [
  "Users are experiencing issues when trying to authenticate on mobile. The login button becomes unresponsive after the first tap.",
  "We need to add a dark mode toggle in the settings panel. Should respect system preferences by default.",
  "The user search is taking too long with large datasets. Need to add proper indexing and optimize the query.",
  "Implement WebSocket-based real-time notifications for mentions, assignments, and status changes.",
  "The v2 API documentation is incomplete. Need to document all new endpoints with examples.",
  "The payment module has grown complex. Need to refactor for better maintainability and testing.",
  "Users want to export their reports to CSV and PDF formats.",
  "There's a memory leak when WebSocket connections are repeatedly opened and closed.",
  "File uploads sometimes fail silently. Need better error messages and retry logic.",
  "Power users are requesting keyboard shortcuts for navigation and common actions.",
  "Implement a flow for existing users to invite team members via email.",
  "Scheduled events are showing wrong times for users in different timezones.",
  "When archiving items in bulk, users need to confirm each one. Add batch operations.",
  "Loading states are inconsistent. Some pages show nothing while loading.",
  "Data sync sometimes overwrites newer changes with older data due to race conditions.",
  "Enterprise customers need custom fields for their specific workflows.",
  "For compliance, we need to log all user actions with timestamps.",
  "The activity feed pagination breaks when new items are added while scrolling.",
  "Security requirement: implement TOTP-based two-factor authentication.",
  "Search results don't prioritize exact matches. Need to improve the ranking algorithm.",
  "On mobile screens, some content overflows and becomes inaccessible.",
  "Users need a UI to configure webhooks for external integrations.",
  "Implement automated daily backups with configurable retention.",
  "Some email clients don't render our templates correctly.",
  "Implement granular permissions for different user roles.",
];

// Deterministic data to avoid hydration mismatch
const issueData: { status: Status; priority: Priority; assigneeIdx: number; labelIds: string[] }[] = [
  { status: "todo", priority: "none", assigneeIdx: 3, labelIds: ["4", "2"] },
  { status: "backlog", priority: "low", assigneeIdx: 5, labelIds: [] },
  { status: "cancelled", priority: "medium", assigneeIdx: 5, labelIds: ["1"] },
  { status: "in_progress", priority: "high", assigneeIdx: 5, labelIds: ["1"] },
  { status: "in_progress", priority: "urgent", assigneeIdx: 4, labelIds: ["1", "2"] },
  { status: "done", priority: "none", assigneeIdx: 5, labelIds: ["3", "5"] },
  { status: "in_progress", priority: "low", assigneeIdx: 3, labelIds: ["2"] },
  { status: "in_progress", priority: "medium", assigneeIdx: 3, labelIds: ["1", "2"] },
  { status: "todo", priority: "high", assigneeIdx: 3, labelIds: [] },
  { status: "in_progress", priority: "urgent", assigneeIdx: 0, labelIds: ["2", "4"] },
  { status: "in_progress", priority: "none", assigneeIdx: 5, labelIds: ["1", "5"] },
  { status: "backlog", priority: "low", assigneeIdx: 5, labelIds: [] },
  { status: "todo", priority: "medium", assigneeIdx: 0, labelIds: ["2", "3"] },
  { status: "cancelled", priority: "high", assigneeIdx: 0, labelIds: ["1"] },
  { status: "todo", priority: "urgent", assigneeIdx: 5, labelIds: ["3", "2"] },
  { status: "done", priority: "none", assigneeIdx: 4, labelIds: ["1", "4"] },
  { status: "in_progress", priority: "low", assigneeIdx: 3, labelIds: ["2", "5"] },
  { status: "backlog", priority: "medium", assigneeIdx: 5, labelIds: [] },
  { status: "in_progress", priority: "high", assigneeIdx: 5, labelIds: ["1", "2"] },
  { status: "backlog", priority: "urgent", assigneeIdx: 4, labelIds: [] },
  { status: "backlog", priority: "none", assigneeIdx: 5, labelIds: ["1", "5"] },
  { status: "in_progress", priority: "low", assigneeIdx: 3, labelIds: ["2", "1"] },
  { status: "backlog", priority: "medium", assigneeIdx: 5, labelIds: ["3"] },
  { status: "backlog", priority: "high", assigneeIdx: 4, labelIds: ["3"] },
  { status: "backlog", priority: "urgent", assigneeIdx: 1, labelIds: ["2"] },
];

function generateIssues(): Issue[] {
  const baseDate = new Date("2025-12-22T12:00:00Z");
  const issues: Issue[] = [];

  for (let i = 0; i < 25; i++) {
    const data = issueData[i];
    const createdAt = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + 12 * 60 * 60 * 1000);

    issues.push({
      id: `issue-${i + 1}`,
      identifier: `ISS-${(i + 1).toString().padStart(3, "0")}`,
      title: issueTitles[i],
      description: descriptions[i],
      status: data.status,
      priority: data.priority,
      assignee: assignees[data.assigneeIdx],
      labels: data.labelIds,
      createdAt,
      updatedAt,
    });
  }

  return issues;
}

const initialState: StoreState = {
  issues: generateIssues(),
  labels,
  projects: [{ id: "1", name: "Main Project", key: "ISS", issueCount: 25 }],
  selectedIssueId: null,
  activeView: "all",
  filterStatus: null,
  searchQuery: "",
};

let state = initialState;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore<T>(selector: (state: StoreState) => T): T {
  const [value, setValue] = useState(() => selector(state));

  useEffect(() => {
    const callback = () => setValue(selector(state));
    listeners.add(callback);
    // Call immediately in case state changed between render and effect
    callback();
    return () => {
      listeners.delete(callback);
    };
  }, [selector]);

  return value;
}

export function selectIssue(id: string | null) {
  state = { ...state, selectedIssueId: id };
  emitChange();
}

export function setActiveView(view: "all" | "active" | "backlog") {
  state = { ...state, activeView: view };
  emitChange();
}

export function setFilterStatus(status: Status | null) {
  state = { ...state, filterStatus: status };
  emitChange();
}

export function setSearchQuery(query: string) {
  state = { ...state, searchQuery: query };
  emitChange();
}

export function updateIssue(id: string, updates: Partial<Issue>) {
  state = {
    ...state,
    issues: state.issues.map((issue) =>
      issue.id === id ? { ...issue, ...updates, updatedAt: new Date() } : issue
    ),
  };
  emitChange();
}

export function createIssue(data: { title: string; description?: string; status?: Status; priority?: Priority }) {
  const newIssue: Issue = {
    id: `issue-${Date.now()}`,
    identifier: `ISS-${(state.issues.length + 1).toString().padStart(3, "0")}`,
    title: data.title,
    description: data.description || "",
    status: data.status || "backlog",
    priority: data.priority || "none",
    assignee: null,
    labels: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  state = { ...state, issues: [newIssue, ...state.issues] };
  emitChange();
  return newIssue;
}

export function deleteIssue(id: string) {
  state = {
    ...state,
    issues: state.issues.filter((issue) => issue.id !== id),
    selectedIssueId: state.selectedIssueId === id ? null : state.selectedIssueId,
  };
  emitChange();
}

export function getFilteredIssues(state: StoreState): Issue[] {
  let issues = state.issues;

  if (state.activeView === "active") {
    issues = issues.filter((i) => i.status === "in_progress" || i.status === "todo");
  } else if (state.activeView === "backlog") {
    issues = issues.filter((i) => i.status === "backlog");
  }

  if (state.filterStatus) {
    issues = issues.filter((i) => i.status === state.filterStatus);
  }

  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    issues = issues.filter(
      (i) =>
        i.title.toLowerCase().includes(query) ||
        i.identifier.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query)
    );
  }

  return issues;
}

export function useFilteredIssues() {
  return useStore(getFilteredIssues);
}

export function useSelectedIssue() {
  return useStore((state) => {
    if (!state.selectedIssueId) return null;
    return state.issues.find((i) => i.id === state.selectedIssueId) || null;
  });
}

export function useLabels() {
  return useStore((state) => state.labels);
}

export function getLabelById(id: string) {
  return state.labels.find((l) => l.id === id);
}
