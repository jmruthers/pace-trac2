import type { DataTableFeatureConfig } from '@solvera/pace-core/components';

export const PLANNING_INITIAL_GROUPING = 'startDayKey';

export const PLANNING_TABLE_PAGE_SIZE = 25;

export const PLANNING_TABLE_FEATURES: DataTableFeatureConfig = {
  search: true,
  pagination: true,
  sorting: true,
  filtering: false,
  grouping: true,
  creation: true,
  editing: false,
  deletion: true,
  deleteSelected: false,
  import: false,
  export: true,
  selection: false,
  columnVisibility: true,
  columnReordering: false,
  hierarchical: false,
  rowExpansion: false,
};
