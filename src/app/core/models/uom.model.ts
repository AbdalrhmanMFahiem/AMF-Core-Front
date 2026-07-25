import { RequestFilters } from './pagination.model';

export enum UomType {
  Length = 'Length',
  Area = 'Area',
  Volume = 'Volume',
  Weight = 'Weight',
  Time = 'Time',
  Timing = 'Timing',
  Quantity = 'Quantity',
  Other = 'Other'
}

export interface UomTypeMeta {
  type: UomType;
  aName: string;
  eName: string;
  translationKey: string;
  icon: string;
  svgPath: string;
  badgeClasses: string;
}

export const UOM_TYPE_CONFIG_MAP: Record<UomType, UomTypeMeta> = {
  [UomType.Weight]: {
    type: UomType.Weight,
    aName: 'وزن',
    eName: 'Weight',
    translationKey: 'uom.types.Weight',
    icon: 'scale',
    svgPath: 'M3 6l3 1m0 0l-3 9a50.002 50.002 0 006 0l-3-9zm0 0h7.5m0 0l3 9a50.002 50.002 0 006 0l-3-9zm0 0H21',
    badgeClasses: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
  },
  [UomType.Quantity]: {
    type: UomType.Quantity,
    aName: 'عدد',
    eName: 'Quantity',
    translationKey: 'uom.types.Quantity',
    icon: 'hashtag',
    svgPath: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
    badgeClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
  },
  [UomType.Volume]: {
    type: UomType.Volume,
    aName: 'حجم',
    eName: 'Volume',
    translationKey: 'uom.types.Volume',
    icon: 'cube',
    svgPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    badgeClasses: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20'
  },
  [UomType.Length]: {
    type: UomType.Length,
    aName: 'طول',
    eName: 'Length',
    translationKey: 'uom.types.Length',
    icon: 'ruler',
    svgPath: 'M4 8V4m0 0h4M4 4l5 5m11-2v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4',
    badgeClasses: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
  },
  [UomType.Area]: {
    type: UomType.Area,
    aName: 'مساحة',
    eName: 'Area',
    translationKey: 'uom.types.Area',
    icon: 'square',
    svgPath: 'M4 4h16v16H4z',
    badgeClasses: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
  },
  [UomType.Time]: {
    type: UomType.Time,
    aName: 'وقت',
    eName: 'Time',
    translationKey: 'uom.types.Time',
    icon: 'clock',
    svgPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    badgeClasses: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
  },
  [UomType.Timing]: {
    type: UomType.Timing,
    aName: 'توقيت',
    eName: 'Timing',
    translationKey: 'uom.types.Timing',
    icon: 'clock',
    svgPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    badgeClasses: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
  },
  [UomType.Other]: {
    type: UomType.Other,
    aName: 'أخرى',
    eName: 'Other',
    translationKey: 'uom.types.Other',
    icon: 'dots',
    svgPath: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
    badgeClasses: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
  }
};

export const UOM_TYPE_CONFIG_LIST: UomTypeMeta[] = Object.values(UOM_TYPE_CONFIG_MAP);

export function getUomTypeConfig(type?: UomType | string | null): UomTypeMeta {
  if (!type) return UOM_TYPE_CONFIG_MAP[UomType.Other];
  const found = (UOM_TYPE_CONFIG_MAP as any)[type];
  return found || UOM_TYPE_CONFIG_MAP[UomType.Other];
}

export interface UnitOfMeasureBasicResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  uomType: UomType;
  isBaseUnit: boolean;
  conversionFactor: number;
  notes?: string;
}

export interface UnitOfMeasure {
  id: number;
  code: string;
  name?: string;
  aName: string;
  eName: string;
  uomType: UomType;
  isBaseUnit: boolean;
  conversionFactor: number;
  notes: string;
  isActive: boolean;
  tenantId: number;
  createdById?: number;
  createdOn?: string;
  updatedById?: number;
  updatedOn?: string;
}

export interface UnitOfMeasureRequest {
  code: string;
  aName: string;
  eName: string;
  uomType: UomType;
  isBaseUnit: boolean;
  conversionFactor: number;
  notes: string;
  isActive: boolean;
}

export interface UnitOfMeasureFilters extends RequestFilters {
  type?: UomType | string;
}

export interface PendingDerivedUnit {
  id: string;
  code: string;
  aName: string;
  eName?: string;
  conversionFactor: number | null;
}