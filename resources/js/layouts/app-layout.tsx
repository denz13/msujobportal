import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AppLayoutProps } from '@/types';
import type { Auth } from '@/types/auth';
import { edit as profileEdit } from '@/routes/profile';

type EmployerProfileShared = {
    has_information: boolean;
    is_complete: boolean;
} | null;

export default function AppLayout({
    children,
    breadcrumbs,
    ...props
}: AppLayoutProps) {
    const page = usePage();
    const { auth, employerProfile } = page.props as {
        auth: Auth;
        employerProfile?: EmployerProfileShared;
    };

    // Quiet background auto-polling (seamless, invisible refresh without reload flicker or scroll jump)
    const isInteracting = useRef(false);

    useEffect(() => {
        const handleUserAction = () => {
            isInteracting.current = true;
            // reset interaction flag after a short delay
            setTimeout(() => {
                isInteracting.current = false;
            }, 3000);
        };

        window.addEventListener('keydown', handleUserAction, { passive: true });
        window.addEventListener('input', handleUserAction, { passive: true });

        // Auto-poll every 12 seconds
        const pollInterval = window.setInterval(() => {
            // Only poll if tab is visible and user is not actively typing in an input
            if (document.hidden || isInteracting.current) {
                return;
            }

            const activeElement = document.activeElement;
            const isTyping = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                (activeElement as HTMLElement).isContentEditable
            );

            if (isTyping) {
                return;
            }

            // Silent Inertia partial reload: router.reload() automatically preserves scroll and state
            router.reload({
                showProgress: false,
            });
        }, 12000);

        return () => {
            window.removeEventListener('keydown', handleUserAction);
            window.removeEventListener('input', handleUserAction);
            window.clearInterval(pollInterval);
        };
    }, []);

    const mustCompleteEmployerProfile = useMemo(() => {
        if (!auth?.user) return false;
        if (auth.user.role !== 'employer') return false;
        if (!employerProfile) return false;
        return !employerProfile.is_complete;
    }, [auth, employerProfile]);

    const isOnProfileSettings = page.url.startsWith('/settings/profile');

    return (
        <>
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>

            <Dialog
                open={mustCompleteEmployerProfile && !isOnProfileSettings}
                modal={false}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                            </div>
                            <DialogTitle>Complete your employer profile</DialogTitle>
                        </div>
                        <DialogDescription className="pt-2">
                            Some required employer information is missing. Please complete
                            your employer profile so your account can be fully verified and
                            used in the system.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" asChild>
                            <Link href={profileEdit().url}>Go to profile settings</Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
