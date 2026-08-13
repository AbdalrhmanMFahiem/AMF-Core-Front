import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ExportLoadingOptions {
  fileType?: 'excel' | 'pdf' | 'csv' | 'general';
  title?: string;
  subtitle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportLoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private optionsSubject = new BehaviorSubject<ExportLoadingOptions>({
    fileType: 'excel'
  });

  public readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  public readonly options$: Observable<ExportLoadingOptions> = this.optionsSubject.asObservable();

  show(options?: ExportLoadingOptions): void {
    this.optionsSubject.next({
      fileType: 'excel',
      ...options
    });
    this.isLoadingSubject.next(true);
  }

  hide(): void {
    this.isLoadingSubject.next(false);
  }
}
