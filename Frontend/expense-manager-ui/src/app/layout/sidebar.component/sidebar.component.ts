import { Component, input, output, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  toggleSidebar = output<void>();

  auth = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Dashboard',     icon: 'dashboard',           route: '/dashboard'    },
    { label: 'Transactions',  icon: 'swap_horiz',          route: '/transactions' },
    { label: 'Budgets',       icon: 'account_balance',     route: '/budgets'      },
    { label: 'Categories',    icon: 'category',            route: '/categories'   },
    { label: 'Savings Goals', icon: 'savings',             route: '/savings'      },
  ];

  userInitials = computed(() => {
    const name = this.auth.currentUser()?.fullName ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  });
}
