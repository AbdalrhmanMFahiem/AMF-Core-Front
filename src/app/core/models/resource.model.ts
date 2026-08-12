import { RequestFilters } from './pagination.model';
import { UomType } from './uom.model';

export enum ResourceType {
  Labor = 'Labor',
  Machine = 'Machine',
  Operation = 'Operation',
  Other = 'Other'
}

export interface ResourceTypeMeta {
  type: ResourceType;
  aName: string;
  eName: string;
  translationKey: string;
  icon: string;
  svgPath: string;
  badgeClasses: string;
}

export const RESOURCE_TYPE_CONFIG_MAP: Record<ResourceType, ResourceTypeMeta> = {
  [ResourceType.Labor]: {
    type: ResourceType.Labor,
    aName: 'عمالة',
    eName: 'Labor',
    translationKey: 'resources.types.Labor',
    icon: 'user-group',
    svgPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    badgeClasses: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
  },
  [ResourceType.Machine]: {
    type: ResourceType.Machine,
    aName: 'آلة',
    eName: 'Machine',
    translationKey: 'resources.types.Machine',
    icon: 'cog',
    svgPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    badgeClasses: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
  },
  [ResourceType.Operation]: {
    type: ResourceType.Operation,
    aName: 'عملية',
    eName: 'Operation',
    translationKey: 'resources.types.Operation',
    icon: 'play-circle',
    svgPath: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    badgeClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
  },
  [ResourceType.Other]: {
    type: ResourceType.Other,
    aName: 'أخرى',
    eName: 'Other',
    translationKey: 'resources.types.Other',
    icon: 'dots-horizontal',
    svgPath: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
    badgeClasses: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
  }
};

export const RESOURCE_TYPE_CONFIG_LIST: ResourceTypeMeta[] = Object.values(RESOURCE_TYPE_CONFIG_MAP);

export function getResourceTypeConfig(type?: ResourceType | string | null): ResourceTypeMeta {
  if (!type) return RESOURCE_TYPE_CONFIG_MAP[ResourceType.Other];
  const found = (RESOURCE_TYPE_CONFIG_MAP as any)[type];
  return found || RESOURCE_TYPE_CONFIG_MAP[ResourceType.Other];
}

export interface ResourceRequest {
  id?: number;
  code: string;
  aName: string;
  eName?: string;
  resourceType: ResourceType | string;
  costRate: number;
  rateUomType: UomType | string;
  unitOfMeasureId: number;
  notes?: string;
}

export interface ResourceResponse extends ResourceRequest {
  id: number;
  name: string;
  unitOfMeasureName?: string;
  isActive: boolean;
}

export interface ResourceBasicResponse {
  id: number;
  code: string;
  name: string;
  resourceType: ResourceType | string;
  costRate: number;
  rateUomType: UomType | string;
  unitOfMeasureId: number;
  unitOfMeasureName?: string;
  isActive: boolean;
  notes?: string;
}

export interface ResourceFilters extends RequestFilters {
  resourceType?: ResourceType | string | null;
  rateUomType?: UomType | string | null;
}
