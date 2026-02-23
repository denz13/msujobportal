import { Form, Head, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
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

            <div
                className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-[#1a4d2e]/[0.06] font-[family-name:var(--font-instrument-sans)] dark:from-slate-950 dark:via-slate-900 dark:to-[#1a4d2e]/20"
                style={{ fontFamily: 'Instrument Sans, sans-serif' }}
            >
                {/* Decorative background (simplified from welcome) */}
                <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
                    <div className="absolute left-[10%] top-[15%] h-16 w-16 rounded-full border-2 border-[#1a4d2e]/20 bg-[#1a4d2e]/10 animate-float" />
                    <div className="absolute right-[15%] top-[25%] h-10 w-10 rounded-full bg-[#8b0000]/15 animate-float" />
                    <div className="absolute left-[25%] top-[45%] h-8 w-8 rounded-full border border-slate-300/60 bg-white/50 animate-float" />
                    <div className="absolute right-[8%] top-[55%] h-12 w-12 rounded-full bg-[#d4af37]/20 animate-float" />
                </div>

                {/* Main content: centered login card */}
                <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
                    <div className="mx-auto grid w-full max-w-4xl gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
                        {/* Left side text */}
                        <section className="space-y-4 text-center md:text-left">
                            <p className="inline-flex items-center gap-2 rounded-full border border-[#1a4d2e]/15 bg-white/80 px-3 py-1 text-xs font-medium text-[#1a4d2e] shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                                Secure login for employers & job seekers
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                Welcome back
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Sign in to manage your job posts, track applications, or explore new opportunities.
                            </p>
                        </section>

                        {/* Login card */}
                        <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-slate-900/60">
                            <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
                                Log in to your account
                            </h2>
                            <p className="mb-5 text-xs text-slate-600 dark:text-slate-400">
                                Enter your email and password below to continue.
                            </p>

                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-4">
                                            <div className="grid gap-2 text-left">
                                                <Label htmlFor="email">Email address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="email@example.com"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="grid gap-2 text-left">
                                                <div className="flex items-center">
                                                    <Label htmlFor="password">Password</Label>
                                                    {canResetPassword && (
                                                        <TextLink
                                                            href={request()}
                                                            className="ml-auto text-xs"
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
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                    tabIndex={3}
                                                />
                                                <Label htmlFor="remember" className="text-xs">
                                                    Remember me
                                                </Label>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="mt-2 w-full"
                                                tabIndex={4}
                                                disabled={processing}
                                                data-test="login-button"
                                            >
                                                {processing && <Spinner />}
                                                Log in
                                            </Button>
                                        </div>

                                        {canRegister && (
                                            <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
                                                Don't have an account?{' '}
                                                <TextLink href={register()} tabIndex={5}>
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

                <footer className="relative z-10 border-t border-slate-200 py-4 dark:border-slate-800">
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                        © {new Date().getFullYear()} JobPortal · Secure login
                    </p>
                </footer>
            </div>

            <style>{`
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
                    animation: float 7s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
