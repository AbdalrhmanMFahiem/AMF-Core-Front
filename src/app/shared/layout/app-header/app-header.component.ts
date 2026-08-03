import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { SidebarService, NavItem } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeToggleButtonComponent } from '../../components/common/theme-toggle/theme-toggle-button.component';
import { NotificationDropdownComponent } from '../../components/header/notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from '../../components/header/user-dropdown/user-dropdown.component';
import { LanguageDropdownComponent } from '../../components/header/language-dropdown/language-dropdown.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    ThemeToggleButtonComponent,
    NotificationDropdownComponent,
    LanguageDropdownComponent,
    UserDropdownComponent,
    TranslateModule,
    SafeHtmlPipe
  ],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent implements OnInit {
  isApplicationMenuOpen = false;
  readonly isMobileOpen$;
  
  searchQuery = '';
  showDropdown = false;
  searchResults: NavItem[] = [];
  private flatRoutes: NavItem[] = [];

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    public sidebarService: SidebarService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  ngOnInit() {
    this.flatRoutes = this.getFlatRoutes([...this.sidebarService.navItems, ...this.sidebarService.othersItems]);
  }

  private getFlatRoutes(items: NavItem[], parentIcon?: string): NavItem[] {
    let result: NavItem[] = [];
    for (const item of items) {
      const currentIcon = item.icon || parentIcon;
      if (item.path) {
        result.push({ ...item, icon: currentIcon });
      }
      if (item.subItems) {
        result = [...result, ...this.getFlatRoutes(item.subItems, currentIcon)];
      }
    }
    return result;
  }

  onSearch(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.searchQuery = query;
    if (!query) {
      this.showDropdown = false;
      this.searchResults = [];
      return;
    }
    
    this.searchResults = this.flatRoutes.filter(route => {
      const nameMatch = route.name?.toLowerCase().includes(query);
      const translatedName = route.translationKey ? this.translateService.instant(route.translationKey)?.toLowerCase() : '';
      const translationMatch = translatedName.includes(query);
      return nameMatch || translationMatch;
    }).slice(0, 8); // max 8 results
    
    this.showDropdown = true;
  }

  closeDropdown() {
    setTimeout(() => { this.showDropdown = false; }, 200);
  }

  goToRoute(path: string) {
    this.router.navigate([path]);
    this.showDropdown = false;
    this.searchQuery = '';
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
      this.searchInput.nativeElement.blur();
    }
  }

  handleToggle() {
    if (window.innerWidth >= 1280) {
      this.sidebarService.toggleExpanded();
    } else {
      this.sidebarService.toggleMobileOpen();
    }
  }

  toggleApplicationMenu() {
    this.isApplicationMenuOpen = !this.isApplicationMenuOpen;
  }

  ngAfterViewInit() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  };
}
