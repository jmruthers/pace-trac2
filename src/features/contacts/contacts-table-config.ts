import type { DataTableFeatureConfig } from '@solvera/pace-core/components';

/** Read-only DataTable profile for master plan contact list (print-friendly, no toolbar). */
export const MASTER_PLAN_CONTACTS_TABLE_FEATURES: DataTableFeatureConfig = {
  search: false,
  pagination: false,
  sorting: false,
  filtering: false,
  import: false,
  export: false,
  selection: false,
  creation: false,
  editing: false,
  deletion: false,
  deleteSelected: false,
  grouping: false,
  columnVisibility: false,
  columnReordering: false,
  hierarchical: false,
  rowExpansion: false,
};
