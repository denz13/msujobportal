import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import {
    Briefcase,
    Building2,
    ChevronRight,
    Search,
    Shield,
    Users,
} from 'lucide-react';

const getFeatures = (registerUrl: string) => [
    {
        title: 'Job Search',
        description:
            'Find jobs that match your skills. Use filters, save listings, and apply with one click.',
        icon: Search,
        href: registerUrl,
        gradient: 'from-[#1a4d2e] to-emerald-700',
        bgGlow: 'bg-[#1a4d2e]/20',
        iconColor: 'text-[#1a4d2e]',
    },
    {
        title: 'Post Jobs',
        description:
            'Employers can post openings, manage applications, and reach qualified candidates.',
        icon: Building2,
        href: registerUrl,
        gradient: 'from-[#8b0000] to-rose-800',
        bgGlow: 'bg-[#8b0000]/20',
        iconColor: 'text-[#8b0000]',
    },
    {
        title: 'For Job Seekers',
        description:
            'Create a profile, browse verified employers, and track your applications.',
        icon: Briefcase,
        href: registerUrl,
        gradient: 'from-[#d4af37] to-amber-600',
        bgGlow: 'bg-[#d4af37]/20',
        iconColor: 'text-amber-700',
    },
    {
        title: 'Verified & Secure',
        description:
            'All employers are verified. Your data and applications are handled securely.',
        icon: Shield,
        href: registerUrl,
        gradient: 'from-slate-600 to-slate-800',
        bgGlow: 'bg-slate-500/20',
        iconColor: 'text-slate-700',
    },
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props as { auth: { user?: any } };

    return (
        <>
            <Head title="Job Portal - Find Your Dream Job or Post Available Positions">
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
                {/* Job-themed geometric background */}
                <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
                    {/* Floating circles */}
                    <div className="absolute left-[10%] top-[15%] h-16 w-16 rounded-full border-2 border-[#1a4d2e]/30 bg-[#1a4d2e]/5 animate-float" style={{ animationDelay: '0s', animationDuration: '6s' }} />
                    <div className="absolute right-[15%] top-[25%] h-10 w-10 rounded-full bg-[#8b0000]/20 animate-float" style={{ animationDelay: '1.5s', animationDuration: '7s' }} />
                    <div className="absolute left-[25%] top-[45%] h-8 w-8 rounded-full border border-slate-600 bg-slate-600/30 animate-float" style={{ animationDelay: '3s', animationDuration: '5s' }} />
                    <div className="absolute right-[8%] top-[55%] h-12 w-12 rounded-full bg-[#d4af37]/15 animate-float" style={{ animationDelay: '0.5s', animationDuration: '8s' }} />
                    <div className="absolute left-[12%] top-[70%] h-6 w-6 rounded-full bg-[#1a4d2e]/15 animate-float" style={{ animationDelay: '2s', animationDuration: '6.5s' }} />
                    <div className="absolute right-[22%] top-[75%] h-14 w-14 rounded-full border-2 border-[#1a4d2e]/25 animate-float" style={{ animationDelay: '2.5s', animationDuration: '7.5s' }} />
                    {/* Briefcase icons */}
                    <div className="absolute left-[5%] top-[30%] animate-float" style={{ animationDelay: '0s', animationDuration: '9s' }}>
                        <Briefcase className="h-12 w-12 text-[#1a4d2e]/15" />
                    </div>
                    <div className="absolute right-[10%] top-[12%] animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }}>
                        <Building2 className="h-10 w-10 text-[#8b0000]/20" />
                    </div>
                    <div className="absolute left-[75%] top-[65%] animate-float" style={{ animationDelay: '4s', animationDuration: '7s' }}>
                        <Briefcase className="h-8 w-8 text-[#d4af37]/15" />
                    </div>
                    <div className="absolute right-[6%] top-[42%] animate-float" style={{ animationDelay: '1s', animationDuration: '10s' }}>
                        <Search className="h-14 w-14 text-slate-500/20" />
                    </div>
                    {/* Grid dots */}
                    <div className="absolute left-0 top-1/4 h-48 w-32 opacity-15">
                        <div className="grid grid-cols-4 gap-2">
                            {[...Array(24)].map((_, i) => (
                                <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#1a4d2e]/40 animate-pulse-slow" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                    <div className="absolute right-0 top-1/2 h-40 w-24 opacity-10">
                        <div className="grid grid-cols-3 gap-2">
                            {[...Array(18)].map((_, i) => (
                                <div key={i} className="h-1 w-1 rounded-full bg-[#8b0000]/30 animate-pulse-slow" style={{ animationDelay: `${i * 0.2}s` }} />
                            ))}
                        </div>
                    </div>
                    {/* Plus / connect symbol */}
                    <div className="absolute left-[70%] top-[20%] text-[#1a4d2e]/10 animate-float" style={{ animationDelay: '1s', animationDuration: '6s' }}>
                        <Users className="h-10 w-10" />
                    </div>
                </div>

                {/* Nav - dark green header, glass */}
                <header className="sticky top-0 z-50 border-b border-[#1a4d2e]/10 bg-[#1a4d2e]/90 backdrop-blur-md">
                    <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-6 w-6 text-[#d4af37]" />
                            <span className="text-xl font-bold text-white">JobPortal</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white shadow transition-all hover:bg-white/25 active:scale-[0.98] border border-white/20"
                                >
                                    Go to Dashboard
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-medium text-[#1a4d2e] shadow-lg shadow-[#d4af37]/25 transition-all hover:bg-[#e5c158] active:scale-[0.98]"
                                        >
                                            Register
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
                    {/* Hero */}
                    <section className="flex flex-col items-center pt-12 text-center md:pt-16 lg:pt-20">
                        <div
                            className="mb-8 inline-flex animate-fade-in items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-2 shadow-lg shadow-slate-900/50"
                            style={{ animationDelay: '0ms', animationFillMode: 'both' }}
                        >
                            <span className="text-sm font-medium text-emerald-400">Job Portal for Job Seekers & Employers</span>
                        </div>
                        <h1
                            className="animate-fade-in text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
                            style={{ animationDelay: '50ms', animationFillMode: 'both' }}
                        >
                            <span className="bg-gradient-to-r from-emerald-400 via-[#1a4d2e] to-slate-200 bg-clip-text text-transparent">
                                Find Your Dream Job
                            </span>
                            <br />
                            <span className="text-slate-200">
                                or Post Available Positions
                            </span>
                        </h1>
                        <p
                            className="mt-4 max-w-2xl animate-fade-in text-lg text-slate-400"
                            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                        >
                            Connect talented job seekers with top employers. Whether you're
                            looking for opportunities or hiring talent, we've got you covered.
                        </p>
                    </section>

                    {/* Features */}
                    <section className="mt-20 lg:mt-28">
                        <h2
                            className="animate-fade-in text-center text-2xl font-bold text-slate-100 sm:text-3xl"
                            style={{ animationDelay: '150ms', animationFillMode: 'both' }}
                        >
                            What you can do
                        </h2>
                        <p
                            className="mx-auto mt-2 max-w-xl animate-fade-in text-center text-slate-400"
                            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
                        >
                            Everything you need to find jobs or hire talent—in one place.
                        </p>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {getFeatures(register.url()).map((feature, i) => {
                                const Icon = feature.icon;
                                return (
                                    <Link
                                        key={feature.title}
                                        href={feature.href}
                                        className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-600 hover:shadow-xl animate-fade-in"
                                        style={{
                                            animationDelay: `${250 + i * 80}ms`,
                                            animationFillMode: 'both',
                                        }}
                                    >
                                        <div
                                            className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50 ${feature.bgGlow}`}
                                        />
                                        <div
                                            className={`inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 shadow-lg`}
                                        >
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="mt-4 font-semibold text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                                            {feature.description}
                                        </p>
                                        <span
                                            className={`mt-3 inline-flex items-center gap-1 text-sm font-medium ${feature.iconColor}`}
                                        >
                                            Explore
                                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                </main>

                <footer className="relative z-10 border-t border-slate-800 py-6">
                    <p className="text-center text-sm text-slate-400">
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
                    animation: float var(--float-duration, 6s) ease-in-out infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 0.4;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.1);
                    }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2.5s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
