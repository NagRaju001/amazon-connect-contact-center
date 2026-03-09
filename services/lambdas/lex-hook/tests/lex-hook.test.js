// Simple unit tests for lex-hook Lambda
// Run with: node tests/lex-hook.test.js

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${name} — ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

// ─── Order number normalization logic (extracted from handler) ────────────────

const ORDER_PREFIX = process.env.ORDER_PREFIX || "ORD1";

function normalizeOrderNumber(rawOrderNumber) {
  if (!rawOrderNumber) return null;
  if (rawOrderNumber.toUpperCase().startsWith("ORD")) return rawOrderNumber.toUpperCase();
  if (/^\d+$/.test(rawOrderNumber)) return `${ORDER_PREFIX}${rawOrderNumber}`;
  return rawOrderNumber.toUpperCase();
}

function isValidOrderNumber(orderNumber, rawOrderNumber) {
  return orderNumber.startsWith("ORD") || /^\d+$/.test(rawOrderNumber);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

(async () => {

  // Order number normalization
  test("normalizes 4-digit input to full order ID", () => {
    const result = normalizeOrderNumber("0001");
    assert(result === "ORD10001", `Expected ORD10001, got ${result}`);
  });

  test("keeps full ORD-prefixed order ID as-is", () => {
    const result = normalizeOrderNumber("ORD10001");
    assert(result === "ORD10001", `Expected ORD10001, got ${result}`);
  });

  test("uppercases ORD-prefixed order ID", () => {
    const result = normalizeOrderNumber("ord10001");
    assert(result === "ORD10001", `Expected ORD10001, got ${result}`);
  });

  test("returns null for missing order number", () => {
    const result = normalizeOrderNumber(null);
    assert(result === null, `Expected null, got ${result}`);
  });

  test("returns null for undefined order number", () => {
    const result = normalizeOrderNumber(undefined);
    assert(result === null, `Expected null, got ${result}`);
  });

  // Validation
  test("validates ORD-prefixed order number as valid", () => {
    const result = isValidOrderNumber("ORD10001", "ORD10001");
    assert(result === true, "Expected valid order number");
  });

  test("validates numeric input as valid", () => {
    const result = isValidOrderNumber("ORD10001", "0001");
    assert(result === true, "Expected valid order number");
  });

  test("rejects non-numeric non-ORD input as invalid", () => {
    const result = isValidOrderNumber("BYE", "bye");
    assert(result === false, "Expected invalid order number");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
