import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { LogOut, User as UserIcon } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import type { User } from '@/types';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    const role = user.role as string | undefined;
    const roleDisplay = role
        ? role.charAt(0).toUpperCase() + role.slice(1)
        : 'All';

    const performLogout = () => {
        setIsLogoutDialogOpen(false);
        cleanup();
        router.post(logout().url, {}, {
            onFinish: () => {
                router.flushAll();
            }
        });
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <UserIcon className="mr-2" />
                        Profile
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                onSelect={(e) => {
                    e.preventDefault();
                    setIsLogoutDialogOpen(true);
                }}
                data-test="logout-button"
            >
                <LogOut className="mr-2" />
                Log out
            </DropdownMenuItem>

            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Are you sure you want to logout from the {roleDisplay} Portal?</DialogTitle>
                        <DialogDescription>
                            You will need to sign back in to access your account.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsLogoutDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={performLogout}>
                            Log out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

