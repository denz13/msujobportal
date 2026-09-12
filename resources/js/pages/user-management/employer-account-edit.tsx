import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Employer = {
    id: number;
    display_name: string;
    email: string;
    status: string | null;
};

type EmployerInformation = {
    id: number;
    users_id: number;
    position: string | null;
    contact_number: string | null;
    business_address: string | null;
    business_permit: string | null;
    tin: string | null;
    type_of_business: string | null;
    status: string | null;
};

export default function EmployerAccountEdit({
    employer,
    employerInformation,
    categories = [],
}: {
    employer: Employer;
    employerInformation?: EmployerInformation | null;
    categories?: Array<{ id: number; name: string }>;
}) {
    const currentBusinessType = employerInformation?.type_of_business ?? '';
    const isKnownCategory = currentBusinessType
        ? categories.some(
              (c) => c.name.toLowerCase() === currentBusinessType.toLowerCase(),
          )
        : false;

    const [selectedBusinessType, setSelectedBusinessType] = useState<string>(() => {
        if (!currentBusinessType) return '';
        return isKnownCategory ? currentBusinessType : 'others';
    });

    const [customBusinessType, setCustomBusinessType] = useState<string>(() => {
        if (!currentBusinessType) return '';
        return isKnownCategory ? '' : currentBusinessType;
    });
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Employer Accounts',
            href: '/user-management/employer-account',
        },
        {
            title: 'Update Employer Information',
            href: `/user-management/employer-account/${employer.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Update Employer Information" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    variant="small"
                    title="Update Employer Information"
                    description={`${employer.display_name} • ${employer.email}`}
                />

                <Card>
                    <CardContent className="p-6">
                        <Form
                            action={`/user-management/employer-account/${employer.id}`}
                            method="post"
                            options={{
                                preserveScroll: true,
                            }}
                            onSuccess={() => {
                                toast.success('Employer information updated');
                            }}
                            onError={() => {
                                toast.error('Please fix the errors and try again');
                            }}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input type="hidden" name="_method" value="PUT" />

                                    <div className="grid gap-2">
                                        <Label htmlFor="position">Position</Label>
                                        <Input
                                            id="position"
                                            name="position"
                                            required
                                            defaultValue={
                                                employerInformation?.position ?? ''
                                            }
                                            placeholder="e.g. HR Manager"
                                        />
                                        <InputError message={errors.position} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="contact_number">
                                            Contact number
                                        </Label>
                                        <Input
                                            id="contact_number"
                                            name="contact_number"
                                            required
                                            defaultValue={
                                                employerInformation?.contact_number ??
                                                ''
                                            }
                                            placeholder="e.g. 09xxxxxxxxx"
                                        />
                                        <InputError message={errors.contact_number} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="business_address">
                                            Business address
                                        </Label>
                                        <Input
                                            id="business_address"
                                            name="business_address"
                                            required
                                            defaultValue={
                                                employerInformation?.business_address ??
                                                ''
                                            }
                                            placeholder="Business address"
                                        />
                                        <InputError message={errors.business_address} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="business_permit">
                                            Business permit
                                        </Label>
                                        <Input
                                            id="business_permit"
                                            name="business_permit"
                                            required
                                            defaultValue={
                                                employerInformation?.business_permit ??
                                                ''
                                            }
                                            placeholder="Permit / reference number"
                                        />
                                        <InputError message={errors.business_permit} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="tin">TIN</Label>
                                        <Input
                                            id="tin"
                                            name="tin"
                                            required
                                            defaultValue={employerInformation?.tin ?? ''}
                                            placeholder="Tax Identification Number"
                                        />
                                        <InputError message={errors.tin} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="type_of_business">
                                            Type of business
                                        </Label>
                                        <Select
                                            value={selectedBusinessType}
                                            onValueChange={(val) => {
                                                setSelectedBusinessType(val);
                                                if (val !== 'others') {
                                                    setCustomBusinessType('');
                                                }
                                            }}
                                        >
                                            <SelectTrigger id="type_of_business" className="w-full">
                                                <SelectValue placeholder="Select type of business" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={c.name}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="others">
                                                    Others (Please specify)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {selectedBusinessType === 'others' && (
                                            <div className="mt-1.5 space-y-1">
                                                <Label
                                                    htmlFor="custom_type_of_business"
                                                    className="text-xs text-muted-foreground"
                                                >
                                                    Please specify type of business{' '}
                                                    <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id="custom_type_of_business"
                                                    required
                                                    value={customBusinessType}
                                                    onChange={(e) =>
                                                        setCustomBusinessType(e.target.value)
                                                    }
                                                    placeholder="e.g. Retail, Healthcare Services, etc."
                                                />
                                            </div>
                                        )}

                                        <input
                                            type="hidden"
                                            name="type_of_business"
                                            value={
                                                selectedBusinessType === 'others'
                                                    ? customBusinessType
                                                    : selectedBusinessType
                                            }
                                        />
                                        <InputError message={errors.type_of_business} />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button disabled={processing}>Save</Button>
                                        <Button variant="outline" asChild>
                                            <Link href="/user-management/employer-account">
                                                Back
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

