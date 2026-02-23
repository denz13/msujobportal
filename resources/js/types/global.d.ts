import type { Auth } from '@/types/auth';

type EmployerProfileShared = {
    has_information: boolean;
    is_complete: boolean;
} | null;

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            employerProfile?: EmployerProfileShared;
            sidebarOpen: boolean;
            flash?: {
                toast?: {
                    type: 'success' | 'error' | 'info' | 'warning';
                    message: string;
                };
            };
            [key: string]: unknown;
        };
    }
}
