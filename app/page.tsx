"use client";

import { useEffect } from "react";
import { Sidebar } from "./components/sidebar";
import { IssueList } from "./components/issue-list";
import { IssueDetail } from "./components/issue-detail";
import { useStore, selectIssue, useFilteredIssues } from "./store";

export default function Home() {
  const selectedIssueId = useStore((s) => s.selectedIssueId);
  const issues = useFilteredIssues();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "Escape") {
        selectIssue(null);
      }

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const currentIndex = issues.findIndex((i) => i.id === selectedIssueId);
        if (currentIndex < issues.length - 1) {
          selectIssue(issues[currentIndex + 1].id);
        } else if (currentIndex === -1 && issues.length > 0) {
          selectIssue(issues[0].id);
        }
      }

      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentIndex = issues.findIndex((i) => i.id === selectedIssueId);
        if (currentIndex > 0) {
          selectIssue(issues[currentIndex - 1].id);
        }
      }

      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search..."]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIssueId, issues]);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar />
      <IssueList />
      {selectedIssueId && <IssueDetail />}
    </div>
  );
}
