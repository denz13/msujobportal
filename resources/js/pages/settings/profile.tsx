import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Mail, MapPin, Phone, User2, Upload, Camera, FileText, AlertTriangle, Info } from 'lucide-react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth, employerInformation, flash } = usePage().props as {
        auth: { user: any };
        employerInformation?: {
            position: string | null;
            contact_number: string | null;
            business_address: string | null;
            business_permit: string | null;
            tin: string | null;
            type_of_business: string | null;
            status: string | null;
        } | null;
        flash?: { toast?: { type: string; message: string } };
    };

    const [activeTab, setActiveTab] = useState<'account' | 'business' | 'password'>(
        'account',
    );
    const [age, setAge] = useState<number | undefined>(auth.user.age);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        auth.user.photo ? (auth.user.photo.startsWith('http') ? auth.user.photo : `/${auth.user.photo}`) : null,
    );
    const [businessPermitPreview, setBusinessPermitPreview] = useState<string | null>(
        employerInformation?.business_permit 
            ? (employerInformation.business_permit.startsWith('http') 
                ? employerInformation.business_permit 
                : `/${employerInformation.business_permit}`)
            : null,
    );
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const businessPermitInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const currentPasswordInputRef = useRef<HTMLInputElement>(null);
    const [showPhotoConfirmDialog, setShowPhotoConfirmDialog] = useState(false);
    const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
    const formSuccessShown = useRef(false);
    const formErrorShown = useRef(false);

    const displayName =
        auth.user.display_name ??
        [auth.user.firstname, auth.user.lastname].filter(Boolean).join(' ');

    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n: string) => n[0]?.toUpperCase() ?? '')
        .join('');

    const [dateOfBirth, setDateOfBirth] = useState<string>(
        auth.user.date_of_birth ?? '',
    );
    const [gender, setGender] = useState<string>(
        auth.user.gender ?? '',
    );

    // Auto-calculate age from date_of_birth
    useEffect(() => {
        if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
                calculatedAge--;
            }
            setAge(calculatedAge);
        } else {
            setAge(undefined);
        }
    }, [dateOfBirth]);

    // Handle flash toast messages from backend
    const toastShown = useRef<string | null>(null);
    useEffect(() => {
        if (flash?.toast && toastShown.current !== flash.toast.message) {
            toastShown.current = flash.toast.message;
            
            // Reset form toast refs when flash toast is shown
            formSuccessShown.current = false;
            formErrorShown.current = false;
            
            if (flash.toast.type === 'success') {
                toast.success(flash.toast.message);
            } else if (flash.toast.type === 'error') {
                toast.error(flash.toast.message);
            } else {
                toast(flash.toast.message);
            }
        }
    }, [flash]);

    const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateOfBirth(e.target.value);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            
            // Store the file and show confirmation dialog
            setPendingPhotoFile(file);
            setShowPhotoConfirmDialog(true);
        }
    };

    const handleConfirmPhotoUpload = () => {
        setShowPhotoConfirmDialog(false);
        // Create form data with all current form values
        const formData = new FormData();
        
        // Get all form inputs
        const form = document.querySelector('form[action*="profile"]') as HTMLFormElement;
        if (form) {
            const formDataObj = new FormData(form);
            // Copy all form data
            for (const [key, value] of formDataObj.entries()) {
                if (key !== 'photo') { // Don't include old photo if any
                    formData.append(key, value);
                }
            }
        }
        
        // Add the new photo file
        if (pendingPhotoFile) {
            formData.append('photo', pendingPhotoFile);
        }
        
        // Submit the form
        router.post(
            ProfileController.update.form().action,
            formData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPendingPhotoFile(null);
                    toast.success('Photo updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update photo. Please try again.');
                },
            }
        );
    };

    const handleCancelPhotoUpload = () => {
        setShowPhotoConfirmDialog(false);
        setAvatarPreview(
            auth.user.photo 
                ? (auth.user.photo.startsWith('http') || auth.user.photo.startsWith('/') 
                    ? auth.user.photo 
                    : `/${auth.user.photo}`)
                : null
        );
        setPendingPhotoFile(null);
        // Reset the file input
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    };

    const handleBusinessPermitChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBusinessPermitPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Profile header layout */}
                    <Card>
                        <CardContent className="px-5 pt-5">
                            <div className="flex flex-col gap-6 border-b border-border/60 pb-5 lg:flex-row">
                                {/* Avatar + basic info */}
                                <div className="flex flex-1 items-center justify-center px-5 lg:justify-start">
                                    <div className="flex items-center gap-4">
                                        <div className="relative group">
                                            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                                                <AvatarImage
                                                    src={
                                                        avatarPreview ?? 
                                                        (auth.user.photo 
                                                            ? (auth.user.photo.startsWith('http') || auth.user.photo.startsWith('/') 
                                                                ? auth.user.photo 
                                                                : `/${auth.user.photo}`)
                                                            : undefined)
                                                    }
                                                    alt={displayName}
                                                />
                                                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                                                    {initials || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <button
                                                type="button"
                                                onClick={() => avatarInputRef.current?.click()}
                                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                                aria-label="Upload photo"
                                            >
                                                <Camera className="h-6 w-6 text-white" />
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="truncate text-lg font-semibold sm:w-60 sm:whitespace-normal">
                                                {displayName}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User2 className="h-4 w-4" />
                                                <span className="capitalize">
                                                    {auth.user.role || 'User'}
                                                </span>
                                                {auth.user.status && (
                                                    <Badge
                                                        variant="outline"
                                                        className="px-2 py-0 text-xs capitalize"
                                                    >
                                                        {auth.user.status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact details */}
                                <div className="flex flex-1 flex-col justify-center border-y border-border/60 px-5 py-4 lg:border-x lg:border-y-0 lg:py-0">
                                    <div className="text-center text-sm font-medium lg:text-left lg:mt-1">
                                        Contact details
                                    </div>
                                    <div className="mt-3 flex flex-col items-center gap-3 text-sm lg:items-start">
                                        <div className="flex items-center gap-2 truncate sm:whitespace-normal">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{auth.user.email}</span>
                                        </div>
                                        {auth.user.address && (
                                            <div className="flex items-center gap-2 truncate sm:whitespace-normal">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>{auth.user.address}</span>
                                            </div>
                                        )}
                                        {employerInformation?.contact_number && (
                                            <div className="flex items-center gap-2 truncate sm:whitespace-normal">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {employerInformation.contact_number}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick stats */}
                                <div className="flex flex-1 items-center justify-center px-5 pt-4 lg:pt-0">
                                    <div className="flex w-full max-w-xs items-center justify-between gap-4 text-center">
                                        <div className="w-24 rounded-md py-2">
                                            <div className="text-xs text-muted-foreground">
                                                Joined
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {new Date(
                                                    auth.user.created_at,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                        <div className="w-24 rounded-md py-2">
                                            <div className="text-xs text-muted-foreground">
                                                Account
                                            </div>
                                            <div className="text-sm font-semibold capitalize">
                                                {auth.user.status || 'pending'}
                                            </div>
                                        </div>
                                        <div className="w-24 rounded-md py-2">
                                            <div className="text-xs text-muted-foreground">
                                                Employer info
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {auth.user.role === 'employer'
                                                    ? employerInformation
                                                        ? 'Provided'
                                                        : 'Missing'
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs directly under header card */}
                            <div className="mt-2">
                                <nav
                                    className="flex flex-wrap gap-4 text-sm font-medium"
                                    role="tablist"
                                >
                                    <button
                                        type="button"
                                        className={`pb-2 border-b-2 ${
                                            activeTab === 'account'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                        onClick={() => setActiveTab('account')}
                                        role="tab"
                                        aria-selected={activeTab === 'account'}
                                    >
                                        Account
                                    </button>
                                    {auth.user.role === 'employer' && (
                                        <button
                                            type="button"
                                            className={`pb-2 border-b-2 ${
                                                activeTab === 'business'
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                            }`}
                                            onClick={() =>
                                                setActiveTab('business')
                                            }
                                            role="tab"
                                            aria-selected={
                                                activeTab === 'business'
                                            }
                                        >
                                            Business information
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={`pb-2 border-b-2 ${
                                            activeTab === 'password'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                        onClick={() => setActiveTab('password')}
                                        role="tab"
                                        aria-selected={activeTab === 'password'}
                                    >
                                        Password
                                    </button>
                                </nav>
                            </div>
                        </CardContent>
                    </Card>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => {
                            // Check if flash toast was already shown (prevents duplicate toasts)
                            const flashToastShown = flash?.toast && toastShown.current === flash.toast.message;
                            
                            // Show toast on successful form submission
                            // Skip if flash toast already shown (for business info submission)
                            if (recentlySuccessful && !formSuccessShown.current && !flashToastShown) {
                                formSuccessShown.current = true;
                                formErrorShown.current = false;
                                const tabName = activeTab === 'account' ? 'Account' : 'Business information';
                                toast.success(`${tabName} updated successfully`);
                                // Reset after a delay
                                setTimeout(() => {
                                    formSuccessShown.current = false;
                                }, 1000);
                            }

                            // Show toast on form errors
                            // Only show if there are actual errors, form wasn't successful, and no flash toast was shown
                            if (
                                Object.keys(errors).length > 0 && 
                                !formErrorShown.current && 
                                !recentlySuccessful && 
                                !flashToastShown
                            ) {
                                formErrorShown.current = true;
                                formSuccessShown.current = false;
                                toast.error('Please fix the errors and try again');
                                // Reset after a delay
                                setTimeout(() => {
                                    formErrorShown.current = false;
                                }, 1000);
                            }

                            return (
                            <>
                                {/* Photo input inside form */}
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    name="photo"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                                
                                {/* Hidden inputs for account fields when on business tab to ensure validation passes */}
                                {activeTab === 'business' && (
                                    <>
                                        <input type="hidden" name="firstname" value={auth.user.firstname || ''} />
                                        <input type="hidden" name="lastname" value={auth.user.lastname || ''} />
                                        <input type="hidden" name="email" value={auth.user.email || ''} />
                                        <input type="hidden" name="middlename" value={auth.user.middlename || ''} />
                                        <input type="hidden" name="suffix" value={auth.user.suffix || ''} />
                                        <input type="hidden" name="gender" value={gender || ''} />
                                        <input type="hidden" name="date_of_birth" value={dateOfBirth || ''} />
                                        <input type="hidden" name="age" value={age || ''} />
                                        <input type="hidden" name="address" value={auth.user.address || ''} />
                                    </>
                                )}
                                
                                {activeTab === 'account' && (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="firstname">
                                                    First name
                                                </Label>
                                                <Input
                                                    id="firstname"
                                                    className="mt-1 block w-full"
                                                    defaultValue={auth.user.firstname}
                                                    name="firstname"
                                                    required
                                                    autoComplete="given-name"
                                                    placeholder="First name"
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={errors.firstname}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="lastname">
                                                    Last name
                                                </Label>
                                                <Input
                                                    id="lastname"
                                                    className="mt-1 block w-full"
                                                    defaultValue={auth.user.lastname}
                                                    name="lastname"
                                                    required
                                                    autoComplete="family-name"
                                                    placeholder="Last name"
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={errors.lastname}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="middlename">
                                                    Middle name
                                                </Label>
                                                <Input
                                                    id="middlename"
                                                    className="mt-1 block w-full"
                                                    defaultValue={
                                                        auth.user.middlename ?? ''
                                                    }
                                                    name="middlename"
                                                    autoComplete="additional-name"
                                                    placeholder="Middle name (optional)"
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={errors.middlename}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="suffix">Suffix</Label>
                                                <Input
                                                    id="suffix"
                                                    className="mt-1 block w-full"
                                                    defaultValue={auth.user.suffix ?? ''}
                                                    name="suffix"
                                                    placeholder="e.g. Jr., III (optional)"
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={errors.suffix}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="gender">Gender</Label>
                                                <Select
                                                    value={gender}
                                                    onValueChange={(value) => setGender(value)}
                                                >
                                                    <SelectTrigger id="gender">
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {/* Hidden input for form submission */}
                                                <input
                                                    type="hidden"
                                                    name="gender"
                                                    value={gender}
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={errors.gender}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    Email address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    className="mt-1 block w-full"
                                                    defaultValue={auth.user.email}
                                                    name="email"
                                                    required
                                                    autoComplete="username"
                                                    placeholder="Email address"
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={errors.email}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="date_of_birth">
                                                    Date of birth
                                                </Label>
                                                <Input
                                                    id="date_of_birth"
                                                    type="date"
                                                    className="mt-1 block w-full"
                                                    value={dateOfBirth}
                                                    name="date_of_birth"
                                                    onChange={handleDateOfBirthChange}
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={errors.date_of_birth}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="age">Age</Label>
                                                <Input
                                                    id="age"
                                                    type="number"
                                                    min={0}
                                                    className="mt-1 block w-full"
                                                    value={age ?? ''}
                                                    name="age"
                                                    placeholder="Age"
                                                    readOnly
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={errors.age}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Input
                                                id="address"
                                                className="mt-1 block w-full"
                                                defaultValue={auth.user.address ?? ''}
                                                name="address"
                                                placeholder="Home address"
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors.address}
                                            />
                                        </div>

                                        {mustVerifyEmail &&
                                            auth.user.email_verified_at ===
                                                null && (
                                                <div>
                                                    <p className="-mt-4 text-sm text-muted-foreground">
                                                        Your email address is
                                                        unverified.{' '}
                                                        <Link
                                                            href={send()}
                                                            as="button"
                                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                        >
                                                            Click here to resend
                                                            the verification
                                                            email.
                                                        </Link>
                                                    </p>

                                                    {status ===
                                                        'verification-link-sent' && (
                                                        <div className="mt-2 text-sm font-medium text-green-600">
                                                            A new verification
                                                            link has been sent to
                                                            your email address.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                    </>
                                )}

                                {activeTab === 'business' &&
                                    auth.user.role === 'employer' && (
                                        <div className="space-y-4">
                                            <Heading
                                                variant="small"
                                                title="Employer information"
                                                description="Provide your business and contact details"
                                            />

                                            {/* Status alert */}
                                            {employerInformation?.status === 'pending' && (
                                                <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20">
                                                    <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                                                    <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                                                        Business Information Pending Approval
                                                    </AlertTitle>
                                                    <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                                                        Your submitted business information is pending. Please wait for admin approval before making changes.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {employerInformation?.status === 'declined' && (
                                                <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
                                                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500" />
                                                    <AlertTitle className="text-red-800 dark:text-red-200">
                                                        Business Information Declined
                                                    </AlertTitle>
                                                    <AlertDescription className="text-red-700 dark:text-red-300">
                                                        Your business information was declined. Please update your information and resubmit for approval.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {employerInformation?.status === 'approved' && (
                                                <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20">
                                                    <Info className="h-4 w-4 text-green-600 dark:text-green-500" />
                                                    <AlertTitle className="text-green-800 dark:text-green-200">
                                                        Business Information Approved
                                                    </AlertTitle>
                                                    <AlertDescription className="text-green-700 dark:text-green-300">
                                                        Your business information has been approved. Contact admin if you need to make changes.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="position">
                                                        Position
                                                    </Label>
                                                    <Input
                                                        id="position"
                                                        className="mt-1 block w-full"
                                                        defaultValue={
                                                            employerInformation
                                                                ?.position ?? ''
                                                        }
                                                        name="position"
                                                        placeholder="e.g. HR Manager"
                                                        disabled={employerInformation?.status === 'pending' || employerInformation?.status === 'approved'}
                                                    />
                                                    <InputError
                                                        className="mt-2"
                                                        message={errors.position}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="contact_number">
                                                        Contact number
                                                    </Label>
                                                    <Input
                                                        id="contact_number"
                                                        className="mt-1 block w-full"
                                                        defaultValue={
                                                            employerInformation
                                                                ?.contact_number ??
                                                            ''
                                                        }
                                                        name="contact_number"
                                                        placeholder="e.g. 09xxxxxxxxx"
                                                        disabled={employerInformation?.status === 'pending' || employerInformation?.status === 'approved'}
                                                    />
                                                    <InputError
                                                        className="mt-2"
                                                        message={
                                                            errors.contact_number
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="business_address">
                                                    Business address
                                                </Label>
                                                <Input
                                                    id="business_address"
                                                    className="mt-1 block w-full"
                                                    defaultValue={
                                                        employerInformation
                                                            ?.business_address ??
                                                        ''
                                                    }
                                                    name="business_address"
                                                    placeholder="Business address"
                                                    disabled={employerInformation?.status === 'pending' || employerInformation?.status === 'approved'}
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={
                                                        errors.business_address
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="business_permit">
                                                        Business permit
                                                    </Label>
                                                    <div className="space-y-2">
                                                        {businessPermitPreview && (
                                                            <div className="relative w-full h-32 border rounded-md overflow-hidden bg-muted/50">
                                                                {businessPermitPreview.endsWith('.pdf') || businessPermitPreview.includes('application/pdf') ? (
                                                                    <div className="flex items-center justify-center h-full">
                                                                        <div className="text-center">
                                                                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                                                            <span className="text-sm text-muted-foreground">PDF File</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src={businessPermitPreview}
                                                                        alt="Business permit preview"
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                ref={businessPermitInputRef}
                                                                id="business_permit"
                                                                type="file"
                                                                accept="image/*,.pdf"
                                                                className="mt-1 block w-full"
                                                                name="business_permit"
                                                                onChange={handleBusinessPermitChange}
                                                                disabled={employerInformation?.status === 'pending' || employerInformation?.status === 'approved'}
                                                            />
                                                            {employerInformation?.business_permit && !businessPermitPreview && (
                                                                <span className="text-sm text-muted-foreground truncate">
                                                                    Current file exists
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <InputError
                                                        className="mt-2"
                                                        message={
                                                            errors.business_permit
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="tin">
                                                        TIN
                                                    </Label>
                                                    <Input
                                                        id="tin"
                                                        className="mt-1 block w-full"
                                                        defaultValue={
                                                            employerInformation
                                                                ?.tin ?? ''
                                                        }
                                                        name="tin"
                                                        placeholder="Tax Identification Number"
                                                        disabled={employerInformation?.status === 'pending' || employerInformation?.status === 'approved'}
                                                    />
                                                    <InputError
                                                        className="mt-2"
                                                        message={errors.tin}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="type_of_business">
                                                    Type of business
                                                </Label>
                                                <Input
                                                    id="type_of_business"
                                                    className="mt-1 block w-full"
                                                    defaultValue={
                                                        employerInformation
                                                            ?.type_of_business ??
                                                        ''
                                                    }
                                                    name="type_of_business"
                                                    placeholder="e.g. Retail, Services"
                                                    disabled={employerInformation?.status === 'pending' || employerInformation?.status === 'approved'}
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={
                                                        errors.type_of_business
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}

                                {activeTab === 'password' && (
                                    <div className="space-y-6">
                                        <Heading
                                            variant="small"
                                            title="Update password"
                                            description="Ensure your account is using a long, random password to stay secure"
                                        />

                                        <Form
                                            {...PasswordController.update.form()}
                                            options={{
                                                preserveScroll: true,
                                            }}
                                            resetOnError={[
                                                'password',
                                                'password_confirmation',
                                                'current_password',
                                            ]}
                                            resetOnSuccess
                                            onError={(errors) => {
                                                if (errors.password) {
                                                    passwordInputRef.current?.focus();
                                                }

                                                if (errors.current_password) {
                                                    currentPasswordInputRef.current?.focus();
                                                }
                                            }}
                                            className="space-y-6"
                                        >
                                            {({ errors, processing, recentlySuccessful }) => (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="current_password">
                                                            Current password
                                                        </Label>

                                                        <Input
                                                            id="current_password"
                                                            ref={currentPasswordInputRef}
                                                            name="current_password"
                                                            type="password"
                                                            className="mt-1 block w-full"
                                                            autoComplete="current-password"
                                                            placeholder="Current password"
                                                        />

                                                        <InputError
                                                            message={errors.current_password}
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="password">
                                                            New password
                                                        </Label>

                                                        <Input
                                                            id="password"
                                                            ref={passwordInputRef}
                                                            name="password"
                                                            type="password"
                                                            className="mt-1 block w-full"
                                                            autoComplete="new-password"
                                                            placeholder="New password"
                                                        />

                                                        <InputError message={errors.password} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="password_confirmation">
                                                            Confirm password
                                                        </Label>

                                                        <Input
                                                            id="password_confirmation"
                                                            name="password_confirmation"
                                                            type="password"
                                                            className="mt-1 block w-full"
                                                            autoComplete="new-password"
                                                            placeholder="Confirm password"
                                                        />

                                                        <InputError
                                                            message={errors.password_confirmation}
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <Button
                                                            disabled={processing}
                                                            data-test="update-password-button"
                                                        >
                                                            Save password
                                                        </Button>

                                                        <Transition
                                                            show={recentlySuccessful}
                                                            enter="transition ease-in-out"
                                                            enterFrom="opacity-0"
                                                            leave="transition ease-in-out"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <p className="text-sm text-neutral-600">
                                                                Saved
                                                            </p>
                                                        </Transition>
                                                    </div>
                                                </>
                                            )}
                                        </Form>
                                    </div>
                                )}

                                {activeTab !== 'password' && (
                                    <div className="flex items-center gap-4">
                                        <Button
                                            disabled={
                                                processing ||
                                                (activeTab === 'business' &&
                                                    (employerInformation?.status === 'pending' ||
                                                        employerInformation?.status === 'approved'))
                                            }
                                            data-test="update-profile-button"
                                        >
                                            Save
                                        </Button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-neutral-600">
                                                Saved
                                            </p>
                                        </Transition>
                                    </div>
                                )}
                            </>
                            );
                        }}
                    </Form>
                </div>

                <DeleteUser />

                {/* Photo upload confirmation dialog */}
                <Dialog open={showPhotoConfirmDialog} onOpenChange={setShowPhotoConfirmDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                                </div>
                                <DialogTitle>Confirm Photo Upload</DialogTitle>
                            </div>
                            <DialogDescription className="pt-2">
                                You have selected a new photo. Do you want to save this photo to your profile?
                            </DialogDescription>
                        </DialogHeader>
                        {avatarPreview && (
                            <div className="flex justify-center py-4">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={avatarPreview} alt="Preview" />
                                    <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                                        {initials || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={handleCancelPhotoUpload}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleConfirmPhotoUpload}
                            >
                                Save Photo
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SettingsLayout>
        </AppLayout>
    );
}
