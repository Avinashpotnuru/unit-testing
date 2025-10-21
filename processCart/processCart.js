function processCart(items, options = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Items must be a non-empty array");
  }

  if (typeof options !== "object" || options === null) {
    throw new Error("Options must be an object");
  }

  const {
    discountCode = "",
    taxRate = 0,
    shippingMethod = "standard", // standard, express, pickup
    coupon = null,
  } = options;

  if (typeof discountCode !== "string") {
    throw new Error("Discount code must be a string");
  }

  if (typeof taxRate !== "number" || taxRate < 0) {
    throw new Error("Tax rate must be a non-negative number");
  }

  if (!["standard", "express", "pickup"].includes(shippingMethod)) {
    throw new Error("Invalid shipping method");
  }

  // Calculate subtotal
  const subtotal = items.reduce((acc, item) => {
    if (typeof item.price !== "number" || typeof item.quantity !== "number") {
      throw new Error("Each item must have numeric price and quantity");
    }
    return acc + item.price * item.quantity;
  }, 0);

  // Apply discount codes
  let discount = 0;
  switch (discountCode) {
    case "WELCOME10":
      discount = subtotal * 0.1;
      break;
    case "FREESHIP":
      discount = 50;
      break;
    case "BIGSALE":
      discount = subtotal > 500 ? 100 : 0;
      break;
    default:
      discount = 0;
  }

  // Apply coupon
  let couponValue = 0;
  if (coupon && typeof coupon === "object") {
    if (coupon.type === "flat") couponValue = coupon.amount;
    else if (coupon.type === "percent")
      couponValue = (subtotal * coupon.amount) / 100;
  }

  // Calculate tax
  const tax = (subtotal - discount - couponValue) * (taxRate / 100);

  // Shipping cost
  let shippingCost = 0;
  if (shippingMethod === "standard") shippingCost = 20;
  else if (shippingMethod === "express") shippingCost = 50;
  else if (shippingMethod === "pickup") shippingCost = 0;

  const total = subtotal - discount - couponValue + tax + shippingCost;

  return {
    subtotal,
    discount,
    couponValue,
    tax,
    shippingCost,
    total,
  };
}

module.exports = processCart;
