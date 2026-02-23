import { Link, usePage } from '@inertiajs/react';
import { Building2, FileText, LayoutGrid, User, Users } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavGroup } from '@/types';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';
import type { Auth } from '@/types/auth';
import { edit as profileEdit } from '@/routes/profile';

type EmployerProfileShared = {
    has_information: boolean;
    is_complete: boolean;
    status?: string | null;
    is_approved?: boolean;
} | null;

const defaultNavGroups: NavGroup[] = [
    {
        label: 'Platform',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        label: 'Jobs Management',
        items: [
            {
                title: 'Post Jobs',
                href: '/jobs/post-jobs',
                icon: Building2,
            },
            {
                title: 'List Request Jobs Post',
                href: '/jobs/list-request-jobs-post',
                icon: FileText,
            },
        ],
    },
    {
        label: 'Applicants Management',
        items: [
            {
                title: 'List Applicants',
                href: '/applicants/list-applicants',
                icon: Users,
            },
        ],
    },
    
    {
        label: 'User Management',
        items: [
            {
                title: 'Employer Accounts',
                href: '/user-management/employer-account', // Update with actual route
                icon: Users,
            },
        ],
    },
];

const employerIncompleteNavGroups: NavGroup[] = [
    {
        label: 'Account setup',
        items: [
            {
                title: 'Profile settings',
                href: profileEdit().url,
                icon: User,
            },
        ],
    },
];

export function AppSidebar() {
    const { auth, employerProfile } = usePage().props as {
        auth: Auth;
        employerProfile?: EmployerProfileShared;
    };

    const isEmployerIncomplete =
        auth?.user?.role === 'employer' &&
        employerProfile &&
        (!employerProfile.is_complete || !employerProfile.is_approved);

    const navGroups = isEmployerIncomplete
        ? employerIncompleteNavGroups
        : defaultNavGroups;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>
        </Sidebar>
    );
}
