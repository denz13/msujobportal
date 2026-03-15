import { Form, Head } from '@inertiajs/react';
import { Briefcase, Building2 } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
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
                {/* Decorative background — same as login/welcome */}
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
                        {/* Left — copy */}
                        <section className="space-y-5 text-center md:text-left">
                            <div
                                className="animate-fade-in inline-flex rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-2 shadow-lg shadow-slate-900/50"
                                style={{ animationDelay: '0ms', animationFillMode: 'both' }}
                            >
                                <span className="text-sm font-medium text-emerald-400">Join as employer or job seeker</span>
                            </div>
                            <h1
                                className="animate-fade-in text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
                                style={{ animationDelay: '50ms', animationFillMode: 'both' }}
                            >
                                <span className="bg-gradient-to-r from-emerald-400 via-[#1a4d2e] to-slate-200 bg-clip-text text-transparent">
                                    Create an account
                                </span>
                            </h1>
                            <p
                                className="animate-fade-in text-sm leading-relaxed text-slate-400"
                                style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                            >
                                Enter your details below to get started. You can post jobs as an employer or apply as a job seeker.
                            </p>
                        </section>

                        {/* Right — register card */}
                        <section
                            className="animate-fade-in rounded-2xl border border-slate-700 bg-slate-800/95 p-6 shadow-xl shadow-slate-900/50 backdrop-blur-md sm:p-8"
                            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                        >
                            <h2 className="mb-1 text-xl font-semibold text-white">
                                Create an account
                            </h2>
                            <p className="mb-6 text-sm text-slate-400">
                                Enter your details below to create your account.
                            </p>

                            <Form
                                {...store.form()}
                                resetOnSuccess={['password', 'password_confirmation']}
                                disableWhileProcessing
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="firstname" className="text-slate-200">First name</Label>
                                                    <Input
                                                        id="firstname"
                                                        type="text"
                                                        required
                                                        autoFocus
                                                        tabIndex={1}
                                                        autoComplete="given-name"
                                                        name="firstname"
                                                        placeholder="First name"
                                                        className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                                    />
                                                    <InputError message={errors.firstname} className="mt-1" />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="lastname" className="text-slate-200">Last name</Label>
                                                    <Input
                                                        id="lastname"
                                                        type="text"
                                                        required
                                                        tabIndex={3}
                                                        autoComplete="family-name"
                                                        name="lastname"
                                                        placeholder="Last name"
                                                        className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                                    />
                                                    <InputError message={errors.lastname} className="mt-1" />
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="middlename" className="text-slate-200">Middle name</Label>
                                                <Input
                                                    id="middlename"
                                                    type="text"
                                                    tabIndex={2}
                                                    autoComplete="additional-name"
                                                    name="middlename"
                                                    placeholder="Middle name (optional)"
                                                    className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                                />
                                                <InputError message={errors.middlename} className="mt-1" />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="suffix" className="text-slate-200">Suffix</Label>
                                                <Input
                                                    id="suffix"
                                                    type="text"
                                                    tabIndex={4}
                                                    name="suffix"
                                                    placeholder="e.g. Jr., III (optional)"
                                                    className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                                />
                                                <InputError message={errors.suffix} className="mt-1" />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email" className="text-slate-200">Email address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    tabIndex={5}
                                                    autoComplete="email"
                                                    name="email"
                                                    placeholder="email@example.com"
                                                    className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password" className="text-slate-200">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    required
                                                    tabIndex={6}
                                                    autoComplete="new-password"
                                                    name="password"
                                                    placeholder="Password"
                                                    className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation" className="text-slate-200">Confirm password</Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    required
                                                    tabIndex={7}
                                                    autoComplete="new-password"
                                                    name="password_confirmation"
                                                    placeholder="Confirm password"
                                                    className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                                />
                                                <InputError message={errors.password_confirmation} />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="mt-2 w-full bg-[#1a4d2e] font-semibold text-white hover:bg-[#1a4d2e]/90 focus-visible:ring-emerald-500"
                                                tabIndex={9}
                                                data-test="register-user-button"
                                                disabled={processing}
                                            >
                                                {processing && <Spinner />}
                                                Create account
                                            </Button>
                                        </div>

                                        <div className="text-center text-sm text-slate-400">
                                            Already have an account?{' '}
                                            <TextLink href={login()} className="text-emerald-400 hover:text-emerald-300" tabIndex={10}>
                                                Log in
                                            </TextLink>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </section>
                    </div>
                </main>

                <footer className="relative z-10 border-t border-slate-800 py-4">
                    <p className="text-center text-xs text-slate-500">
                        © {new Date().getFullYear()} JobPortal
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
