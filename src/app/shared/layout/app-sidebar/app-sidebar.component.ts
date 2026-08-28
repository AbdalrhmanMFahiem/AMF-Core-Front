import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { SearchHighlightPipe } from '../../pipe/search-highlight.pipe';
import { SidebarWidgetComponent } from './app-sidebar-widget.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { NavItem, SidebarService } from '../../services/sidebar.service';
import { SearchResult, getSearchScore, getFlatRoutesWithBreadcrumb } from '../../utils/arabic-search.utils';
import { PermissionsService } from '../../../core/services/permissions.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    SafeHtmlPipe,
    SearchHighlightPipe,
    SidebarWidgetComponent,
    TranslateModule
  ],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent implements OnInit, OnDestroy {

  navItems: NavItem[] = [];
  othersItems: NavItem[] = [];

  openSubmenu: string | null = null;
  openNestedSubmenu: string | null = null;

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();

  // Hover debounce
  private hoverEnterTimer: any = null;
  private hoverLeaveTimer: any = null;
  private readonly HOVER_ENTER_DELAY = 150;
  private readonly HOVER_LEAVE_DELAY = 300;

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private permissionsService: PermissionsService,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
    this.navItems = this.sidebarService.navItems;
    this.othersItems = this.sidebarService.othersItems;
  }

  searchQuery = '';
  showDropdown = false;
  searchResults: SearchResult[] = [];
  private flatRoutes: SearchResult[] = [];
  @ViewChildren('searchInput') searchInput!: QueryList<ElementRef>;

  onSearch(event: any) {
    const query = event.target.value || '';
    this.searchQuery = query;
    if (!query.trim()) {
      this.showDropdown = false;
      this.searchResults = [];
      return;
    }
    
    // Score and sort results
    this.searchResults = this.flatRoutes
      .map(route => ({
        ...route,
        matchScore: getSearchScore(route, query, this.translateService)
      }))
      .filter(route => route.matchScore! > 0)
      .sort((a, b) => b.matchScore! - a.matchScore!)
      .slice(0, 10);
    
    this.showDropdown = true;
  }

  closeDropdown() {
    setTimeout(() => { this.showDropdown = false; }, 200);
  }

  goToRoute(path: string) {
    this.router.navigate([path]);
    this.showDropdown = false;
    this.searchQuery = '';
    const input = this.searchInput?.first?.nativeElement;
    if (input) {
      input.value = '';
      input.blur();
    }
    this.sidebarService.setMobileOpen(false);
  }

  hasPermission(key?: string): boolean {
    if (!key) return true;
    return this.permissionsService.hasPermission(key);
  }

  isItemVisible(item?: { systemAdminOnly?: boolean }): boolean {
    if (!item) return true;
    if (item.systemAdminOnly) {
      return this.authService.isSystemAdmin();
    }
    return true;
  }

  ngOnInit() {
    const isSysAdmin = this.authService.isSystemAdmin();
    const filterAdminOnly = (items: NavItem[]): NavItem[] => {
      if (isSysAdmin) return items;
      return items
        .filter(item => !item.systemAdminOnly)
        .map(item => ({
          ...item,
          subItems: item.subItems 
            ? item.subItems
                .filter(sub => !sub.systemAdminOnly)
                .map(sub => ({
                  ...sub,
                  subItems: sub.subItems ? sub.subItems.filter(nested => !nested.systemAdminOnly) : undefined
                }))
            : undefined
        }));
    };

    const visibleNavItems = filterAdminOnly(this.navItems);
    const visibleOthersItems = filterAdminOnly(this.othersItems);

    this.flatRoutes = getFlatRoutesWithBreadcrumb(
      [...visibleNavItems, ...visibleOthersItems],
      this.translateService
    );

    // Initial active menu setup
    this.setActiveMenuFromRoute(this.router.url);

    // Subscribe to router events
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    // Clear any pending debounce timers
    if (this.hoverEnterTimer) clearTimeout(this.hoverEnterTimer);
    if (this.hoverLeaveTimer) clearTimeout(this.hoverLeaveTimer);
  }

  isActive(path: string): boolean {
    if (path === '/') {
      return this.router.url === path;
    }
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;
    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.openNestedSubmenu = null;
    } else {
      this.openSubmenu = key;
      this.openNestedSubmenu = null;
    }
  }

  toggleNestedSubmenu(section: string, index: number, nestedIndex: number) {
    const key = `${section}-${index}-${nestedIndex}`;
    if (this.openNestedSubmenu === key) {
      this.openNestedSubmenu = null;
    } else {
      this.openNestedSubmenu = key;
    }
  }

  onSidebarMouseEnter() {
    if (this.hoverLeaveTimer) {
      clearTimeout(this.hoverLeaveTimer);
      this.hoverLeaveTimer = null;
    }
    if (!this.sidebarService.isExpandedValue) {
      this.hoverEnterTimer = setTimeout(() => {
        this.sidebarService.setHovered(true);
      }, this.HOVER_ENTER_DELAY);
    }
  }

  onSidebarMouseLeave() {
    if (this.hoverEnterTimer) {
      clearTimeout(this.hoverEnterTimer);
      this.hoverEnterTimer = null;
    }
    this.hoverLeaveTimer = setTimeout(() => {
      this.sidebarService.setHovered(false);
    }, this.HOVER_LEAVE_DELAY);
  }

  getTooltip(nav: NavItem): string {
    if (this.sidebarService.isExpandedValue || this.sidebarService.isHoveredValue || this.sidebarService.isMobileOpenValue) {
      return '';
    }
    if (nav.translationKey) {
      return this.translateService.instant(nav.translationKey) || nav.name;
    }
    return nav.name;
  }

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [
      { items: this.navItems, prefix: 'main' },
      { items: this.othersItems, prefix: 'others' },
    ];

    menuGroups.forEach(group => {
      group.items.forEach((nav, i) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem, j) => {
            if (subItem.subItems) {
              subItem.subItems.forEach((nestedItem: any) => {
                if (currentUrl === nestedItem.path || (nestedItem.path !== '/' && currentUrl.startsWith(nestedItem.path + '/'))) {
                  this.openSubmenu = `${group.prefix}-${i}`;
                  this.openNestedSubmenu = `${group.prefix}-${i}-${j}`;
                }
              });
            } else {
              if (currentUrl === subItem.path || (subItem.path !== '/' && currentUrl.startsWith(subItem.path! + '/'))) {
                this.openSubmenu = `${group.prefix}-${i}`;
              }
            }
          });
        }
      });
    });
  }

  onSubmenuClick() {
    if (this.sidebarService.isMobileOpenValue) {
      this.sidebarService.setMobileOpen(false);
    }
  }

}
