export const accountFilterOptions = [
  { value: '1', label: 'Client' },
  { value: '2', label: 'Coordinator' },
  { value: '3', label: 'Owner' },
  { value: '4', label: 'Secretary' },
  { value: '5', label: 'Photographer' },
  { value: '6', label: 'Editor' },
] as const;

export const workloadFilterOptions = [
  { value: 'all', label: 'All' },
  { value: '0', label: 'Unassigned' },
  { value: '1', label: 'Scheduled' },
  { value: '2', label: 'Uploaded' },
  { value: '3', label: 'For Edit' },
  { value: '4', label: 'Editing' },
  { value: '5', label: 'For Release' },
  { value: '6', label: 'Completed' },
];

export const feedBackFilterOptions = [
  { value: '0', label: 'All' },
  { value: '1', label: 'Posted' },
  { value: '2', label: 'Unposted' },
  { value: '3', label: 'Pending' },
] as const;

export const categoryFilterOptions = [
  { value: '', label: 'All Categories' },
  { value: '0', label: 'Others' },
  { value: '1', label: 'Birthday' },
  { value: '2', label: 'Prenup' },
  { value: '3', label: 'Debut' },
  { value: '4', label: 'Wedding' },
] as const;

export type AccountFilterOption = typeof accountFilterOptions[number];
export type WorkloadFilterOption = typeof workloadFilterOptions[number];
export type FeedBackFilterOption = typeof feedBackFilterOptions[number];
export type CategoryFilterOption = typeof categoryFilterOptions[number];
