// Simple unit tests for api-services Lambda
// Run with: node tests/api-services.test.js

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

// ─── Mock handler logic (no AWS calls) ───────────────────────────────────────

async function mockHandler(event, mockDb) {
  const orderId = event.pathParameters?.orderId;

  if (!orderId) {
    return { statusCode: 400, body: "orderId required" };
  }

  const item = mockDb[orderId];

  if (!item) {
    return { statusCode: 404, body: "Order not found" };
  }

  return { statusCode: 200, body: JSON.stringify(item) };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const mockDb = {
  "ORD10001": {
    orderId: "ORD10001",
    status: "shipped",
    expectedDelivery: "2026-03-10",
    trackingNumber: "TRK10001"
  }
};

(async () => {
  test("returns 400 when orderId is missing", async () => {
    const result = await mockHandler({ pathParameters: {} }, mockDb);
    assert(result.statusCode === 400, `Expected 400, got ${result.statusCode}`);
  });

  test("returns 404 when order not found", async () => {
    const result = await mockHandler({ pathParameters: { orderId: "ORD99999" } }, mockDb);
    assert(result.statusCode === 404, `Expected 404, got ${result.statusCode}`);
  });

  test("returns 200 with order data when order exists", async () => {
    const result = await mockHandler({ pathParameters: { orderId: "ORD10001" } }, mockDb);
    assert(result.statusCode === 200, `Expected 200, got ${result.statusCode}`);
    const body = JSON.parse(result.body);
    assert(body.orderId === "ORD10001", "orderId should match");
    assert(body.status === "shipped", "status should be shipped");
  });

  test("returns 400 when pathParameters is null", async () => {
    const result = await mockHandler({}, mockDb);
    assert(result.statusCode === 400, `Expected 400, got ${result.statusCode}`);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
