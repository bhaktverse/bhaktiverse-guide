

# Admin Dashboard Audit & Scale-Ready Enhancements + Admin Role Assignment

## Current State Assessment

The admin dashboard has all 19 sidebar sections with working routes. Here's what each section currently does and what's missing for 1M-user scale:

### What Works
- **Routing & RBAC**: AdminRoute correctly uses `has_role()` RPC. All 19 routes registered.
- **Sidebar**: Clean grouped navigation with 4 categories (Platform, Content, Finance, System).
- **Dashboard Overview**: 8 metric cards + bar/pie charts + recent users list.
- **User Management**: DataTable with roles, detail sheet panel.
- **Content Management**: 5 tabbed tables (Mantras, Audio, Scriptures, Saints, FAQs).
- **Community Moderation**: Feature/delete posts with toggle.
- **Database Manager**: Dynamic table browser with 30 tables.
- **Roles**: Assign/remove roles UI.
- **Security**: Audit log viewer.
- **Settings**: Feature toggles (localStorage-based).

### Critical Gaps for 1M Users

| Gap | Impact | Fix |
|-----|--------|-----|
| **No CRUD dialogs** on Content, Darshan, Shorts, Calendar, Notifications | Admins can't create/edit content without raw SQL | Add create/edit dialogs to all content sections |
| **RLS blocks admin reads** on `profiles`, `palm_reading_history`, `ai_chat_sessions`, `mantra_sessions`, `notifications`, `divine_conversations`, `user_activities` | Dashboard metrics return 0 for user-scoped tables | Add admin SELECT policies to these tables |
| **Simulated chart data** in Dashboard & Analytics | Growth/activity charts use `Math.random()` | Replace with real aggregated queries |
| **No pagination** on Database Manager | 50-row limit, unusable at scale | Add cursor-based pagination |
| **No bulk actions** | Can't moderate/delete in bulk | Add multi-select + bulk operations |
| **No broadcast notifications** | Can't send push to all users | Add broadcast form in Notifications |
| **No export/CSV** | Can't extract data for reporting | Add export button to DataTables |
| **Feature toggles in localStorage** | Not persistent across devices/admins | Move to a `site_settings` table |
| **Storage page is static** | Just lists bucket names, no file browsing | Integrate Supabase Storage API for file listing |
| **No admin search** | Can't globally search across admin sections | Add command palette or global search |
| **Community moderation uses user-scoped delete** | Admin can't delete other users' posts (RLS blocks it) | Add admin DELETE/UPDATE policies on `community_posts` |
| **No rate limiting visibility** | No view of API usage across users | Add aggregate API usage view |
| **AdminDashboard queries `profiles` directly** | RLS only allows users to see their own profile | Admin can only see count of their own profile |

## Implementation Plan

### Phase 1: Database — Admin RLS Policies (Migration)

Add admin SELECT policies to user-scoped tables so the dashboard can actually read data:

```sql
-- profiles: admin can read all
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Similar for: palm_reading_history, ai_chat_sessions, mantra_sessions, 
-- divine_conversations, user_activities, notifications, spiritual_journey,
-- user_api_usage, numerology_reports, user_favorites, user_achievements,
-- astro_profiles, kundali_match_history, user_progress, playlists

-- Admin can moderate community posts (update/delete)
CREATE POLICY "Admins moderate posts" ON community_posts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admin can moderate comments
CREATE POLICY "Admins moderate comments" ON post_comments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admin can manage notifications (for broadcast)
CREATE POLICY "Admins manage notifications" ON notifications FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

Also insert admin role for user `17046cb8-b1b1-4596-b3ec-8a9462d29acb`.

### Phase 2: CRUD Dialogs (Content, Darshan, Shorts, Calendar, Notifications)

Add create/edit dialog components to:
- **AdminContent**: Add/edit mantras, audio, scriptures, saints, FAQs
- **AdminDarshan**: Add/edit temple live stream URLs and schedules
- **AdminShorts**: Upload/approve/reject shorts
- **AdminCalendar**: Create/edit calendar events
- **AdminNotifications**: Broadcast notification form (insert into `notifications` for all users or filtered set)

### Phase 3: Real Analytics Data

Replace `Math.random()` charts with actual aggregated queries:
- User registrations by day (group `profiles.created_at`)
- Activity counts by day (group `user_activities.created_at`)
- API usage trends (aggregate `user_api_usage`)

### Phase 4: Scale-Ready UI Improvements

- **Pagination**: Add proper pagination to AdminDatabase (offset-based with page controls)
- **Bulk Actions**: Multi-select checkboxes on AdminDataTable + bulk delete/approve
- **CSV Export**: Add export button to AdminDataTable
- **Admin User Detail**: Expand user sheet to show subscription, activities, palm readings, AI sessions

### Phase 5: Settings Persistence

- Create `site_settings` table (key-value with JSONB) with admin-only RLS
- Migrate feature toggles from localStorage to database

### Files Changed

| File | Change |
|------|--------|
| Migration SQL | ~18 new admin RLS policies + `site_settings` table |
| Data insert | Admin role for user `17046cb8-...` |
| `AdminContent.tsx` | Add create/edit dialogs for each content tab |
| `AdminDarshan.tsx` | Add create/edit temple dialog |
| `AdminShorts.tsx` | Add approve/reject + create dialog |
| `AdminCalendar.tsx` | Add create/edit event dialog |
| `AdminNotifications.tsx` | Add broadcast notification form |
| `AdminDashboard.tsx` | Replace random data with real queries |
| `AdminAnalytics.tsx` | Replace random data with real aggregations |
| `AdminDataTable.tsx` | Add pagination, bulk select, CSV export |
| `AdminDatabase.tsx` | Add pagination controls |
| `AdminUsers.tsx` | Expand detail panel with activity data |
| `AdminSettings.tsx` | Migrate to `site_settings` table |
| `AdminStorage.tsx` | Add Supabase Storage file listing |
| `AdminCommunity.tsx` | Use admin policies for delete/update |

This is a large scope (~15 files). The migration and data insert will be executed first, then all UI files updated in parallel.

