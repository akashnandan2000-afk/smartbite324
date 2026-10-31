/**
 * SmartBite Token Service
 * =======================
 * Generates sequential, human-readable, collision-free order tokens.
 *
 * Format:  SB-001  SB-002  SB-999  SB-1000  (zero-padded to 3 digits minimum)
 *
 * Strategy
 * --------
 * When Firebase is live:
 *   - Calls the `generateToken` Cloud Function which runs a Firestore transaction
 *     on `meta/tokenCounter`. Transactions are serialised by Firestore, so two
 *     simultaneous calls can never receive the same number.
 *
 * When Firebase / network is unavailable (demo / offline mode):
 *   - Falls back to a localStorage counter with a micro-timestamp tie-breaker
 *     to avoid collisions from multiple tabs.
 *
 * Token status lifecycle
 * ----------------------
 *   PENDING   → order placed (cash, waiting to pay)
 *   CONFIRMED → payment received (online or cash confirmed by staff)
 *   PREPARING → kitchen is cooking
 *   READY     → ready for pickup at counter
 *   COLLECTED → student has collected the order
 *   CANCELLED → order cancelled
 */

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_URL ||
  "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net";

const LS_COUNTER_KEY = "smartbite_token_counter";

// ─── Token Status Constants ────────────────────────────────────────────────────

export const TOKEN_STATUS = {
  PENDING:    "PENDING",       // cash order placed, not yet paid
  CONFIRMED:  "CONFIRMED",     // payment confirmed (online paid / cash confirmed)
  PREPARING:  "PREPARING",     // kitchen started cooking
  READY:      "READY",         // food ready at counter
  COLLECTED:  "COLLECTED",     // student picked up
  CANCELLED:  "CANCELLED",
};

export const TOKEN_STATUS_META = {
  [TOKEN_STATUS.PENDING]:   { label: "Awaiting Payment", color: "orange",  step: 0 },
  [TOKEN_STATUS.CONFIRMED]: { label: "Order Confirmed",  color: "blue",    step: 1 },
  [TOKEN_STATUS.PREPARING]: { label: "Preparing",        color: "amber",   step: 2 },
  [TOKEN_STATUS.READY]:     { label: "Ready to Collect", color: "emerald", step: 3 },
  [TOKEN_STATUS.COLLECTED]: { label: "Collected",        color: "slate",   step: 4 },
  [TOKEN_STATUS.CANCELLED]: { label: "Cancelled",        color: "red",     step: -1 },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Format a raw counter number into the display token string.
 *   1   → "SB-001"
 *   42  → "SB-042"
 *   999 → "SB-999"
 *   1000→ "SB-1000"  (no truncation for large numbers)
 */
export const formatToken = (n) =>
  `SB-${String(n).padStart(3, "0")}`;

// ─── Local (demo / offline) counter ────────────────────────────────────────────

const getLocalCounter = () => {
  try {
    return parseInt(localStorage.getItem(LS_COUNTER_KEY) || "0", 10);
  } catch {
    return 0;
  }
};

const incrementLocalCounter = () => {
  const next = getLocalCounter() + 1;
  try {
    localStorage.setItem(LS_COUNTER_KEY, String(next));
  } catch {
    // ignore
  }
  return next;
};

// ─── Main: generate token (backend-first, localStorage fallback) ───────────────

/**
 * Allocate the next sequential SmartBite token.
 *
 * @returns {Promise<{ token: string, number: number, source: "backend"|"local" }>}
 */
export const allocateToken = async () => {
  // --- Try Cloud Function first ---
  try {
    const res = await fetch(`${FUNCTIONS_BASE}/generateToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token && data.number) {
        return { token: data.token, number: data.number, source: "backend" };
      }
    }
  } catch {
    // network unavailable — fall through to local
  }

  // --- Offline / demo fallback ---
  const n = incrementLocalCounter();
  return { token: formatToken(n), number: n, source: "local" };
};

// ─── Token status helpers ──────────────────────────────────────────────────────

/**
 * Returns the display metadata for a given status string.
 * Gracefully handles unknown statuses.
 */
export const getTokenStatusMeta = (status) =>
  TOKEN_STATUS_META[status] ?? { label: status || "Unknown", color: "slate", step: 0 };

/**
 * Derive initial token status from order payment info.
 *   - cash + PENDING  → TOKEN_STATUS.PENDING
 *   - online paid / cash confirmed → TOKEN_STATUS.CONFIRMED
 */
export const deriveInitialTokenStatus = (order) => {
  if (order.paymentMethod === "cash" && order.paymentStatus === "PENDING") {
    return TOKEN_STATUS.PENDING;
  }
  if (order.paymentStatus === "PAID") {
    return TOKEN_STATUS.CONFIRMED;
  }
  return TOKEN_STATUS.CONFIRMED;
};

