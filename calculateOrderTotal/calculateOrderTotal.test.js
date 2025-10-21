const calculateOrderTotal = require("./calculateOrderTotal");

describe("calculateOrderTotal", () => {
  // ------------------------------
  // Validation Tests
  // ------------------------------
  test("should throw an error if items is not an array or is empty", () => {
    expect(() => calculateOrderTotal()).toThrow(
      "Items must be a non-empty array"
    );
    expect(() => calculateOrderTotal(null)).toThrow(
      "Items must be a non-empty array"
    );
    expect(() => calculateOrderTotal([])).toThrow(
      "Items must be a non-empty array"
    );
  });

  test("should throw an error if options is not an object", () => {
    expect(() => calculateOrderTotal([{ price: 10, quantity: 1 }], 10)).toThrow(
      "Options must be an object"
    );
    expect(() =>
      calculateOrderTotal([{ price: 10, quantity: 1 }], "invalid")
    ).toThrow("Options must be an object");
    expect(() =>
      calculateOrderTotal([{ price: 10, quantity: 1 }], null)
    ).toThrow("Options must be an object");
    expect(() =>
      calculateOrderTotal([{ price: 10, quantity: 1 }], [1, 2])
    ).toThrow("Options must be an object");
  });

  test("should throw an error if discountCode is not a string", () => {
    const items = [{ price: 100, quantity: 1 }];
    expect(() => calculateOrderTotal(items, { discountCode: 123 })).toThrow(
      "Discount code must be a string"
    );
  });

  test("should throw an error if taxRate is not a number or negative", () => {
    const items = [{ price: 100, quantity: 1 }];
    expect(() => calculateOrderTotal(items, { taxRate: "10" })).toThrow(
      "Tax rate must be a non-negative number"
    );
    expect(() => calculateOrderTotal(items, { taxRate: -5 })).toThrow(
      "Tax rate must be a non-negative number"
    );
  });

  test("should throw an error if price or quantity is invalid", () => {
    const invalidItems1 = [{ price: "100", quantity: 2 }];
    const invalidItems2 = [{ price: 100, quantity: "2" }];
    const invalidItems3 = [{ price: -10, quantity: 1 }];
    const invalidItems4 = [{ price: 10, quantity: -1 }];

    expect(() => calculateOrderTotal(invalidItems1)).toThrow(
      "Price and quantity must be numbers"
    );
    expect(() => calculateOrderTotal(invalidItems2)).toThrow(
      "Price and quantity must be numbers"
    );
    expect(() => calculateOrderTotal(invalidItems3)).toThrow(
      "Invalid price or quantity"
    );
    expect(() => calculateOrderTotal(invalidItems4)).toThrow(
      "Invalid price or quantity"
    );
  });

  // ------------------------------
  // Calculation Tests
  // ------------------------------
  test("should calculate subtotal correctly", () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 20, quantity: 3 },
    ];
    const result = calculateOrderTotal(items);
    expect(result.subtotal).toBe(10 * 2 + 20 * 3);
  });

  test("should apply no discount when no code is provided", () => {
    const items = [{ price: 100, quantity: 2 }];
    const result = calculateOrderTotal(items);
    expect(result.discount).toBe(0);
    expect(result.total).toBe(200);
  });

  test("should apply WELCOME10 discount (10%)", () => {
    const items = [{ price: 1000, quantity: 1 }];
    const result = calculateOrderTotal(items, { discountCode: "WELCOME10" });
    expect(result.discount).toBe(100);
    expect(result.total).toBe(900);
  });

  test("should apply FREESHIP discount (flat 50)", () => {
    const items = [{ price: 200, quantity: 1 }];
    const result = calculateOrderTotal(items, { discountCode: "FREESHIP" });
    expect(result.discount).toBe(50);
    expect(result.total).toBe(150);
  });

  test("should apply BIGSALE discount (20%) only if subtotal > 1000", () => {
    const lowSubtotal = [{ price: 800, quantity: 1 }];
    const highSubtotal = [{ price: 1200, quantity: 1 }];

    const result1 = calculateOrderTotal(lowSubtotal, {
      discountCode: "BIGSALE",
    });
    const result2 = calculateOrderTotal(highSubtotal, {
      discountCode: "BIGSALE",
    });

    expect(result1.discount).toBe(0);
    expect(result2.discount).toBe(240);
  });

  test("should apply tax correctly", () => {
    const items = [{ price: 1000, quantity: 1 }];
    const result = calculateOrderTotal(items, { taxRate: 10 });
    expect(result.tax).toBe(100);
    expect(result.total).toBe(1100);
  });

  test("should apply tax correctly after discount", () => {
    const items = [{ price: 1000, quantity: 1 }];
    const result = calculateOrderTotal(items, {
      discountCode: "WELCOME10",
      taxRate: 10,
    });
    // subtotal = 1000 → discount = 100 → taxable = 900 → tax = 90 → total = 990
    expect(result.tax).toBe(90);
    expect(result.total).toBe(990);
  });

  // ------------------------------
  // Edge Cases
  // ------------------------------
  test("should return values rounded to 2 decimals", () => {
    const items = [{ price: 333.3333, quantity: 1 }];
    const result = calculateOrderTotal(items, { taxRate: 7.5 });
    expect(result.subtotal).toBeCloseTo(333.33, 2);
    expect(result.tax).toBeCloseTo(25, 2);
  });

  test("should handle large totals correctly", () => {
    const items = [
      { price: 10000, quantity: 2 },
      { price: 5000, quantity: 3 },
    ];
    const result = calculateOrderTotal(items, {
      discountCode: "BIGSALE",
      taxRate: 18,
    });
    expect(result.total).toBeGreaterThan(0);
    expect(result.discount).toBeGreaterThan(0);
  });
});
