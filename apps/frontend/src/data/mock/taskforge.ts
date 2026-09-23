import type {
  MockBoard,
  MockList,
  MockOrganization,
  User,
} from "../../types/taskforge";

export const currentUser: User = {
  id: "user-1",
  name: "Alex Rivera",
  email: "alex@taskforge.dev",
  role: "ADMIN",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBomaE9ClEzvq4c6jVwnVEM4FH2nNZBOrujl9UvvbZ_hIkeN2OGkwHZVn9YohNSigwkbmgS4lTwG_UyQDhy2mYrvz_HIDJiFDH2nIvHvb6ATNOFNixjDWng_RVV6P9OMRpKxxc6MrnDNFjmimdRurBvpmiy5PE92kHif4YZmSPggTcLVxJ07nc2UadFIcWsZws6cHQHYVcOYQLDb_fBL-hNJ02m-ZX21Q4oZyfT4wtjdSRgunqBETL6GA",
};

// Mock organizations: later replace this export with GET /organization.
export const organizations: MockOrganization[] = [
  {
    id: "org_acme_091",
    name: "Acme Corporation",
    role: "OWNER",
    members: 12,
    boards: 8,
    description:
      "Core platform infrastructure, shared microservices, and design system operations for Acme enterprise.",
    code: "org_98412ac",
    activityLabel: "Last active 2 hours ago",
    createdAt: "2026-08-12T09:00:00.000Z",
    updatedAt: "2026-09-11T14:20:00.000Z",
    memberAvatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBzW2pxJCx1yI-SWFRkVBQoh2SygQALHx9CCDvHnCEi-pCAjfO3SeG1YyqNwFDyBfgc_bqgvV3HTKyCkOsctG5Bqb7fDNU1R0fvKmFsFdMuvkCPC79AfQSLVwzgsjq_HIJGoBIaattAMRGmij-q6Gom9ah6doJVhEezQxTeHPNTE859CC1ofgj__RBXhoLmeuCe-PLh0Rx9xkgZRSII9wzKKY_6SuhvWkAlEJZCyTfikOwLa3VKk0I3VA",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7MMZMQAK-ge-2tabw7Xp9v-0HzfUqgvqTFtC3qV5FzOzOMuMUjbMgmzydMlD516XbnPB2ik-b_6mxhthm6UQCYfk54hNaxtTiEHpY3mGLLGbAVLkV9Jr2i6eFcaHB3nK3i_dH4qd7jZTfwY5pDju4VOvvKWt9x7_6dBVUxUMlsrn-OSd9976ulFMNz1Lxn2cdh5u5XDEvLRBacCiNg86qZYSkyH6-OE88hzgmiwRYCeBVygeG5YY5jw",
    ],
  },
  {
    id: "org_linear_771",
    name: "Linear Labs",
    role: "ADMIN",
    members: 6,
    boards: 4,
    description:
      "Next-generation developer productivity tooling, automated CLI orchestration, and SDK releases.",
    code: "org_77180ll",
    activityLabel: "Last active yesterday",
    createdAt: "2026-07-03T09:00:00.000Z",
    updatedAt: "2026-09-10T12:00:00.000Z",
    memberAvatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBblackAxiGuKTjSBhZXzpHiiw4HLj28w2TCTKXuJXah1PJpFMSI-CZ_o7nab_nu1O_gAZz2v2l_Dupjch2PKo6rKzG7z3A_AMo0ktEQ1bhbL7L6LKHgiRsxwbfWzRPgTpGytF49sbnP5FXu66O7Ar9ifNLrzpH1UDwlZS-tEZT4PlvOW_fUBJDOLvzNhuFru7sGi4twxvLsGa23_b67EZrWgQt5zICWr0W4E3ectPNz6-Njg1myajVnQ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZO7GUvJ8FRKNPvkR36URiW2YxapIfdz_fUttCkj2KFd4sGpgFoiALssAyOZHHLNVbXRdo0aR0iolNEdHBGg64mikGPTgYNh6SaEy3MdYoo_g2Z8gUqgHjCOTK8OfyQvnwr_lHo0i2in8HUoSvbvEmjlyPCseqdtPrOlIo3KeopC37LMfJf_zGq--Edcxg4B9Ssx3nW786YBeGBXNV6fNZTc5bjtnF9A3lHaFt2TW6WzPTygZ3s18YiQ",
    ],
  },
  {
    id: "org_horizon_339",
    name: "Studio Horizon",
    role: "MEMBER",
    members: 24,
    boards: 15,
    description:
      "Cross-disciplinary brand agency workspace managing typography systems, spatial interfaces, and user journeys.",
    code: "org_33912sh",
    activityLabel: "Last active 3 days ago",
    createdAt: "2026-08-27T09:00:00.000Z",
    updatedAt: "2026-09-09T18:00:00.000Z",
    memberAvatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDS37G1TavzZ4kWGHtH5KIz1Smyb6A7ziqYaV8E44rjR2iTTIB8dsoN81Db2MfZkZzzqRjgnkXOz5mGghjvmgR5jjCfUoci3HDERUFS4c3qdNuvf6FckYQtH_X7mgskCh6aB2Dkv5fWaooVMo0Rl_acJ8_p7ebsLpx1kQGVjhod-m0f0RpsmOPIWXM56HsnWAPH5EMfAwaZSrbWRlFzahC1a_WgLtAGwTKzTKgR5NzjRTXEQkfV9O4nSQ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCFoeW9u22rN6-BXFd-SIUx0sr09IH50alN7__AWg5qmUTIUIoHczYS7Qb7VG7ZrQTz3lLOAY3IRke-BmC_lp5sJmC6d8y-DsGG8fLgf63TLmRJv8UoW942urjAoXMam46hCKThev7QXbe1fywuXcjxpempbWLAFhKdfP5I1cERshVME-NQiRS2ciqqZT7mI7nteY_ssOELkDU2IT1xngcP2nBU5PPTdj_FeEvy_beMPJ2StN5MzpY2qg",
    ],
  },
];

