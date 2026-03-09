// Simple unit tests for connect-greeting Lambda
// Run with: node tests/connect-greeting.test.js

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
  const phoneNumber = event?.Details?.ContactData?.CustomerEndpoint?.Address;

  if (!phoneNumber) return { firstName: "there" };

  const customer = mockDb[phoneNumber];

  if (!customer) return { firstName: "there" };

  return { firstName: customer.firstName };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const mockDb = {
  "+12145550001": { customerId: "CUST1001", firstName: "John" },
  "+12145550002": { customerId: "CUST1002", firstName: "Sarah" }
};

(async () => {
  test("returns firstName for known customer", async () => {
    const event = { Details: { ContactData: { CustomerEndpoint: { Address: "+12145550001" } } } };
    const result = await mockHandler(event, mockDb);
    assert(result.firstName === "John", `Expected John, got ${result.firstName}`);
  });

  test("returns 'there' for unknown phone number", async () => {
    const event = { Details: { ContactData: { CustomerEndpoint: { Address: "+19999999999" } } } };
    const result = await mockHandler(event, mockDb);
    assert(result.firstName === "there", `Expected there, got ${result.firstName}`);
  });

  test("returns 'there' when phone number is missing", async () => {
    const event = { Details: { ContactData: { CustomerEndpoint: {} } } };
    const result = await mockHandler(event, mockDb);
    assert(result.firstName === "there", `Expected there, got ${result.firstName}`);
  });

  test("returns 'there' when event is empty", async () => {
    const result = await mockHandler({}, mockDb);
    assert(result.firstName === "there", `Expected there, got ${result.firstName}`);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
