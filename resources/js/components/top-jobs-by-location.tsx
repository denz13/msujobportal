import {
    Briefcase,
    Building2,
    CheckCircle2,
    Filter,
    MapPin,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { PhilippinePeso } from '@/components/icons/philippine-peso';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatSalary } from '@/lib/utils';

export type TopJobItem = {
    id: number;
    job_title: string;
    job_category: string;
    location: string;
    salary: string;
    number_of_vacancies: number;
    status: string;
    applications_count: number;
    employer_name?: string;
    created_at?: string;
};

export type LocationStat = {
    location: string;
    total_jobs: number;
    total_vacancies: number;
};

type Props = {
    jobs: TopJobItem[];
    locations: LocationStat[];
    showEmployer?: boolean;
    title?: string;
    subtitle?: string;
};

export function TopJobsByLocation({
    jobs = [],
    locations = [],
    showEmployer = false,
    title = 'Top 10 Jobs by Location',
    subtitle = 'Most in-demand job postings ranked across key employment locations',
}: Props) {
    const [selectedLocation, setSelectedLocation] = useState<string>('all');

    // Extract unique sorted location options
    const locationOptions = useMemo(() => {
        const set = new Set<string>();
        locations.forEach((l) => set.add(l.location));
        jobs.forEach((j) => set.add(j.location));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [locations, jobs]);

    // Filter jobs based on selected location
    const filteredJobs = useMemo(() => {
        let list = jobs;
        if (selectedLocation !== 'all' && selectedLocation !== '') {
            list = jobs.filter(
                (j) => j.location.toLowerCase() === selectedLocation.toLowerCase()
            );
        }
        return list.slice(0, 10);
    }, [jobs, selectedLocation]);

    const getRankBadgeClass = (rank: number) => {
        if (rank === 1) return 'bg-amber-400 text-amber-950 font-bold border-amber-500 shadow-xs';
        if (rank === 2) return 'bg-slate-300 text-slate-900 font-bold border-slate-400';
        if (rank === 3) return 'bg-amber-700/20 text-amber-800 dark:text-amber-300 font-bold border-amber-600/40';
        return 'bg-muted text-muted-foreground font-medium';
    };

    return (
        <Card className="overflow-hidden border border-border shadow-xs">
            <CardHeader className="border-b border-border/70 bg-muted/20 px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <MapPin className="h-4 w-4" />
                            </span>
                            {title}
                        </CardTitle>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {subtitle}
                        </p>
                    </div>

                    {/* Location Filter Dropdown */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:inline" />
                        <Select
                            value={selectedLocation}
                            onValueChange={setSelectedLocation}
                        >
                            <SelectTrigger className="h-8 text-xs w-full sm:w-[210px] bg-background">
                                <SelectValue placeholder="All Locations" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations ({jobs.length} jobs)</SelectItem>
                                {locationOptions.map((loc) => (
                                    <SelectItem key={loc} value={loc}>
                                        {loc}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Top Locations Quick Filter Chips */}
                {locations.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Top Hubs:
                        </span>
                        <Button
                            type="button"
                            variant={selectedLocation === 'all' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedLocation('all')}
                            className="h-6 px-2 text-[11px] rounded-full"
                        >
                            All ({jobs.length})
                        </Button>
                        {locations.slice(0, 6).map((loc) => {
                            const isSelected = selectedLocation.toLowerCase() === loc.location.toLowerCase();
                            return (
                                <button
                                    key={loc.location}
                                    type="button"
                                    onClick={() => setSelectedLocation(isSelected ? 'all' : loc.location)}
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                                        isSelected
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <MapPin className="h-3 w-3" />
                                    <span>{loc.location}</span>
                                    <span className="opacity-70">({loc.total_jobs})</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0">
                {filteredJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <MapPin className="h-10 w-10 text-muted-foreground/40 mb-2" />
                        <p className="text-sm font-medium">No job postings found for this location</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Try selecting "All Locations" or add new job openings with locations.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                                    <th className="py-2.5 px-3 text-center w-12">Rank</th>
                                    <th className="py-2.5 px-3">Job Title & Category</th>
                                    <th className="py-2.5 px-3">Location</th>
                                    {showEmployer && <th className="py-2.5 px-3">Employer</th>}
                                    <th className="py-2.5 px-3">Vacancies</th>
                                    <th className="py-2.5 px-3">Salary</th>
                                    <th className="py-2.5 px-3 text-center">Applicants</th>
                                    <th className="py-2.5 px-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredJobs.map((job, idx) => (
                                    <tr
                                        key={job.id}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="py-2.5 px-3 text-center">
                                            <span
                                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs border ${getRankBadgeClass(
                                                    idx + 1
                                                )}`}
                                            >
                                                #{idx + 1}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 font-semibold text-foreground">
                                            <div className="flex flex-col">
                                                <span className="text-sm">{job.job_title}</span>
                                                <span className="text-[11px] font-normal text-muted-foreground">
                                                    {job.job_category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span>{job.location}</span>
                                            </div>
                                        </td>
                                        {showEmployer && (
                                            <td className="py-2.5 px-3 text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    <span className="truncate max-w-[140px]">
                                                        {job.employer_name || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="py-2.5 px-3">
                                            <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 font-medium">
                                                {job.number_of_vacancies}{' '}
                                                {job.number_of_vacancies === 1 ? 'opening' : 'openings'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <PhilippinePeso className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span>{formatSalary(job.salary, 'Negotiable')}</span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Badge
                                                variant="secondary"
                                                className="font-semibold text-xs gap-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                            >
                                                <Users className="h-3 w-3" />
                                                {job.applications_count}
                                            </Badge>
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                                    job.status === 'active' || job.status === 'approved'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {job.status === 'active' ? 'Available' : job.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

