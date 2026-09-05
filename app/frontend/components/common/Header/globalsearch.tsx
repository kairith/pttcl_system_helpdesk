"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Combobox, Transition } from "@headlessui/react";

export interface Permissions {
  add_user_status: boolean;
  edit_user_status: boolean;
  delete_user_status: boolean;
  list_user_status: boolean;
  add_ticket_status: boolean;
  edit_ticket_status: boolean;
  delete_ticket_status: boolean;
  list_ticket_status: boolean;
  list_ticket_assign: boolean;
  add_user_rules: boolean;
  edit_user_rules: boolean;
  delete_user_rules: boolean;
  list_user_rules: boolean;
  add_station: boolean;
  edit_station: boolean;
  delete_station: boolean;
  list_station: boolean;
  add_department: boolean;
  edit_department: boolean;
  delete_department: boolean;
  list_department: boolean;
  list_dashboard: boolean;
  list_track: boolean;
  list_report: boolean;
  list_alertbot: boolean;
}

type RouteKind = "page" | "create";

interface RouteOption {
  id: string;
  label: string;          // e.g., "Ticket"
  href: string;           // e.g., "/pages/admin/ticket"
  hrefCreate?: string;    // e.g., "/pages/admin/ticket/create"
  requiredPermission?: keyof Permissions;
  keywords?: string[];    // extra searchable terms
  kind?: RouteKind;       // used to render "Create …" suggestions
}

interface GlobalSearchProps {
  isAdmin: boolean;
  permissions: Permissions | null;
  placeholder?: string;
  className?: string;
}

const rank = (query: string, text: string) => {
  // very small scoring: startsWith > includes
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (!q) return 0;
  if (t.startsWith(q)) return 2;
  if (t.includes(q)) return 1;
  return 0;
};

const highlight = (text: string, q: string) => {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-semibold">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  );
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isAdmin,
  permissions,
  placeholder = "Search…",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RouteOption | null>(null);

  // Derive base path from role
  const base = isAdmin ? "/pages/admin" : "/pages/Users";

  // Single source of truth for routes (both page + create actions)
  const allOptions = useMemo<RouteOption[]>(() => {
    const opts: RouteOption[] = [
      { id: "dashboard", label: "Dashboard", href: `${base}/dashboard`, requiredPermission: "list_dashboard", keywords: ["home", "overview"] },
      { id: "ticket", label: "Ticket", href: `${base}/ticket`, requiredPermission: "list_ticket_status", keywords: ["tickets", "issues"] },
      { id: "ticket-create", label: "Create Ticket", href: `${base}/ticket`, hrefCreate: `${base}/ticket/add_ticket`, requiredPermission: "add_ticket_status", keywords: ["new ticket", "open ticket"], kind: "create" },
      { id: "station", label: "Station", href: `${base}/station`, requiredPermission: "list_station", keywords: ["locations", "map"] },
      { id: "station-create", label: "Create Station", href: `${base}/station`, hrefCreate: `${base}/station/add_station`, requiredPermission: "add_station", keywords: ["new station", "add station"], kind: "create" },
      { id: "department", label: "Department", href: `${base}/department`, requiredPermission: "list_department", keywords: ["departments", "teams"] },
      { id: "department-create", label: "Create Department", href: `${base}/department`, hrefCreate: `${base}/department/add_department`, requiredPermission: "add_department", keywords: ["new department", "add department"], kind: "create" },
      { id: "user", label: "Users", href: `${base}/user`, requiredPermission: "list_user_status", keywords: ["accounts", "members"] },
      { id: "user-create", label: "Create User", href: `${base}/user`, hrefCreate: `${base}/user/add_user`, requiredPermission: "add_user_status", keywords: ["invite", "add user"], kind: "create" },
      { id: "rules", label: "Users Rules", href: `${base}/user_rules`, requiredPermission: "list_user_rules", keywords: ["permissions", "roles", "rbac"] },
      { id: "rules-create", label: "Create Rule", href: `${base}/user_rules`, hrefCreate: `${base}/user_rules/add_rules`, requiredPermission: "add_user_rules", keywords: ["policy", "role"], kind: "create" },
      { id: "track", label: "Track", href: `${base}/track`, requiredPermission: "list_track", keywords: ["metrics", "monitoring"] },
      { id: "report", label: "Report", href: `${base}/report`, requiredPermission: "list_report", keywords: ["analytics", "export"] },
      ...(isAdmin
        ? [{ id: "alert", label: "Config Alert", href: `${base}/config_bot`, requiredPermission: "list_alertbot", keywords: ["alert", "bot", "notification"] } as RouteOption]
        : []),
    ];
    return opts;
  }, [base, isAdmin]);

  // Filter by permissions
  const visibleOptions = useMemo(() => {
    if (!permissions) return [];
    return allOptions.filter(o => {
      if (!o.requiredPermission) return true;
      return Boolean(permissions[o.requiredPermission]);
    });
  }, [allOptions, permissions]);

  // Search + rank
  const results = useMemo(() => {
    if (!query.trim()) return visibleOptions.slice(0, 8);
    const scored = visibleOptions
      .map(o => {
        const baseScore = rank(query, o.label);
        const kwScore = Math.max(0, ...(o.keywords ?? []).map(k => rank(query, k)));
        return { o, s: Math.max(baseScore, kwScore) };
      })
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s || a.o.label.localeCompare(b.o.label))
      .map(({ o }) => o);
    return scored.slice(0, 8);
  }, [query, visibleOptions]);

  // When user selects, navigate via <Link> (render-time)
  // For Combobox, we’ll just store selected and clear query
  useEffect(() => {
    if (selected) setQuery("");
  }, [selected]);

  return (
    <Combobox value={selected} onChange={setSelected}>
      <div className={`relative ${className}`}>
        <Combobox.Input
          className="w-full bg-gray-50 rounded-full px-3 py-2 outline-none text-sm"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          displayValue={(opt: RouteOption | null) => (opt ? opt.label : "")}
          aria-label="Global search"
        />
        <Transition
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Combobox.Options className="absolute mt-2 max-h-72 w-full overflow-auto rounded-xl bg-white py-2 shadow-lg ring-1 ring-black/5 text-sm z-[60]">
            {results.length > 0 ? (
              results.map((opt) => {
                const href = opt.kind === "create" && opt.hrefCreate ? opt.hrefCreate : opt.href;
                return (
                  <Combobox.Option
                    key={opt.id}
                    value={opt}
                    className={({ active }) => `px-3 py-2 cursor-pointer ${active ? "bg-blue-50" : ""}`}
                  >
                    {({ active }) => (
                      <Link
                        href={href}
                        className={`flex items-center justify-between ${active ? "text-blue-700" : "text-gray-800"}`}
                        onClick={() => setSelected(null)}
                      >
                        <span>
                          {highlight(opt.label, query)}
                          {opt.kind === "create" && <span className="ml-2 text-xs text-blue-600">action</span>}
                        </span>
                        <span className="text-[11px] text-gray-500">
                            {/* {href} */}
                            {/* Display the path without the base */}
                        </span>
                      </Link>
                    )}
                  </Combobox.Option>
                );
              })
            ) : query.trim() ? (
              <div className="px-3 py-2 text-gray-500">No feature found</div>
            ) : null}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};