// Mock boards: later replace this export with GET /organization/:organizationId/boards.
export const boards: MockBoard[] = [
  {
    id: "sprint-24",
    title: "Sprint 24 - Core Design System",
    description:
      "Refining tokens, components, and responsive app shell for v2 release across web and desktop.",
    organizationId: "org_acme_091",
    ownerId: "user-1",
    createdAt: "2026-08-14T09:00:00.000Z",
    updatedAt: "2026-09-12T10:00:00.000Z",
    updatedLabel: "Updated 20m ago",
    status: "Active Sprint",
    statusTone: "success",
    activeMembers: 10,
    memberAvatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQTalPD5CW6yOqaOtcNzOAdIFK_ENTpzkYdeZLGCw-yJb5sVWzrNwwrJOTRSmliEvXMaKq5_YWQfdGgUpiIG47wJqO2GbrSqB8GBGLE1UgtKHtRHkVUzjBxQoJdPKLkbDxxYcDsw6Zd1jUizERZ1exhyIOeVkFlYc_d-9wzH2rWa2VFOJtEcjOuN_62bYRS0-dioK6YTNUeiDu5cq4OMCOpDF42-PuIGvH1K8AIKQ-PWJnwNcDFwObkA",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDxs0x6JpkaMGe6_Qup81EbofkXlYJMa1-M9xUANt74xQXJKtYweanBmxl-vocdQ5PZJex77_DAOiLUNmV9Ekh7kugorPnrOX9oL18JdylGSyD5vtj1DSCOdfSSkbU_0jbfH9gh4K8A2MXzVu0OKf_BnUwhiZBkL_yy5D9cqmIt5_SLtQGuBh3-AQ2st6sYLsn0juF0_-kDd_9aRfKinfCW59gh5g_KWBGFIEWUvMYAzSeen6-buGTxA",
    ],
  },
  {
    id: "platform-api",
    title: "Platform API Stabilization",
    description: "Service contracts, auth hardening, and release migration work.",
    organizationId: "org_acme_091",
    ownerId: "user-1",
    createdAt: "2026-08-16T09:00:00.000Z",
    updatedAt: "2026-09-11T10:00:00.000Z",
    updatedLabel: "Updated 4 hours ago",
    status: "API Reliability",
    statusTone: "accent",
    activeMembers: 7,
    memberAvatars: [],
  },
  {
    id: "marketing-q3",
    title: "Q3 Marketing & Growth",
    description:
      "Landing page revamp, customer testimonials, and announcement campaigns.",
    organizationId: "org_acme_091",
    ownerId: "user-1",
    createdAt: "2026-08-21T09:00:00.000Z",
    updatedAt: "2026-09-09T10:00:00.000Z",
    updatedLabel: "Updated 2 days ago",
    status: "Strategic Initiative",
    statusTone: "warning",
    activeMembers: 5,
    memberAvatars: [],
  },
  {
    id: "internal-tooling",
    title: "Internal Tooling & Ops",
    description: "CI/CD pipeline migration and monitoring dashboard setup.",
    organizationId: "org_acme_091",
    ownerId: "user-1",
    createdAt: "2026-07-08T09:00:00.000Z",
    updatedAt: "2026-09-07T17:00:00.000Z",
    updatedLabel: "Updated 5 days ago",
    status: "Infrastructure",
    statusTone: "muted",
    activeMembers: 2,
    memberAvatars: [],
  },
  {
    id: "sdk-releases",
    title: "SDK Releases",
    description: "Developer SDK packaging and docs readiness.",
    organizationId: "org_linear_771",
    ownerId: "user-2",
    createdAt: "2026-08-28T09:00:00.000Z",
    updatedAt: "2026-09-08T11:00:00.000Z",
    updatedLabel: "Updated 4 days ago",
    status: "Release Cycle",
    statusTone: "accent",
    activeMembers: 4,
    memberAvatars: [],
  },
];

