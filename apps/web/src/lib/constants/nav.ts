import type { Role } from '@edumetric/shared';
import {
  LayoutDashboard,
  User,
  Trophy,
  Award,
  LineChart,
  Bell,
  Settings,
  Users,
  CalendarCheck,
  ClipboardList,
  MessageSquare,
  Inbox,
  Shield,
  GraduationCap,
  HeartHandshake,
  AlertTriangle,
  FileText,
  Cog,
  ListChecks,
  Plug,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  STUDENT: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', href: '/profile', icon: User },
    { label: 'Achievements', href: '/achievements', icon: Award },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'Analytics', href: '/analytics', icon: LineChart },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  MENTOR: [
    { label: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/mentor/students', icon: Users },
    { label: 'Attendance', href: '/mentor/attendance', icon: CalendarCheck },
    { label: 'Assignments', href: '/mentor/assignments', icon: ClipboardList },
    { label: 'Feedback', href: '/mentor/feedback', icon: MessageSquare },
    { label: 'Analytics', href: '/mentor/analytics', icon: LineChart },
    { label: 'Leaderboard', href: '/mentor/leaderboard', icon: Trophy },
  ],
  TUTOR: [
    { label: 'Dashboard', href: '/tutor/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/tutor/students', icon: Users },
    { label: 'Social Evaluation', href: '/tutor/social-evaluation', icon: HeartHandshake },
    { label: 'Recovery Tasks', href: '/tutor/recovery-tasks', icon: ListChecks },
    { label: 'Discipline', href: '/tutor/discipline', icon: Shield },
    { label: 'Reports', href: '/tutor/reports', icon: FileText },
  ],
  ADMIN: [
    { label: 'Overview', href: '/admin/overview', icon: LayoutDashboard },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Mentors', href: '/admin/mentors', icon: GraduationCap },
    { label: 'Tutors', href: '/admin/tutors', icon: HeartHandshake },
    { label: 'Achievements', href: '/admin/achievements', icon: Award },
    { label: 'Approvals', href: '/admin/approvals', icon: Inbox },
    { label: 'Leaderboard', href: '/admin/leaderboard', icon: Trophy },
    { label: 'Analytics', href: '/admin/analytics', icon: LineChart },
    { label: 'Penalties', href: '/admin/penalties', icon: AlertTriangle },
    { label: 'Reports', href: '/admin/reports', icon: FileText },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  SUPER_ADMIN: [
    { label: 'Overview', href: '/admin/overview', icon: LayoutDashboard },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Approvals', href: '/admin/approvals', icon: Inbox },
    { label: 'Leaderboard', href: '/admin/leaderboard', icon: Trophy },
    { label: 'Analytics', href: '/admin/analytics', icon: LineChart },
    { label: 'KPI Config', href: '/super-admin/kpi-config', icon: Cog },
    { label: 'API Integrations', href: '/super-admin/api-integrations', icon: Plug },
    { label: 'Role Management', href: '/super-admin/role-management', icon: Shield },
    { label: 'System Logs', href: '/super-admin/system-logs', icon: FileText },
    { label: 'Platform Settings', href: '/super-admin/platform-settings', icon: Settings },
  ],
  GUEST: [
    { label: 'Leaderboard', href: '/guest/leaderboard', icon: Trophy },
    { label: 'Students', href: '/guest/students', icon: Users },
    { label: 'Statistics', href: '/guest/statistics', icon: LineChart },
  ],
};
