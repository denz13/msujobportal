import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-6">
            <Heading
                title="Profile layout"
                description="View and manage your profile and employer information."
            />

            <div className="mt-6">
                <section className="mx-auto max-w-5xl space-y-12">
                    {children}
                </section>
            </div>
        </div>
    );
}
