import { Component } from '@angular/core';
import { GridShapeComponent } from '../../components/common/grid-shape/grid-shape.component';
import { RouterModule } from '@angular/router';
import { ThemeToggleTwoComponent } from '../../components/common/theme-toggle-two/theme-toggle-two.component';
import { LanguageDropdownComponent } from '../../components/header/language-dropdown/language-dropdown.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-auth-page-layout',
  imports: [
    GridShapeComponent,
    RouterModule,
    ThemeToggleTwoComponent,
    LanguageDropdownComponent,
    TranslateModule
  ],
  templateUrl: './auth-page-layout.component.html',
  styles: ``
})
export class AuthPageLayoutComponent {

}
