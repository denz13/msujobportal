import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import {
    Briefcase,
    Building2,
    Calendar,
    CheckCircle,
    ChevronRight,
    FileText,
    Info,
    MapPin,
    Search,
    Shield,
    Users,
    X,
} from 'lucide-react';
import { PhilippinePeso } from '@/components/icons/philippine-peso';
import { formatSalary } from '@/lib/utils';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { SearchableCategoryDropdown } from '@/components/searchable-category-dropdown';

export type AvailableJob = {
    id: number;
    job_title: string;
    job_description?: string | null;
    job_category: string | null;
    required_qualifications?: string | null;
    location: string | null;
    salary: string | null;
    number_of_vacancies: number | null;
    status: string | null;
    photo: string | null;
    created_at: string | null;
    employer_name?: string | null;
};

const getFeatures = (registerUrl: string) => [
    {
        title: 'Job Search',
        description:
            'Find jobs that match your skills. Use filters, save listings, and apply with one click.',
        icon: Search,
        href: '#browse-jobs',
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
    availableJobs = [],
    categories = [],
}: {
    canRegister?: boolean;
    availableJobs?: AvailableJob[];
    categories?: string[];
}) {
    const { auth } = usePage().props as { auth: { user?: any } };

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedJob, setSelectedJob] = useState<AvailableJob | null>(null);

    // Filter available jobs based on search query and category
    const filteredJobs = availableJobs.filter((job) => {
        const matchesCategory =
            selectedCategory === 'all' ||
            selectedCategory === '' ||
            (job.job_category &&
                job.job_category.toLowerCase() === selectedCategory.toLowerCase());

        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
            !query ||
            job.job_title.toLowerCase().includes(query) ||
            (job.job_category && job.job_category.toLowerCase().includes(query)) ||
            (job.location && job.location.toLowerCase().includes(query)) ||
            (job.job_description && job.job_description.toLowerCase().includes(query)) ||
            (job.required_qualifications &&
                job.required_qualifications.toLowerCase().includes(query)) ||
            (job.employer_name && job.employer_name.toLowerCase().includes(query));

        return matchesCategory && matchesSearch;
    });

    const photoUrl = (photo: string | null) => {
        if (!photo) return null;
        const cleanPath = photo.replace(/(?:uploads\/jobs\/)+jobs\//g, 'uploads/jobs/').replace(/\/+/g, '/');
        return cleanPath.startsWith('http') || cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    };

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
                        <div className="absolute right-[6%] top-[42%] animate-float" style={{ animationDelay: '1s', animationDuration: '10s' }}>
                            <Search className="h-14 w-14 text-slate-500/20" />
                        </div>
                    </div>

                    {/* Nav */}
                    <header className="sticky top-0 z-50 border-b border-[#1a4d2e]/10 bg-[#1a4d2e]/90 backdrop-blur-md">
                        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-6">
                                <Link href="/" className="flex items-center gap-2">
                                    <Briefcase className="h-6 w-6 text-[#d4af37]" />
                                    <span className="text-xl font-bold text-white">JobPortal</span>
                                </Link>

                                {/* Header search input on welcome page */}
                                <div className="hidden sm:flex items-center relative w-44 md:w-64">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search jobs in header..."
                                        className="h-8 w-full rounded-lg border border-white/15 bg-white/10 pl-8 pr-7 text-xs text-white placeholder:text-slate-300 focus:bg-white/20 focus:outline-hidden transition-colors"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
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
                        {/* Hero Section */}
                        <section className="flex flex-col items-center pt-12 text-center md:pt-16 lg:pt-20">
                            <div
                                className="mb-8 inline-flex animate-fade-in items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-2 shadow-lg shadow-slate-900/50"
                                style={{ animationDelay: '0ms', animationFillMode: 'both' }}
                            >
                                <span className="text-sm font-medium text-emerald-400">
                                    Job Portal for Job Seekers & Employers
                                </span>
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
                                Search and apply for verified job openings. Explore jobs by category,
                                location, and qualification requirements.
                            </p>

                            {/* Prominent Search Bar with Searchable Category Dropdown beside it */}
                            <div
                                className="mt-8 w-full max-w-3xl rounded-2xl border border-slate-700/80 bg-slate-900/80 p-2.5 shadow-2xl backdrop-blur-md animate-fade-in"
                                style={{ animationDelay: '150ms', animationFillMode: 'both' }}
                            >
                                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                                    {/* Main Search Input */}
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search available jobs by title, skills, location..."
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Searchable Category Dropdown beside the search bar */}
                                    <div className="w-full sm:w-[220px]">
                                        <SearchableCategoryDropdown
                                            categories={categories}
                                            value={selectedCategory}
                                            onChange={(cat) => setSelectedCategory(cat)}
                                            placeholder="All Categories"
                                            allOptionLabel="All Categories"
                                            triggerClassName="py-3 h-auto rounded-xl border-slate-700 bg-slate-800/90 text-white hover:bg-slate-800"
                                        />
                                    </div>

                                    {/* Search / Filter Trigger */}
                                    <a
                                        href="#browse-jobs"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#1a4d2e] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-transform active:scale-95 hover:brightness-110"
                                    >
                                        <Search className="h-4 w-4" />
                                        <span>Find Jobs</span>
                                    </a>
                                </div>
                            </div>
                        </section>

                        {/* Available Jobs Listing Section */}
                        <section id="browse-jobs" className="mt-16 scroll-mt-20">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-emerald-400" />
                                        <h2 className="text-2xl font-bold tracking-tight text-white">
                                            Available Jobs
                                        </h2>
                                        <Badge variant="outline" className="ml-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                            {filteredJobs.length} {filteredJobs.length === 1 ? 'Job Available' : 'Jobs Available'}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Actively open positions accepting applications right now.
                                    </p>
                                </div>

                                {(searchQuery || (selectedCategory !== 'all' && selectedCategory !== '')) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('all');
                                        }}
                                        className="text-xs text-slate-400 hover:text-white"
                                    >
                                        Clear all filters
                                    </Button>
                                )}
                            </div>

                            {/* Job Cards Grid */}
                            {filteredJobs.length === 0 ? (
                                <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 py-16 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                                        <Search className="h-7 w-7" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-white">No available jobs found</h3>
                                    <p className="mt-1 max-w-sm text-sm text-slate-400">
                                        Try adjusting your search terms or select another category from the dropdown above.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4 border-slate-700 bg-slate-800 text-slate-200"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('all');
                                        }}
                                    >
                                        View all available jobs
                                    </Button>
                                </div>
                            ) : (
                                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredJobs.map((job) => (
                                        <div
                                            key={job.id}
                                            className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/20"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        {job.job_category || 'General'}
                                                    </Badge>
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                                                        <CheckCircle className="h-3 w-3" /> Available
                                                    </span>
                                                </div>

                                                <h3 className="mt-3 text-lg font-semibold text-white line-clamp-1" title={job.job_title}>
                                                    {job.job_title}
                                                </h3>

                                                {job.employer_name && (
                                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                                        <span className="truncate">{job.employer_name}</span>
                                                    </p>
                                                )}

                                                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                                                    {job.location && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                                            <span className="truncate">{job.location}</span>
                                                        </div>
                                                    )}
                                                    {job.salary && (
                                                        <div className="flex items-center gap-2">
                                                            <PhilippinePeso className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                            <span>{formatSalary(job.salary)}</span>
                                                        </div>
                                                    )}
                                                    {job.number_of_vacancies && (
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                                            <span>{job.number_of_vacancies} {job.number_of_vacancies === 1 ? 'vacancy' : 'vacancies'}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {job.job_description && (
                                                    <p className="mt-3 text-xs leading-relaxed text-slate-400 line-clamp-2">
                                                        {job.job_description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-5 border-t border-slate-800/80 pt-3">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setSelectedJob(job)}
                                                    className="w-full gap-1.5 border border-slate-700 bg-slate-800/80 text-xs font-semibold text-white hover:bg-slate-700"
                                                >
                                                    <Info className="h-3.5 w-3.5 text-emerald-400" />
                                                    Information about job
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Features Section */}
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

                    {/* Job Details Modal - Information about job */}
                    <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
                        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-slate-700 bg-slate-900 text-white p-0">
                            {selectedJob && (
                                <>
                                    <DialogHeader className="border-b border-slate-800 bg-slate-900/60 p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                        {selectedJob.job_category || 'General'}
                                                    </Badge>
                                                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                                        <CheckCircle className="h-3.5 w-3.5" /> Available Position
                                                    </span>
                                                </div>
                                                <DialogTitle className="mt-2 text-2xl font-bold text-white">
                                                    {selectedJob.job_title}
                                                </DialogTitle>
                                                {selectedJob.employer_name && (
                                                    <DialogDescription className="mt-1 text-sm text-slate-400 flex items-center gap-1.5">
                                                        <Building2 className="h-4 w-4 text-slate-500" />
                                                        Posted by: <span className="text-slate-300 font-medium">{selectedJob.employer_name}</span>
                                                    </DialogDescription>
                                                )}
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <div className="space-y-6 p-6">
                                        {/* Key details highlights */}
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <MapPin className="h-4 w-4 text-emerald-400" />
                                                    <span>Location</span>
                                                </div>
                                                <p className="mt-1 font-semibold text-white text-sm">
                                                    {selectedJob.location || '—'}
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <PhilippinePeso className="h-4 w-4 text-emerald-400" />
                                                    <span>Salary</span>
                                                </div>
                                                <p className="mt-1 font-semibold text-white text-sm">
                                                    {formatSalary(selectedJob.salary, 'Negotiable')}
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Users className="h-4 w-4 text-emerald-400" />
                                                    <span>Vacancies</span>
                                                </div>
                                                <p className="mt-1 font-semibold text-white text-sm">
                                                    {selectedJob.number_of_vacancies ?? 1} opening(s)
                                                </p>
                                            </div>
                                        </div>

                                        {/* Job Description */}
                                        <div>
                                            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
                                                <FileText className="h-4 w-4 text-emerald-400" />
                                                Job Description
                                            </h4>
                                            <div className="mt-2.5 rounded-xl border border-slate-800 bg-slate-800/30 p-4">
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                                                    {selectedJob.job_description || 'No description provided.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Required Qualifications */}
                                        <div>
                                            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
                                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                                                Required Qualifications
                                            </h4>
                                            <div className="mt-2.5 rounded-xl border border-slate-800 bg-slate-800/30 p-4">
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                                                    {selectedJob.required_qualifications || 'No specific qualifications listed.'}
                                                </p>
                                            </div>
                                        </div>

                                        {selectedJob.created_at && (
                                            <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Posted on {new Date(selectedJob.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        )}
                                    </div>

                                    <DialogFooter className="border-t border-slate-800 bg-slate-900/60 p-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setSelectedJob(null)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            Close
                                        </Button>
                                        {auth.user ? (
                                            <Link
                                                href={dashboard()}
                                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500"
                                            >
                                                Apply from Dashboard
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        ) : (
                                            <Link
                                                href={register()}
                                                className="inline-flex items-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-[#1a4d2e] shadow hover:bg-[#e5c158]"
                                            >
                                                Register & Apply Now
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        )}
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>

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
            `}</style>
        </>
    );
}
