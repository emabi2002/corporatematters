# 📋 Corporate Matters Navigation Structure

**Version**: 30
**Last Updated**: March 7, 2026
**Design System**: Land Case System UI with Corporate Matters functionality

---

## 🎯 Navigation Philosophy

The sidebar navigation mirrors **Land Case System's grouped structure** but is tailored specifically for **Corporate Matters workflows**. Both systems handle legal work with similar processes:

**Common Workflow**: Registration → Assignment → Work → Review → Closure

---

## 📑 Navigation Groups

### 1. **Dashboard** 🏠
- **Overview** - Main dashboard with metrics and analytics

**Purpose**: Quick overview of matter statistics, pending tasks, and key metrics.

---

### 2. **Matter Workflow** ⚖️
Active workflow management for corporate legal matters.

- **Register Matter** - 4-step wizard to create new matters
- **My Matters** - Matters assigned to the current user
- **Pending Assignment** - Matters waiting to be assigned to officers
- **Pending Review** - Matters waiting for manager/director review

**Purpose**: Core workflow navigation - registration through review cycle.

**User Roles**:
- Legal Secretary → Register Matter
- Officers → My Matters
- Managers → Pending Assignment, Pending Review

---

### 3. **Matter Register** 📋
Complete matter repository with status-based views.

- **All Matters** - Complete list of all corporate matters
- **Active Matters** - Currently open/in-progress matters
- **Closed Matters** - Completed/archived matters
- **Overdue Matters** - Matters past their SLA due date

**Purpose**: Full matter registry with quick access to status-specific views.

**Features**:
- Advanced filtering
- Sortable columns
- Export to CSV
- Status-based quick access

---

### 4. **Management** 📁
Supporting resources and communications.

- **Documents** - Document repository
- **Tasks** - Task management
- **Notifications** - Notification center with real-time updates

**Purpose**: Supporting tools for matter management.

**Features**:
- Documents: Version control, uploads, categorization
- Tasks: Assignment, tracking, completion
- Notifications: Real-time alerts, SLA warnings

---

### 5. **Reports & Analytics** 📊
Business intelligence and reporting.

- **Reports** - Comprehensive analytics dashboard

**Purpose**: Performance metrics, trends, and insights.

**Features**:
- Matter statistics
- Performance analytics
- Trend analysis
- Overdue aging
- CSV/PDF export

---

### 6. **Administration** ⚙️
System management and configuration (Admin only).

- **Admin Panel** - Administration homepage
- **User Management** - CRUD for users and roles
- **Divisions** - Organizational divisions
- **Matter Types** - Types of corporate matters
- **Document Types** - Document categorization
- **Reference Data** - System lookups and configurations

**Purpose**: System administration and master data management.

**Access**: Restricted to administrators (Directors, System Admins).

**Features**:
- Role-based access control
- Permission checking via `requireAdmin: true`
- Full CRUD operations
- Audit trails

---

## 🎨 Visual Design (from Land Case System)

### Sidebar Appearance
- **Background**: Dark slate-900
- **Text**: White with slate-400 for inactive items
- **Active State**: Emerald-600 background with white text
- **Group Headers**: Slate-300 text, emerald-400 when section is active
- **Borders**: Slate-700 for borders and dividers

### Behavior
- **Collapsible Groups**: Click group header to expand/collapse
- **Icons**: Lucide React icons for visual clarity
- **Smooth Transitions**: 300ms duration for all animations
- **Responsive**:
  - Desktop: Fixed sidebar (64px ↔ 16px)
  - Mobile: Overlay sidebar with backdrop

### Navigation Icons
| Group | Icon | Color When Active |
|-------|------|-------------------|
| Dashboard | LayoutDashboard | Emerald |
| Matter Workflow | Scale (justice) | Emerald |
| Matter Register | ClipboardList | Emerald |
| Management | Folder | Emerald |
| Reports & Analytics | BarChart3 | Emerald |
| Administration | Settings | Emerald |

---

## 🔐 Permission-Based Navigation

### Role-Based Menu Visibility

**Legal Secretary**:
- ✅ Dashboard
- ✅ Matter Workflow (Register Matter, All Matters)
- ✅ Matter Register (All Matters, Active)
- ✅ Management (Documents, Notifications)
- ✅ Reports (view only)
- ❌ Administration

**Legal Officer - Corporate**:
- ✅ Dashboard
- ✅ Matter Workflow (My Matters, Pending Review)
- ✅ Matter Register (All views)
- ✅ Management (All)
- ✅ Reports
- ❌ Administration

**Manager - Legal Services**:
- ✅ Dashboard
- ✅ Matter Workflow (All items)
- ✅ Matter Register (All views)
- ✅ Management (All)
- ✅ Reports (All analytics)
- ✅ Administration (User Management, Reference Data)

**Directors / System Admin**:
- ✅ **Full Access** to all menu items

### Permission Implementation

```typescript
items: [
  {
    name: 'Admin Panel',
    href: '/admin',
    icon: Settings,
    requireAdmin: true  // ← Only visible if canAccessAdmin() returns true
  },
]
```

---

## 📱 Responsive Design

### Desktop (≥ 1024px)
- Sidebar: Fixed left, 256px wide (expanded)
- Collapse button: Shrinks to 64px
- Content margin: Shifts automatically
- All menu text visible

### Tablet (768px - 1023px)
- Sidebar: Same as desktop
- Content: Adjusted spacing
- Search bar: Hidden on smaller screens

### Mobile (< 768px)
- Sidebar: Hidden by default
- Hamburger menu: Opens sidebar as overlay
- Backdrop: Semi-transparent black
- Sidebar: Full height, slides in from left
- Close: Click backdrop or navigate to close

---

## 🔄 Comparison with Land Case System

| Feature | Land Case System | Corporate Matters |
|---------|------------------|-------------------|
| **Layout** | Fixed sidebar + header | ✅ Same |
| **Design** | Slate-900 sidebar | ✅ Same |
| **Structure** | Grouped navigation | ✅ Same |
| **Terminology** | Cases | **Matters** |
| **Workflow Group** | Case Workflow | **Matter Workflow** |
| **Register** | Case Register | **Matter Register** |
| **Unique Features** | Land parcels, filings, lawyers | **Corporate-specific fields** |
| **Admin** | Similar structure | ✅ Same + Reference Data |

**Key Difference**: Same visual design, different business domain terminology.

---

## 🚀 Future Enhancements

### Potential Menu Additions
- **Calendar** - Visual calendar for hearings, deadlines, events
- **Correspondence** - Incoming/outgoing communications
- **Legal Research** - Internal knowledge base
- **Compliance** - Compliance tracking module

### Dynamic Features
- **Badge Counts** - Show pending items (e.g., "Pending Assignment (5)")
- **Quick Actions** - Right-click context menus
- **Favorites** - Star frequently accessed matters
- **Recent Items** - Quick access to recently viewed matters

---

## ✅ Summary

The navigation structure successfully combines:

1. ✅ **Land Case System's professional UI design**
   - Grouped sidebar navigation
   - Slate-based color scheme
   - Collapsible sections
   - Emerald active states

2. ✅ **Corporate Matters' specific workflows**
   - Matter-focused terminology
   - Corporate legal processes
   - Unique admin sections
   - Role-based access

3. ✅ **Enterprise UX patterns**
   - Permission-based visibility
   - Responsive design
   - Clear visual hierarchy
   - Intuitive grouping

**Result**: A professional, government-grade legal management system with clear navigation and modern UX.

---

*Navigation structure aligned with Version 30*
*UI Design from Land Case System*
*Functionality specific to Corporate Matters*
