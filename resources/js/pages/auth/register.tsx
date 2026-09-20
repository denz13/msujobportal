import { Form, Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import {
    Briefcase,
    Building2,
    Eye,
    EyeOff,
    FileText,
    ImageIcon,
    Lock,
    Mail,
    MapPin,
    Phone,
    Upload,
    X,
} from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const permitInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [permitFileName, setPermitFileName] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        business_name: string;
        business_permit: File | null;
        tin: string;
        business_address: string;
        email: string;
        password: string;
        password_confirmation: string;
        contact_number: string;
        photo: File | null;
    }>({
        business_name: '',
        business_permit: null,
        tin: '',
        business_address: '',
        email: '',
        password: '',
        password_confirmation: '',
        contact_number: '',
        photo: null,
    });

    const handlePermitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setData('business_permit', file);
            setPermitFileName(file.name);
        } else {
            setData('business_permit', null);
            setPermitFileName(null);
        }
    };

    const handlePhotoFile = (file: File | null) => {
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        if (file) {
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        } else {
            setData('photo', null);
            setPhotoPreview(null);
            if (photoInputRef.current) photoInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            forceFormData: true,
            onSuccess: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <>
            <Head title="Register">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="dark">
                <div
                    className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#1a4d2e]/20 font-[family-name:var(--font-instrument-sans)]"
                    style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                >
                    {/* Decorative background */}
                    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
                        <div className="absolute left-[10%] top-[15%] h-16 w-16 rounded-full border-2 border-[#1a4d2e]/30 bg-[#1a4d2e]/5 animate-float" style={{ animationDelay: '0s', animationDuration: '6s' }} />
                        <div className="absolute right-[15%] top-[25%] h-10 w-10 rounded-full bg-[#8b0000]/20 animate-float" style={{ animationDelay: '1.5s', animationDuration: '7s' }} />
                        <div className="absolute left-[25%] top-[45%] h-8 w-8 rounded-full border border-slate-600 bg-slate-600/30 animate-float" style={{ animationDelay: '3s', animationDuration: '5s' }} />
                        <div className="absolute right-[8%] top-[55%] h-12 w-12 rounded-full bg-[#d4af37]/15 animate-float" style={{ animationDelay: '0.5s', animationDuration: '8s' }} />
                        <div className="absolute left-[12%] top-[70%] h-6 w-6 rounded-full bg-[#1a4d2e]/15 animate-float" style={{ animationDelay: '2s', animationDuration: '6.5s' }} />
                        <div className="absolute right-[22%] top-[75%] h-14 w-14 rounded-full border-2 border-[#1a4d2e]/25 animate-float" style={{ animationDelay: '2.5s', animationDuration: '7.5s' }} />
                        <div className="absolute left-[5%] top-[30%] animate-float" style={{ animationDelay: '0s', animationDuration: '9s' }}>
                            <Briefcase className="h-12 w-12 text-[#1a4d2e]/15" />
                        </div>
                        <div className="absolute right-[10%] top-[12%] animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }}>
                            <Building2 className="h-10 w-10 text-[#8b0000]/20" />
                        </div>
                        <div className="absolute left-[75%] top-[65%] animate-float" style={{ animationDelay: '4s', animationDuration: '7s' }}>
                            <Briefcase className="h-8 w-8 text-[#d4af37]/15" />
                        </div>
                    </div>

                    <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
                        <div className="mx-auto grid w-full max-w-4xl gap-10 md:grid-cols-[1.05fr_1.2fr] md:items-center">
                            {/* Left — copy */}
                            <section className="space-y-5 text-center md:text-left">
                                <div
                                    className="animate-fade-in flex items-center justify-center gap-2 md:justify-start"
                                    style={{ animationDelay: '0ms', animationFillMode: 'both' }}
                                >
                                    <Briefcase className="h-8 w-8 text-[#d4af37]" aria-hidden />
                                    <span className="text-xl font-bold text-white">JobPortal</span>
                                </div>
                                <div
                                    className="animate-fade-in inline-flex rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-2 shadow-lg shadow-slate-900/50"
                                    style={{ animationDelay: '50ms', animationFillMode: 'both' }}
                                >
                                    <span className="text-sm font-medium text-emerald-400">Join as Business / Employer</span>
                                </div>
                                <h1
                                    className="animate-fade-in text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
                                    style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                                >
                                    <span className="bg-gradient-to-r from-emerald-400 via-[#1a4d2e] to-slate-200 bg-clip-text text-transparent">
                                        Register Business
                                    </span>
                                </h1>
                                <p
                                    className="animate-fade-in text-sm leading-relaxed text-slate-400"
                                    style={{ animationDelay: '150ms', animationFillMode: 'both' }}
                                >
                                    Register your business to start posting job vacancies and hiring qualified candidates.
                                </p>
                            </section>

                            {/* Right — register card */}
                            <section
                                className="animate-fade-in rounded-2xl border border-slate-700 bg-slate-800/95 p-6 shadow-xl shadow-slate-900/50 backdrop-blur-md sm:p-8"
                                style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                            >
                                <h2 className="mb-1 text-xl font-semibold text-white">
                                    Create Business Account
                                </h2>
                                <p className="mb-6 text-sm text-slate-400">
                                    Enter your business details below to get started.
                                </p>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    {/* Business Name */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="business_name" className="text-slate-200 font-medium">
                                            Business Name
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            <Input
                                                id="business_name"
                                                type="text"
                                                required
                                                autoFocus
                                                value={data.business_name}
                                                onChange={(e) => setData('business_name', e.target.value)}
                                                placeholder="Enter your business name"
                                                className="border-slate-600 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                            />
                                        </div>
                                        <InputError message={errors.business_name} />
                                    </div>

                                    {/* Business Permit */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="business_permit" className="text-slate-200 font-medium">
                                            Business Permit
                                        </Label>
                                        <input
                                            ref={permitInputRef}
                                            id="business_permit"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="hidden"
                                            onChange={handlePermitChange}
                                        />
                                        <div
                                            onClick={() => permitInputRef.current?.click()}
                                            className="relative flex cursor-pointer items-center justify-between rounded-md border border-slate-600 bg-slate-900/50 px-3 py-2.5 text-sm transition-colors hover:border-slate-500"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                                                <span className={`truncate ${permitFileName ? 'text-white font-medium' : 'text-slate-500'}`}>
                                                    {permitFileName || 'Upload your business permit (PDF, JPG, or PNG)'}
                                                </span>
                                            </div>
                                            {permitFileName ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setData('business_permit', null);
                                                        setPermitFileName(null);
                                                        if (permitInputRef.current) permitInputRef.current.value = '';
                                                    }}
                                                    className="rounded p-1 text-slate-400 hover:text-white"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400 border border-slate-700 shrink-0">
                                                    Browse
                                                </span>
                                            )}
                                        </div>
                                        <InputError message={errors.business_permit} />
                                    </div>

                                    {/* TIN */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="tin" className="text-slate-200 font-medium">
                                            TIN <span className="text-xs text-slate-400 font-normal">(Tax Identification Number)</span>
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <Input
                                                id="tin"
                                                type="text"
                                                value={data.tin}
                                                onChange={(e) => setData('tin', e.target.value)}
                                                placeholder="Enter your TIN"
                                                className="border-slate-600 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                            />
                                        </div>
                                        <InputError message={errors.tin} />
                                    </div>

                                    {/* Business Address/Location */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="business_address" className="text-slate-200 font-medium">
                                            Business Address/Location
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <Input
                                                id="business_address"
                                                type="text"
                                                required
                                                value={data.business_address}
                                                onChange={(e) => setData('business_address', e.target.value)}
                                                placeholder="Enter your business address or location"
                                                className="border-slate-600 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                            />
                                        </div>
                                        <InputError message={errors.business_address} />
                                    </div>

                                    {/* Email Address */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-slate-200 font-medium">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                autoComplete="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter your email address"
                                                className="border-slate-600 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="text-slate-200 font-medium">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                <Lock className="h-4 w-4" />
                                            </div>
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                autoComplete="new-password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter your password"
                                                className="border-slate-600 bg-slate-900/50 pl-10 pr-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-slate-200"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation" className="text-slate-200 font-medium">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                <Lock className="h-4 w-4" />
                                            </div>
                                            <Input
                                                id="password_confirmation"
                                                type={showPasswordConfirm ? 'text' : 'password'}
                                                required
                                                autoComplete="new-password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="Re-enter your password"
                                                className="border-slate-600 bg-slate-900/50 pl-10 pr-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordConfirm((v) => !v)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-slate-200"
                                                aria-label={showPasswordConfirm ? 'Hide password' : 'Show password'}
                                                tabIndex={-1}
                                            >
                                                {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    {/* Contact Number */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="contact_number" className="text-slate-200 font-medium">
                                            Contact Number
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <Input
                                                id="contact_number"
                                                type="text"
                                                required
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                                placeholder="Enter your contact number"
                                                className="border-slate-600 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                            />
                                        </div>
                                        <InputError message={errors.contact_number} />
                                    </div>

                                    {/* Business Picture (Optional) */}
                                    <div className="grid gap-2">
                                        <Label className="text-slate-200 font-medium">
                                            Business Picture <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                                        </Label>
                                        <input
                                            ref={photoInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            className="hidden"
                                            onChange={(e) => handlePhotoFile(e.target.files?.[0] ?? null)}
                                        />

                                        {photoPreview ? (
                                            <div className="relative flex items-center justify-between rounded-lg border border-slate-600 bg-slate-900/60 p-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={photoPreview}
                                                        alt="Business picture preview"
                                                        className="h-12 w-12 rounded object-cover border border-slate-700"
                                                    />
                                                    <div className="text-xs">
                                                        <p className="font-medium text-white">{data.photo?.name}</p>
                                                        <p className="text-slate-400">
                                                            {data.photo?.size ? (data.photo.size / 1024).toFixed(1) + ' KB' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handlePhotoFile(null)}
                                                    className="rounded p-1 text-slate-400 hover:text-white"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => photoInputRef.current?.click()}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setDragActive(true);
                                                }}
                                                onDragLeave={() => setDragActive(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setDragActive(false);
                                                    handlePhotoFile(e.dataTransfer.files?.[0] ?? null);
                                                }}
                                                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed py-5 px-4 text-center transition-colors ${
                                                    dragActive
                                                        ? 'border-emerald-500 bg-emerald-950/20'
                                                        : 'border-slate-600 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/60'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-slate-800 p-2 text-slate-400 border border-slate-700">
                                                        <ImageIcon className="h-6 w-6" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs sm:text-sm font-medium text-slate-200">
                                                            Click to upload or drag and drop
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">
                                                            JPG, PNG (Max 5MB)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <InputError message={errors.photo} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="mt-2 w-full bg-[#1a4d2e] font-semibold text-white hover:bg-[#1a4d2e]/90 focus-visible:ring-emerald-500"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Create account
                                    </Button>
                                </form>

                                <div className="mt-6 text-center text-sm text-slate-400">
                                    Already have an account?{' '}
                                    <TextLink href={login()} className="text-emerald-400 hover:text-emerald-300">
                                        Log in
                                    </TextLink>
                                </div>
                            </section>
                        </div>
                    </main>

                    <footer className="relative z-10 border-t border-slate-800 py-4">
                        <p className="text-center text-xs text-white">
                            © {new Date().getFullYear()} JobPortal · Find jobs or post positions
                        </p>
                    </footer>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                }
                @keyframes float {
                    0%, 100% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    25% {
                        transform: translate(6px, -12px) rotate(2deg);
                    }
                    50% {
                        transform: translate(-4px, -20px) rotate(-1deg);
                    }
                    75% {
                        transform: translate(8px, -10px) rotate(1deg);
                    }
                }
                .animate-float {
                    animation: float var(--float-duration, 7s) ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
