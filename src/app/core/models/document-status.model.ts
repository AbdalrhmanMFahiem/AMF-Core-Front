export enum DocumentStatus {
  Draft = 'Draft',
  Open = 'Open',
  Closed = 'Closed',
  Cancelled = 'Cancelled'
}

export enum ApprovalStatus {
  NotRequired = 'NotRequired',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Bounced = 'Bounced'
}

export enum PaidStatus {
  Unpaid = 'Unpaid',
  PartiallyPaid = 'PartiallyPaid',
  FullyPaid = 'FullyPaid'
}
