const displayName = require("./display");

describe("displayName", () => {
  test('should return "Anonymous" when both firstName and lastName are empty', () => {
    expect(displayName("", "")).toBe("Anonymous");
  });

  test("should return firstName when lastName is empty", () => {
    expect(displayName("John", "")).toBe("John");
  });

  test("should return lastName when firstName is empty", () => {
    expect(displayName("", "Doe")).toBe("Doe");
  });

  test("should return firstName and lastName when both are provided", () => {
    expect(displayName("John", "Doe")).toBe("John Doe");
  });
});

//add more tests to cover edge cases
test("should return 'Anonymous' when both names are just whitespace", () => {
  expect(displayName("   ", "   ")).toBe("Anonymous");
});
test("should trim whitespace from names", () => {
  expect(displayName("  John  ", "  Doe  ")).toBe("John Doe");
});
test("should handle null values for names", () => {
  expect(displayName(null, null)).toBe("Anonymous");
});
