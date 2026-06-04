import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ItemPropertyService } from '../../../../core/services/item-property.service';
import { ToastrService } from 'ngx-toastr';
import { ItemPropertyRequest } from '../../../../core/models/item-property.model';

@Component({
  selector: 'app-item-property-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ComponentCardComponent, PageBreadcrumbComponent],
  templateUrl: './item-property-form.component.html',
  styles: ``
})
export class ItemPropertyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly itemPropertyService = inject(ItemPropertyService);
  private readonly toastr = inject(ToastrService);

  form!: FormGroup;
  id: number = 0;
  isEditMode: boolean = false;
  isView: boolean = false;
  isSaving: boolean = false;

  get isEdit(): boolean {
    return this.isEditMode;
  }

  get pageTitle(): string {
    if (this.isView) return 'Pages.ItemProperties.ViewTitle';
    if (this.isEdit) return 'Pages.ItemProperties.EditTitle';
    return 'Pages.ItemProperties.AddTitle';
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
    const path = this.route.snapshot.url[0]?.path;
    this.isView = path === 'view';
    this.isEditMode = path === 'edit';
    
    if (this.isEditMode || this.isView) {
      this.id = Number(this.route.snapshot.paramMap.get('id'));
      if (this.id) {
        this.loadData();
      }
    } else {
      this.loadNextCode();
    }
  }

  private loadNextCode(): void {
    this.itemPropertyService.getNextCode().subscribe({
      next: (res) => {
        this.form.patchValue({ code: res.nextCode });
      },
      error: (err) => console.error('Failed to load next code', err)
    });
  }

  private loadData(): void {
    this.itemPropertyService.get(this.id).subscribe({
      next: (res) => {
        this.form.patchValue({
          id: res.id,
          code: res.code,
          aName: res.aName,
          eName: res.eName,
          notes: res.notes
        });
      },
      error: (err) => {
        this.toastr.error('Failed to load property details', 'Error');
        this.router.navigate(['/dashboard/inventory/item-properties']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isView) return;

    this.isSaving = true;
    const request: ItemPropertyRequest = this.form.getRawValue();

    if (this.isEditMode) {
      this.itemPropertyService.update(this.id, request).subscribe({
        next: () => {
          this.toastr.success('Property updated successfully', 'Success');
          this.router.navigate(['/dashboard/inventory/item-properties']);
        },
        error: (err) => {
          this.toastr.error('Failed to update property', 'Error');
          this.isSaving = false;
        }
      });
    } else {
      this.itemPropertyService.add(request).subscribe({
        next: () => {
          this.toastr.success('Property added successfully', 'Success');
          this.router.navigate(['/dashboard/inventory/item-properties']);
        },
        error: (err) => {
          this.toastr.error('Failed to add property', 'Error');
          this.isSaving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/inventory/item-properties']);
  }
}
