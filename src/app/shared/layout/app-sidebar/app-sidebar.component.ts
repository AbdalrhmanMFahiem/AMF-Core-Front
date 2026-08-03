import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { SidebarWidgetComponent } from './app-sidebar-widget.component';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';

import { NavItem, SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    SafeHtmlPipe,
    SidebarWidgetComponent,
    TranslateModule
  ],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent {

  navItems: NavItem[] = [];
  othersItems: NavItem[] = [];

  openSubmenu: string | null = null;
  openNestedSubmenu: string | null = null;
  subMenuHeights: { [key: string]: number } = {};
  @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
    this.navItems = this.sidebarService.navItems;
    this.othersItems = this.sidebarService.othersItems;
  }

  ngOnInit() {
    // Initial active menu setup
    setTimeout(() => {
      this.setActiveMenuFromRoute(this.router.url);
    }, 100);

    // Subscribe to router events
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    // Subscribe to combined observables to close submenus when all are false
    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(
        ([isExpanded, isMobileOpen, isHovered]) => {
          if (!isExpanded && !isMobileOpen && !isHovered) {
            // this.openSubmenu = null;
            // this.savedSubMenuHeights = { ...this.subMenuHeights };
            // this.subMenuHeights = {};
            this.cdr.detectChanges();
          } else {
            // Restore saved heights when reopening
            // this.subMenuHeights = { ...this.savedSubMenuHeights };
            // this.cdr.detectChanges();
          }
        }
      )
    );

    // Initial load
    this.setActiveMenuFromRoute(this.router.url);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscription.unsubscribe();
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
      this.openNestedSubmenu = null; // Close nested when main closes
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges(); // Ensure UI updates
        }
      });
    }
  }

  toggleNestedSubmenu(section: string, index: number, nestedIndex: number) {
    const key = `${section}-${index}-${nestedIndex}`;
    const parentKey = `${section}-${index}`;

    if (this.openNestedSubmenu === key) {
      const el = document.getElementById(key);
      const childHeight = el ? el.scrollHeight : 0;

      this.openNestedSubmenu = null;
      this.subMenuHeights[key] = 0;

      const parentEl = document.getElementById(parentKey);
      if (parentEl) {
        this.subMenuHeights[parentKey] = Math.max(0, parentEl.scrollHeight - childHeight);
      }
    } else {
      let prevChildHeight = 0;
      if (this.openNestedSubmenu && this.openNestedSubmenu.startsWith(`${section}-${index}-`)) {
        const prevEl = document.getElementById(this.openNestedSubmenu);
        if (prevEl) prevChildHeight = prevEl.scrollHeight;
        this.subMenuHeights[this.openNestedSubmenu] = 0;
      } else if (this.openNestedSubmenu) {
        this.subMenuHeights[this.openNestedSubmenu] = 0;
      }

      this.openNestedSubmenu = key;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          const childHeight = el.scrollHeight;
          this.subMenuHeights[key] = childHeight;

          const parentEl = document.getElementById(parentKey);
          if (parentEl) {
            const baseHeight = parentEl.scrollHeight - prevChildHeight;
            this.subMenuHeights[parentKey] = baseHeight + childHeight;
          }
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSidebarMouseEnter() {
    this.isExpanded$.subscribe(expanded => {
      if (!expanded) {
        this.sidebarService.setHovered(true);
      }
    }).unsubscribe();
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
            // Check for nested subItems
            if (subItem.subItems) {
              subItem.subItems.forEach((nestedItem: any) => {
                if (currentUrl === nestedItem.path || (nestedItem.path !== '/' && currentUrl.startsWith(nestedItem.path + '/'))) {
                  const parentKey = `${group.prefix}-${i}`;
                  const nestedKey = `${group.prefix}-${i}-${j}`;

                  if (this.openSubmenu === parentKey && this.openNestedSubmenu === nestedKey) {
                    return;
                  }

                  let prevChildHeight = 0;
                  if (this.openNestedSubmenu && this.openNestedSubmenu.startsWith(`${group.prefix}-${i}-`)) {
                    const prevEl = document.getElementById(this.openNestedSubmenu);
                    if (prevEl) prevChildHeight = prevEl.scrollHeight;
                  }
                  if (this.openNestedSubmenu) {
                    this.subMenuHeights[this.openNestedSubmenu] = 0;
                  }

                  this.openSubmenu = parentKey;
                  this.openNestedSubmenu = nestedKey;

                  setTimeout(() => {
                    const nestedEl = document.getElementById(nestedKey);
                    let nestedHeight = 0;
                    if (nestedEl) {
                      nestedHeight = nestedEl.scrollHeight;
                      this.subMenuHeights[nestedKey] = nestedHeight;
                    }
                    const parentEl = document.getElementById(parentKey);
                    if (parentEl) {
                      const baseHeight = parentEl.scrollHeight - prevChildHeight;
                      this.subMenuHeights[parentKey] = baseHeight + nestedHeight;
                    }
                    this.cdr.detectChanges();
                  });
                }
              });
            } else {
              if (currentUrl === subItem.path || (subItem.path !== '/' && currentUrl.startsWith(subItem.path! + '/'))) {
                const key = `${group.prefix}-${i}`;

                if (this.openSubmenu === key && !this.openNestedSubmenu) {
                  return;
                }

                if (this.openNestedSubmenu) {
                  this.subMenuHeights[this.openNestedSubmenu] = 0;
                  this.openNestedSubmenu = null;
                }

                this.openSubmenu = key;

                setTimeout(() => {
                  const el = document.getElementById(key);
                  if (el) {
                    this.subMenuHeights[key] = el.scrollHeight;
                    this.cdr.detectChanges(); // Ensure UI updates
                  }
                });
              }
            }
          });
        }
      });
    });
  }

  onSubmenuClick() {
    // console.log('click submenu');
    this.isMobileOpen$.subscribe(isMobile => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }


}