// Mock lists/cards: later replace with list/card endpoints.
export const lists: MockList[] = [
  {
    id: "todo",
    boardId: "sprint-24",
    title: "To Do",
    cards: [
      {
        id: "token-engine",
        title: "Token Engine audit checklist",
        description: "Normalize semantic palette coverage before handoff.",
        labels: ["Token Engine"],
        priority: "P1",
        meta: "Due Oct 27",
      },
      {
        id: "core-shell",
        title: "Core shell responsive gaps",
        description: "Validate split header behavior across narrow widths.",
        labels: ["Core Shell"],
        priority: "P2",
      },
      {
        id: "mobile-tabs",
        title: "Mobile tab navigation review",
        labels: ["QA"],
      },
    ],
  },
  {
    id: "in-progress",
    boardId: "sprint-24",
    title: "In Progress",
    cards: [
      {
        id: "button-motion",
        title: "Button tactile press micro-interactions",
        description: "Calibrating hover elevations across light canvas backgrounds.",
        labels: ["Component Library"],
        meta: "PR #418",
        assigneeInitials: "AR",
      },
      {
        id: "bento-grid",
        title: "Bento Grid responsive viewport clamps",
        labels: ["Layout Engine"],
        meta: "PR #421",
      },
    ],
  },
  {
    id: "review",
    boardId: "sprint-24",
    title: "Review",
    cards: [
      {
        id: "contrast-audit",
        title: "Accessibility contrast in monochromatic palettes",
        labels: ["Design Audit"],
        meta: "3/3 approvals ready",
      },
    ],
  },
  {
    id: "done",
    boardId: "sprint-24",
    title: "Done",
    cards: [
      {
        id: "typography-sync",
        title: "Design token typography classes sync",
        labels: ["Shipped"],
        meta: "Closed by Alex Rivera",
        done: true,
      },
      {
        id: "zero-border",
        title: "Zero-border structural framework base",
        labels: ["Shipped"],
        meta: "Merged to main",
        done: true,
      },
    ],
  },
  {
    id: "platform-backlog",
    boardId: "platform-api",
    title: "Backlog",
    cards: [],
  },
];
