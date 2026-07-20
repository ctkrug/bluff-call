export const STARTING_BALANCE = 20;

const STORAGE_KEY = "bluff-call:bankroll:v1";

export interface BankrollState {
  readonly balance: number;
  readonly startingBalance: number;
}

export function createBankroll(startingBalance: number = STARTING_BALANCE): BankrollState {
  return { balance: startingBalance, startingBalance };
}

/** Applies one hand's net chip change (see resolveHand) to the bankroll. */
export function applyHandResult(state: BankrollState, playerNet: number): BankrollState {
  return { ...state, balance: state.balance + playerNet };
}

/** Minimal storage shape so callers can pass sessionStorage or a test double. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function saveBankroll(state: BankrollState, storage: KeyValueStorage): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // A completed hand remains playable when browser storage is unavailable.
  }
}

function isValidBankrollState(value: unknown): value is BankrollState {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.balance === "number" &&
    Number.isFinite(record.balance) &&
    typeof record.startingBalance === "number" &&
    Number.isFinite(record.startingBalance)
  );
}

/**
 * Loads bankroll state from storage. Missing, malformed, or corrupted stored
 * values fall back to a fresh bankroll rather than throwing — a blank or
 * broken screen is never an acceptable failure mode for a boundary read.
 */
export function loadBankroll(
  storage: KeyValueStorage,
  fallback: BankrollState = createBankroll(),
): BankrollState {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return fallback;
  }
  if (!raw) return fallback;

  try {
    const parsed: unknown = JSON.parse(raw);
    return isValidBankrollState(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
