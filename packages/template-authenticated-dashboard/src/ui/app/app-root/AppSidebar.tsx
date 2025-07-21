import * as React from 'react';

import { LanguageToggle } from '../../components/language-toggle/LanguageToggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '../../components/sidebar';
import { ThemeToggle } from '../../components/theme-toggle/ThemeToggle';

import { AppUser } from './AppUser';

const SidebarToggles = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarToggles />
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarFooter>
        <AppUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
