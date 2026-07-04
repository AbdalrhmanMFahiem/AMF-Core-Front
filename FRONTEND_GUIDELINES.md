# 📋 AMFCore Frontend Guidelines

> **⚠️ MANDATORY: This file MUST be read before executing ANY frontend task.**
> Before writing code, creating components, or modifying screens — refer to this document first.

---

## 📑 Table of Contents

- [1. Translation / i18n System](#1-translation--i18n-system)
- [2. Dark Mode & Light Mode](#2-dark-mode--light-mode)
- [3. Date Picker Component](#3-date-picker-component)
- [4. Searchable Select (Dropdown) Component](#4-searchable-select-dropdown-component)
- [5. Breadcrumb Component](#5-breadcrumb-component)
- [6. Popup / Modal Component](#6-popup--modal-component)
- [7. CRUD Screen Pattern (Full Workflow)](#7-crud-screen-pattern-full-workflow)
- [8. CrudListComponent — Advanced Features](#8-crudlistcomponent--advanced-features)
- [9. Shared Components Reference](#9-shared-components-reference)
- [10. Core Models & Interfaces](#10-core-models--interfaces)
- [11. Service Layer Pattern](#11-service-layer-pattern)
- [12. LookupService API Reference](#12-lookupservice-api-reference)
- [13. Routing Conventions](#13-routing-conventions)
- [14. Sidebar Menu Registration](#14-sidebar-menu-registration)
- [15. Form Patterns & Validation](#15-form-patterns--validation)
- [16. Unsaved Changes Guard](#16-unsaved-changes-guard)
- [17. Confirmation Dialogs & Toasts](#17-confirmation-dialogs--toasts)
- [18. Styling Conventions](#18-styling-conventions)
- [19. Performance Optimization](#19-performance-optimization)
- [20. Clean Architecture — Frontend Alignment](#20-clean-architecture--frontend-alignment)

---

## 1. Translation / i18n System

### Overview

The application uses `@ngx-translate/core` and `@ngx-translate/http-loader` for translations. Translation files are located in:

```
AMFCore-Front-Temp/public/
├── ar.json    (Arabic translations)
└── en.json    (English translations)
```

### ⚠️ CRITICAL RULES

1. **NEVER hardcode text.** Every visible string MUST use a translation key.
2. **ALWAYS add translation keys to BOTH `ar.json` AND `en.json` simultaneously.**
3. **Follow the existing key structure.** Use nested keys grouped by feature/page.
4. In templates, use the `translate` pipe: `{{ 'key.path' | translate }}`
5. In TypeScript, inject `TranslateService` and use `this.translate.instant('key.path')`
6. **Reuse existing `Common.*`, `crud.*`, `common.*`, `validation.*`, `errors.*`, and `lookups.*` keys wherever possible.** Do NOT create duplicate translations.

### Existing Reusable Translation Keys

Before creating new keys, check if these already cover your need:

#### Common Keys (`Common` / `common`)

| Key | Arabic | English | Usage |
|-----|--------|---------|-------|
| `Common.All` | الكل | All | Filter option |
| `Common.ErrorTitle` | الرجاء إصلاح الأخطاء التالية | Please fix the following errors | Error banner title |
| `Common.Code` | الكود | Code | Field label |
| `Common.Name` | الاسم | Name | Field label |
| `Common.Notes` | ملاحظات | Notes | Field label |
| `Common.Status` | الحالة | Status | Column header |
| `Common.Actions` | الإجراءات | Actions | Column header |
| `Common.Active` | نشط | Active | Status badge |
| `Common.Inactive` | غير نشط | Inactive | Status badge |
| `Common.Showing` | عرض | Showing | Pagination |
| `Common.Of` | من | of | Pagination |
| `Common.date` | التاريخ | Date | Date label |
| `Common.from` | من | From | Range filter |
| `Common.to` | إلى | To | Range filter |
| `Common.selectDate` | اختر التاريخ | Select Date | Date picker placeholder |
| `Common.Search` | بحث | Search | Search button |
| `Common.customer` | العميل | Customer | Partner type |
| `Common.vendor` | المورد | Vendor | Partner type |
| `Common.Entries` | سجل | Entries | Pagination |
| `Common.Previous` | السابق | Previous | Pagination |
| `Common.Next` | التالي | Next | Pagination |
| `Common.Page` | صفحة | Page | Pagination |
| `Common.NoRecordsFound` | لا توجد سجلات. | No records found. | Empty state |
| `Common.View` | عرض | View | Action |
| `Common.Edit` | تعديل | Edit | Action |
| `Common.ToggleStatus` | تغيير الحالة | Toggle Status | Action |
| `Common.SearchPlaceholder` | بحث... | Search... | Search input |
| `Common.Home` | الرئيسية | Home | Breadcrumb |
| `Common.Add` | إضافة | Add | Button |
| `Common.Cancel` | إلغاء | Cancel | Button |
| `Common.Save` | حفظ | Save | Button |
| `Common.IncludeDisabled` | عرض غير نشط | Include Disabled | Toggle |
| `Common.ID` | الرقم التعريفي | ID | Field |
| `Common.ArabicName` | الاسم العربي | Arabic Name | Field |
| `Common.EnglishName` | الاسم الإنجليزي | English Name | Field |
| `Common.Back` | رجوع | Back | Button |
| `Common.Saving` | جاري الحفظ... | Saving... | Loading state |
| `Common.CopyCode` | نسخ الكود | Copy Code | Context menu |
| `Common.CopyId` | نسخ المُعرف | Copy Id | Context menu |
| `Common.StayHere` | البقاء هنا | Stay Here | After save redirect |
| `Common.BackToList` | الرجوع للقائمة | Back to List | After save redirect |
| `Common.RedirectingIn` | سيتم الرجوع للقائمة الرئيسية خلال {{seconds}} ثواني... | Redirecting to list in {{seconds}} seconds... | After save redirect |
| `Common.Success` | تم بنجاح | Success | Toast |
| `Common.SavedSuccessfully` | تم الحفظ بنجاح | Saved successfully | Toast |
| `Common.UpdatedSuccessfully` | تم التحديث بنجاح | Updated successfully | Toast |
| `Common.Select` | إختر | Select | Dropdown placeholder |
| `Common.unsavedChangesMessage` | لديك تغييرات غير محفوظة... | You have unsaved changes... | Guard confirmation |
| `Common.confirm` | تأكيد | Confirm | Button |
| `Common.loading` | جاري التحميل... | Loading... | Loading state |

#### Validation / Errors / CRUD / Lookups — Reusable Keys

| Group | Key | Arabic | English |
|-------|-----|--------|---------|
| `validation` | `validation.required` | هذا الحقل مطلوب | This field is required |
| `validation` | `validation.min` | القيمة يجب أن تكون أكبر من أو تساوي {{min}} | Value must be >= {{min}} |
| `validation` | `validation.max` | القيمة يجب أن تكون أقل من أو تساوي {{max}} | Value must be <= {{max}} |
| `validation` | `validation.invalid` | القيمة غير صالحة | Invalid value |
| `errors` | `errors.generic` | حدث خطأ غير متوقع... | An unexpected error occurred... |
| `errors` | `errors.conflict` | البيانات المدخلة تتعارض مع سجلات موجودة | Data conflicts with existing records |
| `common` | `common.save` | حفظ | Save |
| `common` | `common.cancel` | إلغاء | Cancel |
| `common` | `common.confirmStatusChange` | هل أنت متأكد من تغيير الحالة؟ | Are you sure you want to change the status? |
| `common` | `common.statusChangedToInactive` | تم تغيير الحالة من نشط إلى غير نشط بنجاح. | Status changed to Inactive. |
| `common` | `common.statusChangedToActive` | تم تغيير الحالة من غير نشط إلى نشط بنجاح. | Status changed to Active. |
| `common` | `common.errorSavingData` | حدث خطأ أثناء حفظ البيانات. | An error occurred while saving. |
| `common` | `common.errorLoadingData` | حدث خطأ أثناء تحميل البيانات. | An error occurred while loading. |
| `common` | `common.savedSuccessfully` | تم حفظ البيانات بنجاح. | Data saved successfully. |
| `crud` | `crud.tableSearchPlaceholder` | البحث عن طريق الاسم أو الكود... | Search by name or code... |
| `crud` | `crud.addBtn` | إضافة سجل جديد | Add New Record |
| `crud` | `crud.addSuccess` | تم إضافة السجل بنجاح! | Record added successfully! |
| `crud` | `crud.updateSuccess` | تم تحديث السجل بنجاح! | Record updated successfully! |
| `crud` | `crud.statusSuccess` | تم تعديل الحالة بنجاح! | Status toggled successfully! |
| `crud` | `crud.loading` | جاري تحميل البيانات من الخادم... | Loading entries from system... |
| `crud` | `crud.noRecords` | لا توجد سجلات مطابقة للبحث الحالي. | No records found. |
| `crud` | `crud.generalTab` | البيانات الأساسية | General Information |
| `crud` | `crud.contactTab` | بيانات الاتصال | Contact Information |
| `lookups` | `lookups.selectItem` | اختيار صنف | Select Item |
| `lookups` | `lookups.searchItems` | ابحث عن الأصناف... | Search items... |
| `lookups` | `lookups.noItemsFound` | لم يتم العثور على أصناف... | No items found... |
| `lookups` | `lookups.selectElement` | اختر عنصر التكلفة | Select Element |

### Adding Translation Keys for a New Screen

When creating a new screen (e.g., `warehouses`), add keys in **BOTH** `ar.json` and `en.json`:

```json
// In ar.json:
"warehouses": {
  "title": "المخازن",
  "addNew": "إضافة مخزن جديد",
  "edit": "تعديل المخزن",
  "view": "عرض المخزن",
  "fields": {
    "code": "الكود",
    "name": "الاسم",
    "aName": "الاسم (عربي)",
    "eName": "الاسم (إنجليزي)",
    "status": "الحالة"
  },
  "list": {
    "title": "المخازن"
  }
}

// Also add to pages section:
"pages": {
  "warehouses": "المخازن"
}
```

---

## 2. Dark Mode & Light Mode

### ⚠️ CRITICAL RULE

**EVERY single CSS class MUST have its dark mode counterpart.** The project uses Tailwind CSS `dark:` prefix.

### Color Reference Table

| Context | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background (page) | `bg-white` | `dark:bg-gray-900` |
| Background (card) | `bg-white` | `dark:bg-white/3` or `dark:bg-gray-800` |
| Background (surface) | `bg-gray-50` | `dark:bg-gray-800/50` |
| Text (primary) | `text-gray-800` | `dark:text-white/90` |
| Text (secondary) | `text-gray-500` | `dark:text-gray-400` |
| Text (heading) | `text-gray-900` | `dark:text-white` |
| Border | `border-gray-200` | `dark:border-white/5` or `dark:border-gray-700` |
| Border (subtle) | `border-gray-100` | `dark:border-white/5` |
| Input border | `border-gray-300` | `dark:border-gray-800` |
| Input text | `text-gray-800` | `dark:text-white/90` |
| Placeholder | `placeholder:text-gray-400` | `dark:placeholder:text-white/30` |
| Brand/Primary | `text-brand-500` / `bg-brand-500` | `dark:text-brand-400` / `dark:bg-brand-500` |
| Error | `text-error-500` | `dark:text-error-400` |
| Success | `text-success-500` | `dark:text-success-400` |
| Warning | `text-warning-500` | `dark:text-warning-400` |

### Copy-Paste Ready Input Classes

```html
<!-- Standard text input (copy these classes exactly) -->
class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:focus:border-brand-500"

<!-- Standard label -->
class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
```

---

## 3. Date Picker Component

### Package: `flatpickr` (v4.6.13)

**Path:** `src/app/shared/components/form/date-picker/date-picker.component.ts`

**DO NOT** use native HTML `<input type="date">` or any other date picker library.

### Usage

```html
<app-date-picker
  id="myDate"
  name="myDate"
  [(ngModel)]="model.myDate"
  [placeholder]="'Common.selectDate' | translate"
  [disabled]="mode === 'view'"
  [label]="'myField.dateLabel' | translate"
  [enableTime]="false"
  mode="single"
  required>
</app-date-picker>
```

### Import

```typescript
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
imports: [..., DatePickerComponent]
```

### Supported Modes: `'single'`, `'multiple'`, `'range'`, `'time'`

---

## 4. Searchable Select (Dropdown) Component

**Path:** `src/app/shared/components/form/searchable-select/searchable-select.component.ts`

**DO NOT** use native `<select>` elements or external select libraries.

### Usage

```html
<div>
  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
    {{ 'myField.label' | translate }} <span class="text-error-500">*</span>
  </label>
  <app-searchable-select
    [(ngModel)]="model.fieldId"
    name="fieldName"
    required
    [options]="myOptions"
    [disabled]="mode === 'view'"
    placeholder="Common.Select">
  </app-searchable-select>
</div>
```

### Import & Options Format

```typescript
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
imports: [..., SearchableSelectComponent]

// Populate options from API:
myOptions: SearchableOption[] = [];
this.myOptions = response.map(item => ({ value: item.id, label: `${item.code} - ${item.name}` }));
```

### Key Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `options` | `SearchableOption[]` | `[]` | List of options |
| `placeholder` | `string` | `'Common.Select'` | Translation key for placeholder |
| `allowClear` | `boolean` | `true` | Show clear button |
| `disabled` | `boolean` | `false` | Disable the component |

---

## 5. Breadcrumb Component

**Path:** `src/app/shared/components/common/page-breadcrumb/page-breadcrumb.component.ts`

### ⚠️ EVERY new screen MUST have a breadcrumb.

### List Screen

```html
<app-page-breadcrumb [pageTitle]="'myEntity.list.title' | translate"></app-page-breadcrumb>
```

Renders: **Home** > **My Entity**

### Form Screen (Add/Edit/View)

```html
<app-page-breadcrumb
  [pageTitle]="(mode === 'edit' ? 'myEntity.edit' : mode === 'view' ? 'Common.view' : 'myEntity.addNew')"
  parentPageTitle="myEntity.title"
  parentPageUrl="/module/my-entity">
</app-page-breadcrumb>
```

Renders: **Home** > **My Entity** (clickable) > **Add/Edit/View**

### Inputs

| Input | Type | Description |
|-------|------|-------------|
| `pageTitle` | `string` | Current page title (translation key, piped with `translate`) |
| `parentPageTitle` | `string?` | Parent page title (translation key — auto-translated by component) |
| `parentPageUrl` | `string?` | Parent page router link |

---

## 6. Popup / Modal Component

### Base Modal

**Path:** `src/app/shared/components/ui/modal/modal.component.ts`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Show/hide |
| `className` | `string` | `''` | Extra CSS classes (e.g. `'max-w-4xl'`) |
| `showCloseButton` | `boolean` | `true` | Show X button |
| `isFullscreen` | `boolean` | `false` | Fullscreen mode |

### Lookup Modal Pattern

Follow `ItemLookupModalComponent` exactly:

```typescript
@Component({
  selector: 'app-my-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent],
  templateUrl: './my-lookup-modal.component.html',
})
export class MyLookupModalComponent implements OnChanges, OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() selectItem = new EventEmitter<MyType>();

  items: MyType[] = [];
  loading = false;
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalPages = 1;
  totalRecords = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400), distinctUntilChanged()
    ).subscribe(term => { this.searchTerm = term; this.pageNumber = 1; this.loadItems(); });
  }

  ngOnChanges() {
    if (this.isOpen) { this.searchTerm = ''; this.pageNumber = 1; this.loadItems(); }
  }

  onSearchTermChange(term: string) { this.searchTerm = term; this.searchSubject.next(term); }

  loadItems() { /* call service, set items/pagination */ }

  onSelect(item: MyType) { this.selectItem.emit(item); this.close.emit(); }
  onClose() { this.close.emit(); }

  ngOnDestroy() { this.searchSubscription?.unsubscribe(); }
}
```

### Modal Template Structure

```html
<app-modal [isOpen]="isOpen" (close)="onClose()" [className]="'max-w-4xl'">
  <!-- Header with icon + title -->
  <div class="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-gray-900 rounded-t-2xl">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-inner">
        <!-- SVG icon -->
      </div>
      <div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ 'lookups.title' | translate }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ 'lookups.searchHint' | translate }}</p>
      </div>
    </div>
  </div>
  <div class="p-6 bg-gray-50/30 dark:bg-gray-900/50 rounded-b-2xl">
    <!-- Search input + table + pagination (copy from item-lookup-modal.component.html) -->
  </div>
</app-modal>
```

### Usage in Parent

```html
<app-my-lookup-modal [isOpen]="isModalOpen" (close)="isModalOpen = false" (selectItem)="onSelected($event)">
</app-my-lookup-modal>
```

---

## 7. CRUD Screen Pattern (Full Workflow)

### ⚠️ For CRUD screens, ALWAYS follow the **List + Form** pattern.

### Step-by-Step Checklist

When creating a new CRUD screen, follow these steps **IN ORDER**:

#### Step 1: Create Model

```
src/app/core/models/my-entity.model.ts
```

```typescript
export interface MyEntityRequest {
  id: number;
  code: string;
  aName: string;
  eName: string;
  notes: string;
  isActive: boolean;
}

export interface MyEntityResponse extends MyEntityRequest {}

export interface MyEntityBasicResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}
```

#### Step 2: Create Service

```
src/app/core/services/my-entity.service.ts
```

(See [Section 11: Service Layer Pattern](#11-service-layer-pattern))

#### Step 3: Create List Component

```
src/app/pages/<module>/<entity>/<entity>-list/<entity>-list.component.ts
src/app/pages/<module>/<entity>/<entity>-list/<entity>-list.component.html
```

```typescript
@Component({
  selector: 'app-my-entity-list',
  standalone: true,
  imports: [CommonModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule],
  templateUrl: './my-entity-list.component.html'
})
export class MyEntityListComponent implements OnInit {
  private myService = inject(MyEntityService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<MyEntityBasicResponse> | null = null;
  loading = false;
  includeDisabled = false;

  filters: RequestFilters = {
    pageNumber: 1, pageSize: 10, searchValue: '', sortColumn: 'Id', sortDirection: 'DESC'
  };

  columns: CrudColumn[] = [
    { field: 'code', header: 'myEntity.fields.code', type: 'code' },
    { field: 'name', header: 'myEntity.fields.name', type: 'text' },
    { field: 'isActive', header: 'myEntity.fields.status', type: 'badge' }
  ];

> **📝 Note on Status Column:** Using `type: 'badge'` automatically renders the standardized active/inactive visual states (e.g., green 🟢 for active, red 🔴 for inactive) exactly as seen in the `items-list.component.ts` screen.

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    this.myService.getAll(this.filters, this.includeDisabled).subscribe({
      next: (res) => { this.data = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void { this.loadData(); }
  onPageChange(pageIndex: number): void { this.filters.pageNumber = pageIndex; this.loadData(); }
  onIncludeDisabledChanged(include: boolean): void {
    this.includeDisabled = include; this.filters.pageNumber = 1; this.loadData();
  }
  onAdd(): void { this.router.navigate(['/<module>/<entity>/add']); }
  onEdit(id: number): void { this.router.navigate(['/<module>/<entity>/edit', id]); }
  onView(id: number): void { this.router.navigate(['/<module>/<entity>/view', id]); }
  onToggleStatus(item: any): void {
    this.myService.toggleStatus(item.id).subscribe(() => {
      const msg = item.isActive
        ? this.translate.instant('common.statusChangedToInactive')
        : this.translate.instant('common.statusChangedToActive');
      this.toastr.success(msg);
      this.loadData();
    });
  }
}
```

> **⚠️ Standardized List Behavior Rule:**
> - **Loading State:** You MUST set `this.loading = true` before calling `getAll` and `this.loading = false` in `next`/`error` callbacks. Pass this to `[isLoading]="loading"` in `<app-crud-list>`.
> - **Status Toggling (`IsActive`):** If the entity contains an `IsActive` field (which is standard across most of the system), you MUST implement `onToggleStatus` exactly as shown above. This ensures consistent UX when a user switches between active/inactive states from the grid.
> - **Include Disabled:** Handle the `(includeDisabledChange)` event by setting `this.filters.pageNumber = 1` and calling `loadData()` immediately so the grid refreshes automatically.

**List Template:**

```html
<app-page-breadcrumb [pageTitle]="'myEntity.list.title' | translate"></app-page-breadcrumb>

<app-crud-list [pageTitle]="'myEntity.list.title' | translate" [addBtnText]="translate.instant('myEntity.addNew')"
  [columns]="columns" [data]="data" [filters]="filters" [isLoading]="loading" [includeDisabled]="includeDisabled"
  (search)="onSearch()" (pageChange)="onPageChange($event)" (includeDisabledChange)="onIncludeDisabledChanged($event)"
  (add)="onAdd()" (edit)="onEdit($event)" (view)="onView($event)" (toggleStatus)="onToggleStatus($event)">
</app-crud-list>
```

#### Step 4: Create Form Component

```
src/app/pages/<module>/<entity>/<entity>-form/<entity>-form.component.ts
src/app/pages/<module>/<entity>/<entity>-form/<entity>-form.component.html
```

```typescript
@Component({
  selector: 'app-my-entity-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    ComponentCardComponent, PageBreadcrumbComponent,
    SuccessRedirectBannerComponent, ErrorBannerComponent,
    DatePickerComponent, SearchableSelectComponent
  ],
  templateUrl: './my-entity-form.component.html',
})
export class MyEntityFormComponent implements OnInit {
  private myService = inject(MyEntityService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  mode: 'add' | 'edit' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess: boolean = false;
  validationErrors: string[] = [];

  model: MyEntityRequest = {
    id: 0, code: '', aName: '', eName: '', notes: '', isActive: true
  };

  ngOnInit(): void {
    // Detect mode from URL
    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'edit') this.mode = 'edit';
      else if (path === 'view') this.mode = 'view';
      else this.mode = 'add';
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadRecord(this.id);
    } else if (this.mode === 'add') {
      this.getNextCode();
    }
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.myService.get(id).subscribe({
      next: (res) => { this.model = { ...res, eName: res.eName || '', notes: res.notes || '' }; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getNextCode(): void {
    this.myService.getNextCode().subscribe(res => { this.model.code = res.nextCode; });
  }

  validate(): boolean {
    this.validationErrors = [];
    if (!this.model.code) {
      const fieldName = this.translate.instant('myEntity.fields.code');
      this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: fieldName }));
    }
    if (!this.model.aName) {
      const fieldName = this.translate.instant('myEntity.fields.aName');
      this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: fieldName }));
    }
    return this.validationErrors.length === 0;
  }

  onSubmit(): void {
    if (this.mode === 'view' || !this.validate()) return;
    this.saving = true;
    this.validationErrors = [];

    const observer = {
      next: () => { this.saving = false; this.saveSuccess = true; },
      error: (err: any) => {
        this.saving = false;
        if (err?.error?.message) this.validationErrors = [err.error.message];
        else if (err?.error?.errors) {
          this.validationErrors = Array.isArray(err.error.errors)
            ? err.error.errors.map((e: any) => e.description || e.errorMessage || JSON.stringify(e))
            : Object.values(err.error.errors).flat() as string[];
        } else this.validationErrors = [this.translate.instant('errors.generic')];
      }
    };

    if (this.mode === 'add') this.myService.add(this.model).subscribe(observer);
    else this.myService.update(this.id!, this.model).subscribe(observer);
  }

  onCancel(): void { this.router.navigate(['/<module>/<entity>']); }
}

> **⚠️ Banners Rule:** 
> - **Success:** When saving is successful, set `this.saveSuccess = true` to trigger `<app-success-redirect-banner>`. This component automatically redirects to the list view after a 5-second countdown.
> - **Error / Validation:** When validation fails or API returns errors, populate `this.validationErrors` array. This triggers `<app-error-banner>` at the bottom of the template. Always use proper translation variables like `this.translate.instant('common.fieldRequired', { field: fieldName })` to display user-friendly error messages (e.g. "The Code field is required").
```

**Form Template:**

> **⚠️ Standardized Form Header & Code Field:**
> DO NOT put the Code field and Action buttons inside the standard grid form or at the bottom. You MUST use the Header block pattern below, which displays the `Code` as an inline editable input inside a stylish badge alongside the `Cancel` and `Save` buttons.

```html
<app-page-breadcrumb
  [pageTitle]="(mode === 'edit' ? 'myEntity.edit' : mode === 'view' ? 'Common.view' : 'myEntity.addNew')"
  parentPageTitle="myEntity.title"
  parentPageUrl="/<module>/<entity>">
</app-page-breadcrumb>

<div class="space-y-6">
  <app-success-redirect-banner [isVisible]="saveSuccess" [message]="'Common.savedSuccessfully'"
    [redirectUrl]="'/<module>/<entity>'" [countdownSeconds]="5">
  </app-success-redirect-banner>

  <app-component-card
    [title]="(mode === 'edit' ? 'myEntity.edit' : mode === 'view' ? 'Common.view' : 'myEntity.addNew') | translate"
    [className]="'p-6'">

    <div *ngIf="loading" class="flex justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
    </div>

    <form *ngIf="!loading" (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-6">

      <!-- Header and Action Buttons (NEW STANDARD PATTERN) -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-5">
        
        <!-- Code Input Badge -->
        <div class="flex items-center gap-2 px-3 py-2 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-lg shadow-theme-xs">
          <svg class="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span class="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider whitespace-nowrap">
            {{ 'myEntity.fields.code' | translate }}
          </span>
          <div class="w-px h-4 bg-brand-200 dark:bg-brand-500/30 mx-1"></div>
          <input type="text" [(ngModel)]="model.code" name="code" required [disabled]="mode === 'view'"
            class="font-mono text-sm font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 p-0 w-32 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-70"
            placeholder="---" />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <button type="button" (click)="onCancel()"
            class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
            {{ (mode === 'view' ? 'Common.back' : 'Common.cancel') | translate }}
          </button>

          <button *ngIf="mode !== 'view'" type="submit" [disabled]="saving || !form.valid"
            class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <svg *ngIf="saving" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ (saving ? 'Common.saving' : 'Common.save') | translate }}</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2">

        <!-- Arabic Name -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {{ 'myEntity.fields.aName' | translate }} <span class="text-error-500">*</span>
          </label>
          <input type="text" [(ngModel)]="model.aName" name="aName" required [disabled]="mode === 'view'"
            class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:focus:border-brand-500" />
        </div>

        <!-- English Name -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {{ 'myEntity.fields.eName' | translate }}
          </label>
          <input type="text" [(ngModel)]="model.eName" name="eName" [disabled]="mode === 'view'"
            class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:focus:border-brand-500" />
        </div>

        <!-- Notes -->
        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {{ 'myEntity.fields.notes' | translate }}
          </label>
          <textarea [(ngModel)]="model.notes" name="notes" rows="3" [disabled]="mode === 'view'"
            class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:focus:border-brand-500"></textarea>
        </div>
      </div>
    </form>
  </app-component-card>
</div>

<app-error-banner [isVisible]="validationErrors.length > 0" [errors]="validationErrors"
  (close)="validationErrors = []"></app-error-banner>
```

#### Step 5: Add Routes

(See [Section 13: Routing Conventions](#13-routing-conventions))

#### Step 6: Add Translations

(See [Section 1](#adding-translation-keys-for-a-new-screen))

#### Step 7: Register in Sidebar

(See [Section 14: Sidebar Menu Registration](#14-sidebar-menu-registration))

---

## 8. CrudListComponent — Advanced Features

**Path:** `src/app/shared/components/common/crud-list/crud-list.component.ts`

The `CrudListComponent` is the **most important reusable component.** It handles table, search, pagination, page-size selection, actions, toggle status (with SweetAlert2), and loading skeletons automatically.

### All Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `pageTitle` | `string` | — | Page title (translation key) |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `addBtnText` | `string` | `'Add New'` | Add button text |
| `columns` | `CrudColumn[]` | `[]` | Table column definitions |
| `data` | `PaginatedList<any>` | `null` | Data from API |
| `filters` | `RequestFilters` | — | Current filter state |
| `includeDisabled` | `boolean` | `false` | Include disabled toggle |
| `showIncludeDisabledToggle` | `boolean` | `true` | Show/hide toggle |
| `isLoading` | `boolean` | `false` | Show loading skeleton |
| `hideBuiltInSearch` | `boolean` | `false` | Hide default search input |
| `hasAdvancedFilters` | `boolean` | `false` | Enable advanced filter panel |
| `hasActiveAdvancedFilters` | `boolean` | `false` | Show active filter indicator dot |
| `hideEdit` | `boolean \| ((item) => boolean)` | `false` | Hide edit action |
| `hideView` | `boolean \| ((item) => boolean)` | `false` | Hide view action |
| `hideToggleStatus` | `boolean \| ((item) => boolean)` | `false` | Hide toggle action |
| `customActions` | `CustomAction[]` | `[]` | Add custom action buttons |

### All Outputs

| Output | Type | Description |
|--------|------|-------------|
| `search` | `void` | Search triggered |
| `includeDisabledChange` | `boolean` | Toggle changed |
| `add` | `void` | Add button clicked |
| `view` | `number` | View action (emits ID) |
| `edit` | `number` | Edit action (emits ID) |
| `toggleStatus` | `any` | Toggle status (emits item) |
| `pageChange` | `number` | Page changed |
| `customAction` | `{ actionId, item }` | Custom action clicked |

### Column Types (`CrudColumn.type`)

| Type | Behavior |
|------|----------|
| `'code'` | Shows clickable badge with Copy Code / Copy ID popup |
| `'text'` | Plain text |
| `'badge'` | Active/Inactive badge (reads boolean field) |
| `'dynamic-badge'` | Badge with dynamic color (reads `field + 'Color'`) |
| `'date'` | Formatted date via `DatePipe` |

### Advanced Filters (Content Projection)

```html
<app-crud-list [hasAdvancedFilters]="true" [hasActiveAdvancedFilters]="hasActiveFilters" ...>

  <!-- Custom search area (replaces or supplements built-in search) -->
  <div custom-filters class="flex gap-4">
    <!-- Your custom filter inputs here -->
  </div>

  <!-- Advanced filter panel (toggleable) -->
  <div advanced-filters>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <app-date-picker id="fromDate" name="fromDate" [(ngModel)]="advancedFilters.from" ...></app-date-picker>
      <app-date-picker id="toDate" name="toDate" [(ngModel)]="advancedFilters.to" ...></app-date-picker>
      <app-searchable-select [(ngModel)]="advancedFilters.type" [options]="typeOptions" ...></app-searchable-select>
    </div>
    <div class="flex gap-2 mt-4">
      <button (click)="applyFilter()" class="...">{{ 'Common.filter' | translate }}</button>
      <button (click)="clearFilter()" class="...">{{ 'Common.reset' | translate }}</button>
    </div>
  </div>

</app-crud-list>
```

### Custom Actions

```typescript
customActions = [
  {
    id: 'print',
    label: 'Common.print',
    icon: '<svg ...>...</svg>',
    colorClass: 'text-brand-600 dark:text-brand-400',
    visible: (item: any) => item.status === 'Confirmed'
  }
];

onCustomAction(event: { actionId: string, item: any }): void {
  if (event.actionId === 'print') { /* handle */ }
}
```

```html
<app-crud-list ... [customActions]="customActions" (customAction)="onCustomAction($event)">
</app-crud-list>
```

### Conditional Action Visibility

```typescript
// Hide edit for specific items
hideEdit = (item: any) => item.status === 'Confirmed';

// Hide toggle for all
hideToggleStatus = true;
```

---

## 9. Shared Components Reference

### Form Components (`src/app/shared/components/form/`)

| Component | Selector | Key Inputs |
|-----------|----------|------------|
| `DatePickerComponent` | `<app-date-picker>` | `mode`, `placeholder`, `label`, `enableTime`, `disabled` |
| `SearchableSelectComponent` | `<app-searchable-select>` | `options`, `placeholder`, `allowClear`, `disabled` |
| `MultiSelectComponent` | `<app-multi-select>` | Multiple selection dropdown |

### Common Components (`src/app/shared/components/common/`)

| Component | Selector | Key Inputs |
|-----------|----------|------------|
| `PageBreadcrumbComponent` | `<app-page-breadcrumb>` | `pageTitle`, `parentPageTitle`, `parentPageUrl` |
| `CrudListComponent` | `<app-crud-list>` | (See [Section 8](#8-crudlistcomponent--advanced-features)) |
| `ComponentCardComponent` | `<app-component-card>` | `title`, `desc`, `className` |
| `SuccessRedirectBannerComponent` | `<app-success-redirect-banner>` | `isVisible`, `message`, `redirectUrl`, `countdownSeconds` |
| `ErrorBannerComponent` | `<app-error-banner>` | `isVisible`, `errors`, `countdownSeconds` |

### UI Components (`src/app/shared/components/ui/`)

| Component | Selector | Key Inputs |
|-----------|----------|------------|
| `ModalComponent` | `<app-modal>` | `isOpen`, `className`, `showCloseButton`, `isFullscreen` |
| `BadgeComponent` | `<app-badge>` | `size`, `color` |

### Lookup Components (`src/app/shared/components/lookups/`)

| Component | Selector | Key Inputs/Outputs |
|-----------|----------|-------------------|
| `ItemLookupModalComponent` | `<app-item-lookup-modal>` | `[isOpen]`, `(close)`, `(selectItem)` |
| `CostElementLookupModalComponent` | `<app-cost-element-lookup-modal>` | `[isOpen]`, `(close)`, `(selectItem)` |

---

## 10. Core Models & Interfaces

**Path:** `src/app/core/models/`

### Pagination (`pagination.model.ts`)

```typescript
export interface RequestFilters {
  pageNumber: number;
  pageSize: number;
  searchValue?: string | null;
  sortColumn?: string | null;
  sortDirection?: string | null;
}

export interface PaginatedList<T> {
  items: T[];
  pageIndex: number;
  totalPages: number;
  totalRecords: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
```

### API Result (`result.model.ts`)

```typescript
export interface ResultBase {
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; description: string; statusCode?: number | null; };
}
export interface Result extends ResultBase {}
export interface ResultWithValue<TValue> extends ResultBase { value: TValue; }
```

### Lookup Models (`lookup.model.ts`)

```typescript
export interface IdNameResponse { id: number; name: string; }
export interface CodeNameResponse { code: string; name: string; }
export interface IntIdCodeNameResponse { id: number; code: string; name: string; }
export interface SimpleCrudResponse { id: number; code: string; name: string; notes?: string; isActive: boolean; }
export interface NextCodeResponse { nextCode: string; }
export interface ItemLookupResponse { id: number; code: string; name: string; stock?: number; salesPrice?: number; }
```

**⚠️ REUSE these interfaces.** Do not create new ones for the same shape.

---

## 11. Service Layer Pattern

**Path:** `src/app/core/services/`

Every entity needs a service. Follow the `ItemPropertyService` pattern:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RequestFilters, PaginatedList } from '../models/pagination.model';
import { MyEntityResponse, MyEntityRequest } from '../models/my-entity.model';
import { NextCodeResponse } from '../models/lookup.model';

@Injectable({ providedIn: 'root' })
export class MyEntityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/MyEntity`;

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<MyEntityResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString())
      .set('includeDisabled', includeDisabled.toString());
    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.sortColumn) params = params.set('sortColumn', filters.sortColumn);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);
    return this.http.get<PaginatedList<MyEntityResponse>>(this.baseUrl, { params });
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.baseUrl}/next-code`);
  }

  get(id: number): Observable<MyEntityResponse> {
    return this.http.get<MyEntityResponse>(`${this.baseUrl}/${id}`);
  }

  add(request: MyEntityRequest): Observable<MyEntityResponse> {
    return this.http.post<MyEntityResponse>(this.baseUrl, request);
  }

  update(id: number, request: MyEntityRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/toggleStatus`, {});
  }
}
```

### Key Rules

1. Always use `inject(HttpClient)` (not constructor injection)
2. Base URL pattern: `${environment.apiUrl}/api/<ControllerName>`
3. Use `NextCodeResponse` from `lookup.model.ts` for auto-generated codes
4. HTTP method conventions: `GET` list/get, `POST` create, `PUT` update/toggle

---

## 12. LookupService API Reference

**Path:** `src/app/core/services/lookup.service.ts`

The `LookupService` provides dropdown data. **ALWAYS use it instead of creating separate lookup endpoints.**

| Method | Returns | Usage |
|--------|---------|-------|
| `getWarehouses()` | `IdNameResponse[]` | Warehouse dropdown |
| `getCustomers()` | `IntIdCodeNameResponse[]` | Customer dropdown |
| `getVendors()` | `IntIdCodeNameResponse[]` | Vendor dropdown |
| `getItemGroups()` | `IdNameResponse[]` | Item group dropdown |
| `getItemProperties()` | `IdNameResponse[]` | Item property dropdown |
| `getUnitOfMeasures()` | `IdNameResponse[]` | UOM dropdown |
| `getPageSizes()` | `number[]` | Page size options (cached) |
| `getSalesItemsLookup()` | `PaginatedList<ItemLookupResponse>` | Item lookup modal data |
| `getSalesInvoicesLookup()` | `IdNameResponse[]` | Sales invoice lookup |
| `getInvoiceCostElementsSalesDropdown()` | `InvoiceCostElementDropdown[]` | Sales cost elements |
| `getInvoiceCostElementsPurchaseDropdown()` | `InvoiceCostElementDropdown[]` | Purchase cost elements |

### Usage Example

```typescript
private lookupService = inject(LookupService);

warehouseOptions: SearchableOption[] = [];

ngOnInit() {
  this.lookupService.getWarehouses().subscribe(res => {
    this.warehouseOptions = res.map(w => ({ value: w.id, label: w.name }));
  });
}
```

---

## 13. Routing Conventions

### URL Structure

```
/<module>/<entity>              → List
/<module>/<entity>/add          → Add Form
/<module>/<entity>/edit/:id     → Edit Form
/<module>/<entity>/view/:id     → View Form (read-only)
```

### Route Configuration in `app.routes.ts`

```typescript
// Add inside the `children` array of AppLayoutComponent
{
  path: '<module>/<entity>',
  loadComponent: () => import('./pages/<module>/<entity>/<entity>-list/<entity>-list.component')
    .then(c => c.<Entity>ListComponent),
  title: '<Entity> | AMF Core'
},
{
  path: '<module>/<entity>/add',
  loadComponent: () => import('./pages/<module>/<entity>/<entity>-form/<entity>-form.component')
    .then(c => c.<Entity>FormComponent),
  title: 'Add <Entity> | AMF Core'
},
{
  path: '<module>/<entity>/edit/:id',
  loadComponent: () => import('./pages/<module>/<entity>/<entity>-form/<entity>-form.component')
    .then(c => c.<Entity>FormComponent),
  title: 'Edit <Entity> | AMF Core'
},
{
  path: '<module>/<entity>/view/:id',
  loadComponent: () => import('./pages/<module>/<entity>/<entity>-form/<entity>-form.component')
    .then(c => c.<Entity>FormComponent),
  title: 'View <Entity> | AMF Core'
}
```

### Key Rules

- Use `loadComponent` for **lazy loading** (never import directly in routes)
- Add `canDeactivate: [unsavedChangesGuard]` for forms with unsaved changes detection
- Title format: `'<Page Name> | AMF Core'`

---

## 14. Sidebar Menu Registration

**Path:** `src/app/shared/layout/app-sidebar/app-sidebar.component.ts`

When adding a new screen, you **MUST** register it in the sidebar menu.

### Structure

```typescript
// The navItems array contains all menu items
navItems: NavItem[] = [
  {
    name: "Module Name",
    translationKey: "pages.moduleName",
    icon: `<svg ...>...</svg>`,
    subItems: [
      { name: "My Entity", translationKey: "pages.myEntity", path: "/<module>/<entity>" },
    ],
  },
  // ...
];
```

### Adding to an EXISTING group

Find the relevant group (e.g., "Inventory", "Master Data") and add a new `subItem`:

```typescript
{ name: "My Entity", translationKey: "pages.myEntity", path: "/<module>/<entity>" }
```

### Adding a NEW group

```typescript
{
  name: "New Module",
  translationKey: "pages.newModule",
  icon: `<svg width="1em" height="1em" ...>...</svg>`,
  subItems: [
    { name: "Entity One", translationKey: "pages.entityOne", path: "/new-module/entity-one" },
    { name: "Entity Two", translationKey: "pages.entityTwo", path: "/new-module/entity-two" },
  ],
}
```

### ⚠️ Remember to add translation keys for `translationKey` values in both `ar.json` and `en.json`.

---

## 15. Form Patterns & Validation

### Standard Input Field

```html
<div>
  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
    {{ 'field.label' | translate }} <span class="text-error-500">*</span>
  </label>
  <input type="text" [(ngModel)]="model.field" name="field" required [disabled]="mode === 'view'"
    class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:focus:border-brand-500" />
</div>
```

### Textarea (full width)

```html
<div class="sm:col-span-2">
  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
    {{ 'field.notes' | translate }}
  </label>
  <textarea [(ngModel)]="model.notes" name="notes" rows="3" [disabled]="mode === 'view'"
    class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:focus:border-brand-500"></textarea>
</div>
```

### Checkbox

```html
<label class="flex items-center gap-2"
  [ngClass]="{'cursor-pointer': mode !== 'view', 'opacity-60': mode === 'view'}">
  <input type="checkbox" [(ngModel)]="model.isCustomer" name="isCustomer" [disabled]="mode === 'view'"
    class="h-4 w-4 rounded text-brand-500 border-gray-300 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900" />
  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ 'field.label' | translate }}</span>
</label>
```

### Tabs Pattern (for forms with multiple sections)

```html
<div *ngIf="!loading && mode !== 'add'" class="mb-6 flex border-b border-gray-200 dark:border-gray-800">
  <button type="button" (click)="setTab('basic')"
    [ngClass]="activeTab === 'basic' ? 'border-brand-500 text-brand-600 dark:text-brand-500' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'"
    class="whitespace-nowrap border-b-2 text-sm font-medium mx-4 first:ml-0">
    {{ 'myEntity.tabs.basicInfo' | translate }}
  </button>
  <button type="button" (click)="setTab('details')"
    [ngClass]="activeTab === 'details' ? 'border-brand-500 text-brand-600 dark:text-brand-500' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'"
    class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium mx-4">
    {{ 'myEntity.tabs.details' | translate }}
  </button>
</div>
```

### Client-Side Validation Pattern

```typescript
validate(): boolean {
  this.validationErrors = [];
  if (!this.model.requiredField) {
    this.validationErrors.push(
      `${this.translate.instant('myEntity.fields.fieldName')}: ${this.translate.instant('validation.required')}`
    );
  }
  return this.validationErrors.length === 0;
}
```

### Server Error Handling (Copy-Paste Ready)

```typescript
error: (err: any) => {
  this.saving = false;
  if (err?.error?.message) {
    this.validationErrors = [err.error.message];
  } else if (err?.error?.errors) {
    if (Array.isArray(err.error.errors)) {
      this.validationErrors = err.error.errors.map((e: any) =>
        e.description || e.errorMessage || (typeof e === 'string' ? e : JSON.stringify(e))
      );
    } else {
      this.validationErrors = Object.values(err.error.errors).flat() as string[];
    }
  } else {
    this.validationErrors = [this.translate.instant('errors.generic')];
  }
}
```

---

## 16. Unsaved Changes Guard

**Path:** `src/app/core/guards/unsaved-changes.guard.ts`

For forms that modify data, implement `HasUnsavedChanges` interface and add the guard to routes.

### Interface

```typescript
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean | Observable<boolean>;
  getUnsavedChangesMessage?(): string;
  confirmDeactivation?(): Observable<boolean> | Promise<boolean> | boolean;
}
```

### Implementation

```typescript
export class MyFormComponent implements OnInit, HasUnsavedChanges {
  private originalModel: string = '';

  ngOnInit() {
    // Save original state after loading
    this.originalModel = JSON.stringify(this.model);
  }

  hasUnsavedChanges(): boolean {
    if (this.saveSuccess) return false;
    return JSON.stringify(this.model) !== this.originalModel;
  }

  getUnsavedChangesMessage(): string {
    return this.translate.instant('Common.unsavedChangesMessage');
  }
}
```

### Route Configuration

```typescript
{
  path: '<module>/<entity>/add',
  loadComponent: () => import('...').then(c => c.MyFormComponent),
  canDeactivate: [unsavedChangesGuard],
  title: 'Add Entity | AMF Core'
}
```

---

## 17. Confirmation Dialogs & Toasts

### SweetAlert2 (v11) — Status Toggle Confirmations

```typescript
import Swal from 'sweetalert2';

const isRtl = this.translate.currentLang === 'ar';
Swal.fire({
  title: this.translate.instant('common.confirmStatusChange'),
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: this.translate.instant('common.save'),
  cancelButtonText: this.translate.instant('common.cancel'),
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  customClass: { popup: isRtl ? 'swal-rtl' : '' }
}).then((result) => {
  if (result.isConfirmed) { /* proceed */ }
});
```

> **NOTE:** `CrudListComponent` already handles toggle status confirmation with SweetAlert2 internally. You do NOT need to implement it yourself when using `CrudListComponent`.

### ngx-toastr (v20) — Toast Notifications

```typescript
import { ToastrService } from 'ngx-toastr';
private toastr = inject(ToastrService);

this.toastr.success(this.translate.instant('common.savedSuccessfully'));
this.toastr.error(this.translate.instant('errors.generic'));
```

---

## 18. Styling Conventions

### CSS Framework

- **Tailwind CSS v4** with PostCSS
- Custom theme colors: `brand-*`, `error-*`, `warning-*`, `success-*`
- Shadow utilities: `shadow-theme-xs`, `shadow-theme-sm`, `shadow-theme-md`
- **ALWAYS use `dark:` variants**

### Grid Layouts

```html
<!-- 2-column (standard forms) -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2"> ... </div>

<!-- 3-column (invoice headers) -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"> ... </div>

<!-- 4-column (filter bars) -->
<div class="grid grid-cols-1 sm:grid-cols-4 gap-4"> ... </div>
```

### Button Styles (Copy-Paste Ready)

```html
<!-- Primary (Brand) -->
class="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 disabled:opacity-50"

<!-- Cancel/Secondary -->
class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"

<!-- Success -->
class="flex items-center gap-2 rounded-lg bg-success-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-success-600"

<!-- Danger/Delete -->
class="text-error-500 hover:text-error-600 transition-colors"
```

### Loading Spinner (standardized)

```html
<div *ngIf="loading" class="flex justify-center p-8">
  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
</div>
```

### RTL Support

- Tailwind `rtl:` prefix classes are available
- SVG arrows use `rtl:rotate-180` for directional icons
- Use `text-start` instead of `text-left`
- Use `ps-*` / `pe-*` instead of `pl-*` / `pr-*`

---

## 19. Performance Optimization

### ⚠️ CRITICAL: Subscription Management

> **EVERY new `.subscribe()` MUST have a cleanup mechanism. Any subscription without cleanup will be rejected in code review.**

**Three approaches ordered by preference (Angular 21+):**

| Priority | Approach | When to use | Benefits |
|----------|---------|-------------|---------|
| 1️⃣ | **`toSignal()` or `AsyncPipe`** | Displaying data in Templates | No manual subscription/cleanup needed |
| 2️⃣ | **`takeUntilDestroyed()`** | Processing data in TypeScript | One-liner, no `ngOnDestroy` needed |
| 3️⃣ | **Manual `ngOnDestroy`** ⛔ | Legacy code ONLY | **FORBIDDEN in new code** |

#### Approach 1: `toSignal()` (Preferred in Angular 21+)
```typescript
import { toSignal } from '@angular/core/rxjs-interop';

// In constructor or field declaration:
private data = toSignal(this.myService.getData(), { initialValue: [] });

// In Template:
// {{ data() }}
```

#### Approach 2: `takeUntilDestroyed()` (For TS Processing)
```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

// ✅ Inside Injection Context (constructor or field):
this.route.params.pipe(takeUntilDestroyed()).subscribe(params => { /* ... */ });

// ✅ Outside Injection Context (in a method like ngOnInit):
private destroyRef = inject(DestroyRef);

ngOnInit() {
  this.myService.getData().pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(data => { this.processData(data); });
}
```

#### Approach 3: `AsyncPipe` (For Simple Templates)
```html
<div *ngIf="data$ | async as data">
  {{ data.name }}
</div>
```

> **🔄 Gradual Update Rule:** When modifying a legacy file that uses manual `ngOnDestroy` + `Subscription`, you **MUST** refactor it to use `takeUntilDestroyed()` in the same PR.

### Change Detection Strategy

> **EVERY NEW Shared Component MUST use `ChangeDetectionStrategy.OnPush`.**
> **Components in `pages/` SHOULD use it where possible, but it is not mandatory.**

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-my-shared',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // ← MANDATORY
  // ...
})
export class MySharedComponent { }
```

**OnPush Requirements:**
- Use `@Input()` with immutable data (or `input()` signal)
- Use `AsyncPipe` or `toSignal()` instead of manual `.subscribe()`
- When manual update is needed: `inject(ChangeDetectorRef).markForCheck()`

### Angular 21+ Signals APIs (Preferred)

Recommend using Signal-based APIs in new code:

| Legacy API | Modern API (Preferred) | Example |
|-----------|---------------------|------|
| `@Input()` | `input()` / `input.required()` | `name = input<string>('')` |
| `@Output()` | `output()` | `clicked = output<void>()` |
| `[(ngModel)]` | `model()` | `value = model<string>('')` |
| `@ViewChild()` | `viewChild()` | `myEl = viewChild<ElementRef>('myEl')` |
| `.subscribe()` in template | `toSignal()` | `data = toSignal(obs$)` |
| `computed` properties | `computed()` | `total = computed(() => ...)` |

> [!NOTE]
> These recommendations are **preferred** but not strictly mandatory yet. Traditional `@Input()` / `@Output()` can still be used.

### `trackBy` in Lists

> **EVERY `*ngFor` MUST include a `trackBy` function.**

```html
<!-- ✅ Correct -->
<tr *ngFor="let item of items; trackBy: trackById">

<!-- Or in Angular 21+ with @for: -->
@for (item of items; track item.id) {
  <tr>...</tr>
}
```

```typescript
trackById(index: number, item: any): number {
  return item.id;
}
```

---

## 20. Clean Architecture — Frontend Alignment

### ⚠️ CRITICAL RULE: No Cross-Module Imports

**Import Boundary Rules:**

```
┌─────────────────────────────────────────────────┐
│                    core/                        │
│  (models, services, guards, interceptors)       │
│  ⛔ CANNOT import from shared/ or pages/        │
└──────────────────────┬──────────────────────────┘
                       │ ✅
┌──────────────────────▼──────────────────────────┐
│                   shared/                       │
│  (components, pipes, directives, layout)        │
│  ✅ CAN import from core/                       │
│  ⛔ CANNOT import from pages/                   │
└──────────────────────┬──────────────────────────┘
                       │ ✅
┌──────────────────────▼──────────────────────────┐
│                   pages/                        │
│  ✅ CAN import from core/ and shared/           │
│  ⛔ CANNOT import from another pages/ module    │
│                                                 │
│  pages/sales ──✅──→ core/*                     │
│  pages/sales ──✅──→ shared/*                   │
│  pages/sales ──⛔──→ pages/inventory            │
│  pages/inventory ⛔→ pages/sales                │
└─────────────────────────────────────────────────┘
```

### When to Move to Core or Shared

| Scenario | Destination | Example |
|--------|--------|------|
| **Model** needed by >1 module | `core/models/` | `partner.model.ts` (Sales & Purchases) |
| **Service** needed by >1 module | `core/services/` | `LookupService` |
| **Component** needed by >1 module | `shared/components/` | `SearchableSelectComponent` |
| **Pipe/Directive** shared | `shared/pipe/` or `shared/directives/` | `SafeHtmlPipe` |

### Red Flags 🚩 (FORBIDDEN Patterns)

```typescript
// ❌ FORBIDDEN: Importing model from another module
import { SalesInvoice } from '../../sales/models/sales-invoice.model';

// ❌ FORBIDDEN: Importing service from another module
import { SalesService } from '../../sales/services/sales.service';

// ❌ FORBIDDEN: Importing component from another module
import { SalesWidgetComponent } from '../../sales/components/sales-widget.component';

// ✅ CORRECT: Move shared code to core/ or shared/
import { InvoiceModel } from '../../../../core/models/invoice.model';
import { SharedWidgetComponent } from '../../../../shared/components/shared-widget.component';
```

---

## ✅ Quick Reference Checklist

Before creating any screen, verify:

- [ ] Translation keys added to BOTH `ar.json` AND `en.json`
- [ ] Page key added to `pages` section in both translation files
- [ ] Dark mode classes included for EVERY light mode class
- [ ] `<app-page-breadcrumb>` added with proper parent page links
- [ ] Date inputs use `<app-date-picker>` (flatpickr)
- [ ] Dropdowns use `<app-searchable-select>` (custom component)
- [ ] Popups/Modals use `<app-modal>` with the lookup pattern
- [ ] CRUD screens follow List + Form pattern
- [ ] List screen uses `CrudListComponent` (not custom table)
- [ ] Form uses `<app-error-banner>` and `<app-success-redirect-banner>`
- [ ] View mode disables all inputs with `[disabled]="mode === 'view'"`
- [ ] Model + Service created following standard patterns
- [ ] Routes added to `app.routes.ts` with lazy loading
- [ ] Route title follows `'Page Name | AMF Core'` pattern
- [ ] Sidebar menu updated in `app-sidebar.component.ts`
- [ ] Existing `LookupService` methods reused for dropdown data
- [ ] Existing `Common.*` / `crud.*` / `common.*` translation keys reused
- [ ] `unsavedChangesGuard` added to form routes (if needed)
- [ ] Subscriptions use `takeUntilDestroyed()` or `toSignal()` (NO manual `ngOnDestroy`)
- [ ] Shared components use `ChangeDetectionStrategy.OnPush`
- [ ] `*ngFor` loops include `trackBy` (or use `@for` with `track`)
- [ ] No cross-module imports between `pages/` directories
- [ ] Shared models/services live in `core/` not inside a specific `pages/` module
