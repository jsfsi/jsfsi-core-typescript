import { ChevronsUpDown, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../components/auth/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../../components/sidebar';

export function AppUser() {
  const { t } = useTranslation();
  const { currentUser: user, signOut } = useAuth();
  const { isMobile } = useSidebar();

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    signOut();
  };

  const avatarFallbackText = (user.email ?? t('app.name')).charAt(0).toLocaleUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name ?? undefined} />
                <AvatarFallback className="rounded-lg">{avatarFallbackText}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={
              /* v8 ignore next -- @preserve */
              isMobile ? 'bottom' : 'right'
            }
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar ?? undefined} alt={user.name ?? undefined} />
                  <AvatarFallback className="rounded-lg">{avatarFallbackText}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              {t('appUser.logOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
