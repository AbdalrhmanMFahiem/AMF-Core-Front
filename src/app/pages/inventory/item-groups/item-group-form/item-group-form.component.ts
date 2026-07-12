import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ItemGroupService } from '../../../../core/services/item-group.service';
import { ToastrService } from 'ngx-toastr';
import { ItemGroupRequest } from '../../../../core/models/item-group.model';

@Component({
  selector: 'app-item-group-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ComponentCardComponent, PageBreadcrumbComponent, TranslateModule, SuccessRedirectBannerComponent],
  templateUrl: './item-group-form.component.html',
  styles: ``
})
export class ItemGroupFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly itemGroupService = inject(ItemGroupService);
  private readonly toastr = inject(ToastrService);

  form!: FormGroup;
  id: number = 0;
  isEditMode: boolean = false;
  isView: boolean = false;
  isSaving: boolean = false;
  loading: boolean = false;
  showSuccessBanner: boolean = false;

  get isEdit(): boolean {
    return this.isEditMode;
  }

  get pageTitle(): string {
    if (this.isView) return 'pages.ItemGroups.ViewTitle';
    if (this.isEdit) return 'pages.ItemGroups.EditTitle';
    return 'pages.ItemGroups.AddTitle';
  }

  ngOnInit(): void {
    this.initForm();
    this.checkMode();
  }

  private initForm(): void {
    this.form = this.fb.group({
      id: [0],
      code: ['', Validators.required],
      aName: ['', Validators.required],
      eName: [''],
      notes: ['']
    });
  }

  private checkMode(): void {
    const url = this.router.url;
    this.isView = url.includes('/view/');
    this.isEditMode = url.includes('/edit/');
    
    if (this.isEditMode || this.isView) {
      this.id = Number(this.route.snapshot.paramMap.get('id'));
      if (this.id) {
        this.loading = true;
        this.loadData();
      }
    } else {
      this.loadNextCode();
    }
  }

  private loadNextCode(): void {
    this.itemGroupService.getNextCode().subscribe({
      next: (res) => {
        this.form.patchValue({ code: res.nextCode });
      },
      error: (err) => console.error('Failed to load next code', err)
    });
  }

  private loadData(): void {
    this.itemGroupService.get(this.id).subscribe({
      next: (res) => {
        this.form.patchValue({
          id: res.id,
          code: res.code,
          aName: res.aName,
          eName: res.eName,
          notes: res.notes
        });
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load item group details', 'Error');
        this.loading = false;
        this.router.navigate(['/inventory/item-groups']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isView) return;

    this.isSaving = true;
    const request: ItemGroupRequest = this.form.getRawValue();

    if (this.isEditMode) {
      this.itemGroupService.update(this.id, request).subscribe({
        next: () => {
          this.isSaving = false;
          this.showSuccessBanner = true;
        },
        error: (err) => {
          this.toastr.error('Failed to update item group', 'Error');
          this.isSaving = false;
        }
      });
    } else {
      this.itemGroupService.add(request).subscribe({
        next: () => {
          this.toastr.success('Item group added successfully', 'Success');
          this.router.navigate(['/inventory/item-groups']);
        },
        error: (err) => {
          this.toastr.error('Failed to add item group', 'Error');
          this.isSaving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/inventory/item-groups']);
  }
}
