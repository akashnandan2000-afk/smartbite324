/**
 * Canteen Billing Configuration
 * Rule: NEVER apply invented tax rates.
 * Taxes and charges are ONLY applied when explicitly configured and enabled by the canteen.
 */
const DEFAULT_BILLING_CONFIG = {
  // Taxes are 0% by default unless explicitly configured by campus administration
  taxRatePercent: 0,
  taxName: "GST",
  enableTax: false,
  
  // Packaging fee is 0 by default
  takeawayPackagingFee: 0,
  enablePackagingFee: false,

  // Campus canteen details for digital receipts
  canteenName: "SmartBite Campus Canteen",
  institution: "Student Activity Center",
  counterLocation: "Ground Floor, Counter #1 & #2",
  fssaiNumber: "FSSAI-CAMPUS-2024-9981",
  gstin: "" // Blank unless registered and configured
};

export const getBillingConfig = () => {
  try {
    const saved = localStorage.getItem("smartbite_canteen_billing_config");
    return saved ? { ...DEFAULT_BILLING_CONFIG, ...JSON.parse(saved) } : DEFAULT_BILLING_CONFIG;
  } catch {
    return DEFAULT_BILLING_CONFIG;
  }
};

export const updateBillingConfig = (newConfig) => {
  try {
    const updated = { ...getBillingConfig(), ...newConfig };
    localStorage.setItem("smartbite_canteen_billing_config", JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_BILLING_CONFIG;
  }
};

/**
 * Calculates bill breakdown strictly adhering to canteen configuration.
 * Never applies invented tax rates.
 *
 * Example:
 * Chicken Biriyani x 1 = ₹100
 * Tea x 2 = ₹20
 * Porotta x 2 = ₹24
 * Subtotal = ₹144
 */
export const calculateBill = ({ items = [], orderType = "dinein", discount = 0, configOverride = null }) => {
  const config = configOverride || getBillingConfig();

  // 1. Calculate items subtotal
  const lineItems = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const itemTotal = price * qty;
    return {
      ...item,
      quantity: qty,
      price,
      total: itemTotal
    };
  });

  const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);

  // 2. Applicable tax: ONLY if enabled and configured (> 0%) by canteen
  let taxAmount = 0;
  let taxDetails = null;
  if (config.enableTax && config.taxRatePercent > 0) {
    taxAmount = Math.round((subtotal * config.taxRatePercent) / 100);
    taxDetails = {
      name: config.taxName || "Configured Tax",
      rate: config.taxRatePercent,
      amount: taxAmount
    };
  }

  // 3. Applicable packaging charge: ONLY if enabled and configured (> 0) and order is takeaway
  let packagingCharge = 0;
  if (orderType === "takeaway" && config.enablePackagingFee && config.takeawayPackagingFee > 0) {
    packagingCharge = config.takeawayPackagingFee;
  }

  // 4. Calculate final Grand Total
  const finalDiscount = Math.min(subtotal, Math.max(0, Number(discount) || 0));
  const grandTotal = Math.max(0, subtotal + taxAmount + packagingCharge - finalDiscount);

  return {
    lineItems,
    subtotal,
    taxAmount,
    taxDetails,
    packagingCharge,
    discountAmount: finalDiscount,
    grandTotal,
    hasAdditionalCharges: taxAmount > 0 || packagingCharge > 0,
    config
  };
};

