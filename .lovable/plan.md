

# Admin Dashboard -- Full Build Plan

## Architecture

All admin pages live under `/admin/*` routes, protected by an `AdminRoute` wrapper that checks `user_roles` for `admin` role via the existing `has_role()` function. A dedicated sidebar layout (`AdminLayout`) wraps all admin pages.

```text
src/
├── components/admin/
│   ├── AdminLayout.tsx          # Sidebar + header + outlet
│   ├── AdminRoute.tsx           # Role-gated wrapper
│   ├── AdminSidebar.tsx         # 19-section nav
│   ├── AdminMetricCard.tsx      # Glassmorphism stat card
│   ├── AdminDataTable.tsx       # Reusable table with search/filter/pagination
│   └── AdminChartCard.tsx       # Chart wrapper
├── pages/admin/
│   ├── AdminDashboard.tsx       # Overview metrics + charts
│   ├── AdminUsers.tsx           # User CRUD + role management
│   ├── AdminContent.tsx         # Mantras, bhajans, scriptures, quotes
│   ├── AdminAISystems.tsx       # AI module toggles, usage logs
│   ├── AdminPalmReading.tsx     # Palm reading history, analytics
│   ├── AdminDarshan.tsx         # Temple streams, scheduling
│   ├── AdminCommunity.tsx       # Post moderation, spam tools
│   ├── AdminShorts.tsx          # Bhakti shorts moderation
│   ├── AdminDonations.tsx       # Payment analytics, transactions
│   ├── AdminSubscriptions.tsx   # Plan management
│   ├── AdminAnalytics.tsx       # Growth charts, retention, heatmaps
│   ├── AdminNotifications.tsx   # Push/email broadcast tools
│   ├── AdminCalendar.tsx        # Calendar events CRUD
│   ├── AdminDatabase.tsx        # Table browser, record editor
│   ├── AdminStorage.tsx         # Bucket browser, file management
│   ├── AdminRoles.tsx           # Role assignment UI
│   ├── AdminSecurity.tsx        # Audit logs, login tracking
│   ├── AdminSettings.tsx        # Site config, feature toggles
│   └── AdminSupport.tsx         # Reports, support tickets
```

## Key Design Decisions

**Styling**: Dark theme with saffron/gold accents using existing CSS variables. Glassmorphism via `backdrop-blur-xl bg-card/60 border border-border/30`. No Framer Motion (not installed) -- use Tailwind `animate-fade-in` and CSS transitions for micro-interactions.

**Data**: All reads use Supabase client with existing RLS. Admin writes use the existing `has_role('admin')` policies. No new tables needed initially -- the existing 25+ tables cover all sections.

**Charts**: Recharts (already installed) for all analytics.

**Route structure**: All routes nested under `/admin` in App.tsx, lazy-loaded, wrapped in `AdminRoute`.

## Section Details

### 1. AdminRoute (access control)
Checks `user_roles` table for admin role. Redirects non-admins to `/dashboard` with toast error.

### 2. AdminLayout + Sidebar
Collapsible sidebar using Shadcn Sidebar component. 19 nav items grouped into categories (Platform, Content, Finance, System). Header with admin avatar, search, and notifications bell.

### 3. Dashboard Overview
Metric cards querying counts from: `profiles`, `user_activities`, `ai_chat_sessions`, `palm_reading_history`, `mantra_sessions`, `community_posts`, `subscriptions`. Recharts line/bar charts for 7-day/30-day trends. Activity feed from recent `user_activities`. System health cards (static for now).

### 4. User Management
DataTable of `profiles` joined with `user_roles` and `subscriptions`. Search by name/email. Actions: edit profile, assign role, view activity detail panel (side sheet showing user's posts, readings, streaks, donations).

### 5. Spiritual Content Management
Tabs for: Mantras (`mantras_library`), Audio (`audio_library`), Scriptures (`scriptures` + `scripture_chapters`), Saints (`saints`), Daily Devotions (`daily_devotions`), Spiritual Content (`spiritual_content`), FAQs (`spiritual_faqs`). Each tab has a DataTable with create/edit dialogs.

### 6. AI Systems Control
Read-only dashboard showing usage from `ai_chat_sessions`, `divine_conversations`, `user_api_usage`. Toggle cards for each AI module (stored in a site_settings pattern or localStorage for now). Usage charts by day.

### 7. Palm Reading System
DataTable of `palm_reading_history`. Analytics: total readings, readings/day chart, language distribution pie chart.

### 8. Live Darshan Management
CRUD on `temples` table focusing on `live_darshan_url` and `darshan_schedule` fields. Embed preview of live streams.

### 9. Community Moderation
DataTable of `community_posts` with moderation actions (delete, feature/unfeature). Comment moderation from `post_comments`. Bulk actions.

### 10. Bhakti Shorts
CRUD on `bhakti_shorts` table. Approve/reject toggle. View counts and engagement metrics.

### 11. Donations & Payments
Placeholder section (Stripe not yet integrated). Will show subscription revenue from `subscriptions` table. Transaction history placeholder.

### 12. Subscription Plans
DataTable of `subscriptions`. View by tier. Plan configuration UI (placeholder until Stripe).

### 13. Analytics & Insights
Full-page Recharts dashboard: user growth (registrations over time from `profiles.created_at`), feature usage (from `user_activities`), AI usage trends, retention chart.

### 14. Notifications System
CRUD on `notifications` table. Broadcast form to send notification to all users or filtered set. Calendar event notifications.

### 15. Calendar & Events
CRUD on `calendar_events` table. Calendar view using existing data.

### 16. Database Manager
Dynamic table browser: select any table, view paginated records, search, edit individual records via form dialog. Uses Supabase client queries.

### 17. File & Media Storage
Browse Supabase storage buckets (`saints-images`, `temple-images`, `audio-library`, etc.). List files, delete, view storage usage.

### 18. Admin Roles
Manage `user_roles` table. Assign/revoke roles (admin, moderator, user).

### 19. Security & Audit Logs
Display recent admin actions (placeholder -- would need an audit_logs table in future). Show login activity from auth metadata.

### 20. System Settings & Support
Feature toggles (localStorage-based for now). Site configuration form. Support/reports placeholder.

## Database Changes

**One new table** for audit logging:

```sql
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action VARCHAR NOT NULL,
  target_table VARCHAR,
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit logs" ON admin_audit_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert audit logs" ON admin_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

## App.tsx Changes

Add lazy imports for all 19 admin pages. Add nested routes:

```tsx
<Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<AdminUsers />} />
  <Route path="content" element={<AdminContent />} />
  // ... all 19 routes
</Route>
```

## Implementation Order

Given the scope, files will be created in this sequence:
1. AdminRoute, AdminLayout, AdminSidebar (infrastructure)
2. Reusable components (MetricCard, DataTable, ChartCard)
3. AdminDashboard (overview)
4. AdminUsers, AdminRoles
5. AdminContent (all content tabs)
6. AdminCommunity, AdminShorts
7. AdminAISystems, AdminPalmReading
8. AdminDarshan, AdminCalendar
9. AdminAnalytics
10. AdminNotifications, AdminSubscriptions, AdminDonations
11. AdminDatabase, AdminStorage
12. AdminSecurity, AdminSettings, AdminSupport
13. App.tsx route registration

This creates ~25 new files and modifies App.tsx. All pages use existing Supabase tables with admin RLS policies already in place.

