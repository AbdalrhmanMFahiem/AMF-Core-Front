import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, Location } from '@angular/common';
import { SidebarService } from '../../shared/services/sidebar.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sidebarService = inject(SidebarService);
  
  countdown: number = 5;
  private timer: any;
  attemptedUrl: string = '';
  pageTranslationKey: string | null = null;
  pageName: string | null = null;

  ngOnInit(): void {
    this.attemptedUrl = this.route.snapshot.queryParams['attemptedUrl'] || '';
    
    if (this.attemptedUrl) {
      this.findPageName(this.attemptedUrl);
    }
    
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.timer);
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  private findPageName(url: string) {
    const allItems = [...this.sidebarService.navItems, ...this.sidebarService.othersItems];
    
    // Helper function to search recursively
    const searchItems = (items: any[]) => {
      for (const item of items) {
        if (item.path && (url === item.path || url.startsWith(item.path + '/'))) {
          this.pageTranslationKey = item.translationKey || null;
          this.pageName = item.name || null;
          return true;
        }
        if (item.subItems) {
          if (searchItems(item.subItems)) return true;
        }
      }
      return false;
    };
    
    searchItems(allItems);
  }

  goBack(): void {
    const location = inject(Location);
    location.back();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
