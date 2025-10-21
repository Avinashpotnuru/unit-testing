const processCart = require("./processCart");

describe("processCart", () => {
  // --- Validation Errors ---
  test("should throw error if items is not a non-empty array", () => {
    expect(() => processCart()).toThrow("Items must be a non-empty array");
    expect(() => processCart([])).toThrow("Items must be a non-empty array");
  });

  test("should throw error if options is not an object", () => {
    expect(() => processCart([{ price: 10, quantity: 1 }], 123)).toThrow(
      "Options must be an object"
    );
    expect(() => processCart([{ price: 10, quantity: 1 }], null)).toThrow(
      "Options must be an object"
    );
  });

  test("should throw error for invalid data types", () => {
    expect(() => processCart([{ price: "ten", quantity: 2 }])).toThrow(
      "Each item must have numeric price and quantity"
    );

    expect(() =>
      processCart([{ price: 10, quantity: 2 }], { discountCode: 10 })
    ).toThrow("Discount code must be a string");

    expect(() =>
      processCart([{ price: 10, quantity: 2 }], { taxRate: -5 })
    ).toThrow("Tax rate must be a non-negative number");

    expect(() =>
      processCart([{ price: 10, quantity: 2 }], { shippingMethod: "air" })
    ).toThrow("Invalid shipping method");
  });

  // --- Subtotal ---
  test("should calculate subtotal correctly", () => {
    const items = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
    ];
    const result = processCart(items);
    expect(result.subtotal).toBe(250);
  });

  // --- Discount Codes ---
  test("should apply discount correctly for all codes", () => {
    const items = [{ price: 100, quantity: 1 }];

    const welcome = processCart(items, { discountCode: "WELCOME10" });
    expect(welcome.discount).toBe(10);

    const freeship = processCart(items, { discountCode: "FREESHIP" });
    expect(freeship.discount).toBe(50);

    const bigsaleOver500 = processCart([{ price: 600, quantity: 1 }], {
      discountCode: "BIGSALE",
    });
    expect(bigsaleOver500.discount).toBe(100);

    const bigsaleUnder500 = processCart([{ price: 300, quantity: 1 }], {
      discountCode: "BIGSALE",
    });
    expect(bigsaleUnder500.discount).toBe(0);

    const unknown = processCart(items, { discountCode: "INVALID" });
    expect(unknown.discount).toBe(0);
  });

  // --- Coupons ---
  test("should apply coupon correctly for flat and percent", () => {
    const items = [{ price: 200, quantity: 1 }];

    const flatCoupon = processCart(items, {
      coupon: { type: "flat", amount: 20 },
    });
    expect(flatCoupon.couponValue).toBe(20);

    const percentCoupon = processCart(items, {
      coupon: { type: "percent", amount: 10 },
    });
    expect(percentCoupon.couponValue).toBe(20);
  });

  test("should handle invalid or null coupon gracefully", () => {
    const items = [{ price: 100, quantity: 1 }];

    const noCoupon = processCart(items);
    expect(noCoupon.couponValue).toBe(0);

    const invalidCoupon = processCart(items, { coupon: "INVALID" });
    expect(invalidCoupon.couponValue).toBe(0);
  });

  // --- Tax ---
  test("should calculate tax correctly", () => {
    const items = [{ price: 100, quantity: 1 }];
    const result = processCart(items, { taxRate: 10 });
    expect(result.tax).toBe(10);
  });

  // --- Shipping ---
  test("should apply correct shipping cost for all methods", () => {
    const items = [{ price: 100, quantity: 1 }];

    const standard = processCart(items, { shippingMethod: "standard" });
    expect(standard.shippingCost).toBe(20);

    const express = processCart(items, { shippingMethod: "express" });
    expect(express.shippingCost).toBe(50);

    const pickup = processCart(items, { shippingMethod: "pickup" });
    expect(pickup.shippingCost).toBe(0);
  });

  // --- Total Calculation ---
  test("should calculate total correctly with all factors combined", () => {
    const items = [{ price: 200, quantity: 1 }];
    const result = processCart(items, {
      discountCode: "WELCOME10",
      taxRate: 10,
      shippingMethod: "express",
      coupon: { type: "flat", amount: 20 },
    });
    // subtotal = 200
    // discount = 20
    // coupon = 20
    // taxable = 160
    // tax = 16
    // shipping = 50
    // total = 226
    expect(result.total).toBe(226);
  });

  test("should handle default path correctly (no discount, no coupon, no tax)", () => {
    const result = processCart([{ price: 50, quantity: 2 }]);
    // subtotal = 100
    // no discount/coupon/tax
    // shipping = 20
    // total = 120
    expect(result).toEqual({
      subtotal: 100,
      discount: 0,
      couponValue: 0,
      tax: 0,
      shippingCost: 20,
      total: 120,
    });
  });
});
