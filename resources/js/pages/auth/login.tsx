import { Form, Head, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Briefcase, Building2 } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const { flash } = usePage().props as { flash?: { toast?: { type: string; message: string } } };
    const toastShown = useRef<string | null>(null);

    useEffect(() => {
        if (flash?.toast && toastShown.current !== flash.toast.message) {
            toastShown.current = flash.toast.message;
            
            if (flash.toast.type === 'success') {
                toast.success(flash.toast.message);
            } else if (flash.toast.type === 'error') {
                toast.error(flash.toast.message);
            } else {
                toast(flash.toast.message);
            }
        }
    }, [flash]);

    return (
        <>
            <Head title="Log in">
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
                {/* Decorative background — same style as welcome */}
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
                    <div className="mx-auto grid w-full max-w-4xl gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
                        {/* Left — welcome copy (welcome page style) */}
                        <section className="space-y-5 text-center md:text-left">
                            <div
                                className="animate-fade-in inline-flex rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-2 shadow-lg shadow-slate-900/50"
                                style={{ animationDelay: '0ms', animationFillMode: 'both' }}
                            >
                                <span className="text-sm font-medium text-emerald-400">Secure login for employers</span>
                            </div>
                            <h1
                                className="animate-fade-in text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
                                style={{ animationDelay: '50ms', animationFillMode: 'both' }}
                            >
                                <span className="bg-gradient-to-r from-emerald-400 via-[#1a4d2e] to-slate-200 bg-clip-text text-transparent">
                                    Welcome back
                                </span>
                            </h1>
                            <p
                                className="animate-fade-in text-sm leading-relaxed text-slate-400"
                                style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                            >
                                Sign in to manage your job posts, track applications, or explore new opportunities.
                            </p>
                        </section>

                        {/* Right — login card */}
                        <section
                            className="animate-fade-in rounded-2xl border border-slate-700 bg-slate-800/95 p-6 shadow-xl shadow-slate-900/50 backdrop-blur-md sm:p-8"
                            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                        >
                            <h2 className="mb-1 text-xl font-semibold text-white">
                                Log in to your account
                            </h2>
                            <p className="mb-6 text-sm text-slate-400">
                                Enter your email and password below to continue.
                            </p>

                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-5">
                                            <div className="grid gap-2 text-left">
                                                <Label htmlFor="email" className="text-slate-200">Email address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="email@example.com"
                                                    className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="grid gap-2 text-left">
                                                <div className="flex items-center">
                                                    <Label htmlFor="password" className="text-slate-200">Password</Label>
                                                    {canResetPassword && (
                                                        <TextLink
                                                            href={request()}
                                                            className="ml-auto text-xs text-slate-400 hover:text-emerald-400"
                                                            tabIndex={5}
                                                        >
                                                            Forgot password?
                                                        </TextLink>
                                                    )}
                                                </div>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="Password"
                                                    className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                    tabIndex={3}
                                                    className="border-slate-600 data-[state=checked]:bg-[#1a4d2e] data-[state=checked]:border-[#1a4d2e]"
                                                />
                                                <Label htmlFor="remember" className="text-sm text-slate-400">
                                                    Remember me
                                                </Label>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="mt-1 w-full bg-[#1a4d2e] font-semibold text-white hover:bg-[#1a4d2e]/90 focus-visible:ring-emerald-500"
                                                tabIndex={4}
                                                disabled={processing}
                                                data-test="login-button"
                                            >
                                                {processing && <Spinner />}
                                                Log in
                                            </Button>
                                        </div>

                                        {canRegister && (
                                            <div className="pt-2 text-center text-sm text-slate-400">
                                                Don't have an account?{' '}
                                                <TextLink href={register()} className="text-emerald-400 hover:text-emerald-300" tabIndex={5}>
                                                    Sign up
                                                </TextLink>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Form>
                        </section>
                    </div>
                </main>

                <footer className="relative z-10 border-t border-slate-800 py-4">
                    <p className="text-center text-xs text-slate-500">
                        © {new Date().getFullYear()} JobPortal · Secure login
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
