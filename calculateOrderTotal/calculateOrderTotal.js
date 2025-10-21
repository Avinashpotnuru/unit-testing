function calculateOrderTotal(items, options = {}) {
  // Validate items
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Items must be a non-empty array");
  }

  // Validate options
  if (
    typeof options !== "object" ||
    options === null ||
    Array.isArray(options)
  ) {
    throw new Error("Options must be an object");
  }

  const { discountCode = "", taxRate = 0 } = options;

  // Validate discountCode
  if (discountCode && typeof discountCode !== "string") {
    throw new Error("Discount code must be a string");
  }

  // Validate taxRate
  if (typeof taxRate !== "number" || taxRate < 0) {
    throw new Error("Tax rate must be a non-negative number");
  }

  // Step 1: Calculate subtotal
  const subtotal = items.reduce((acc, item) => {
    if (typeof item.price !== "number" || typeof item.quantity !== "number") {
      throw new Error("Price and quantity must be numbers");
    }
    if (item.price < 0 || item.quantity < 0) {
      throw new Error("Invalid price or quantity");
    }
    return acc + item.price * item.quantity;
  }, 0);

  // Step 2: Apply discount
  let discount = 0;
  switch (discountCode) {
    case "WELCOME10":
      discount = subtotal * 0.1;
      break;
    case "FREESHIP":
      discount = 50;
      break;
    case "BIGSALE":
      discount = subtotal > 1000 ? subtotal * 0.2 : 0;
      break;
    default:
      discount = 0;
  }

  // Step 3: Apply tax
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * (taxRate / 100);

  // Step 4: Calculate total
  const total = taxableAmount + tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

module.exports = calculateOrderTotal;
