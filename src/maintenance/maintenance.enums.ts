/** Overall condition of the station's facilities as judged by the manager on site. */
export enum StationCondition {
  GOOD = 'good',
  FAIR = 'fair',
  FAULTY = 'faulty',
}

/** Condition of one pump at the time of a health check. */
export enum PumpCondition {
  OK = 'ok',
  FAULTY = 'faulty',
  OUT_OF_SERVICE = 'out_of_service',
}

export enum RepairPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  /** High / urgent: the facility is unusable or unsafe. */
  HIGH = 'high',
}

export enum RepairStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  DENIED = 'denied',
  /** The director has seen it and chosen to take no action for now. */
  IGNORED = 'ignored',
}

/** Decisions a director may record; each maps to a terminal status. */
export enum RepairDecision {
  AUTHORIZE = 'authorize',
  DENY = 'deny',
  IGNORE = 'ignore',
}

export const DECISION_STATUS: Record<RepairDecision, RepairStatus> = {
  [RepairDecision.AUTHORIZE]: RepairStatus.AUTHORIZED,
  [RepairDecision.DENY]: RepairStatus.DENIED,
  [RepairDecision.IGNORE]: RepairStatus.IGNORED,
};
