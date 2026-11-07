import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import { ColorPaletteGrid } from '@/components/color-palette-selector';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import { edit as editAppearance } from '@/routes/appearance';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: editAppearance().url,
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance Settings</h1>

            <SettingsLayout>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Heading
                            variant="small"
                            title="Theme Mode"
                            description="Toggle between light and dark display modes"
                        />
                        <AppearanceTabs />
                    </div>

                    <div className="border-t border-border pt-6">
                        <ColorPaletteGrid />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
