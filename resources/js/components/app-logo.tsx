import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types/auth';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { auth } = usePage().props as unknown as { auth: Auth };
    const role = auth?.user?.role as string | undefined;
    const roleDisplay = role
        ? role.charAt(0).toUpperCase() + role.slice(1)
        : 'All';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {roleDisplay} Portal
                </span>
            </div>
        </>
    );
}

