/**
 * UniCafe Quick Test Runner
 *
 * A simplified test runner that can be executed without additional dependencies.
 * Run with: node tests/runTests.js
 */

import http from "http";
import https from "https";

const API_BASE = "http://localhost:3000";

// Simple fetch implementation for Node.js without external deps
function simpleFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "https:" ? https : http;

    const req = client.request(
      parsedUrl,
      {
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            json: () => {
              try {
                return Promise.resolve(JSON.parse(data));
              } catch (e) {
                return Promise.resolve({ error: "Invalid JSON", raw: data });
              }
            },
            text: () => Promise.resolve(data),
          });
        });
      }
    );

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test data
const timestamp = Date.now();
const testUser = {
  username: `test_${timestamp}`,
  email: `test_${timestamp}@test.com`,
  password: "TestPassword123",
  phone: "09123456789",
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  bugs: [],
};

// Test runner helper
async function runTest(name, testFn) {
  process.stdout.write(`  Testing: ${name}... `);
  try {
    const result = await testFn();
    if (result.passed) {
      results.passed++;
      console.log("✅ PASS");
    } else {
      results.failed++;
      console.log("❌ FAIL");
      console.log(`    Expected: ${result.expected}`);
      console.log(`    Actual: ${result.actual}`);
      if (result.bug) {
        results.bugs.push({ name, bug: result.bug });
      }
    }
  } catch (error) {
    results.failed++;
    console.log("💥 ERROR");
    console.log(`    ${error.message}`);
    results.bugs.push({ name, bug: `Exception: ${error.message}` });
  }
}

// ============================================================================
// TESTS
// ============================================================================

async function runAllTests() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║           UniCafe System Test Suite                            ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  // Check if server is running
  console.log("📡 Checking server connectivity...");
  try {
    const healthResp = await simpleFetch(`${API_BASE}/`);
    const health = await healthResp.json();
    if (healthResp.status !== 200 || health.status !== "running") {
      console.log("❌ Server not running or unhealthy!");
      console.log("   Please start the server: cd backend && node server.js\n");
      return;
    }
    console.log("✅ Server is running\n");
  } catch (e) {
    console.log("❌ Cannot connect to server!");
    console.log("   Please start the server: cd backend && node server.js\n");
    return;
  }

  // ========== AUTHENTICATION TESTS ==========
  console.log("\n🔐 AUTHENTICATION TESTS");
  console.log("─".repeat(50));

  await runTest("Registration with valid data", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });
    const data = await resp.json();
    return {
      passed: resp.status === 201 && data.token,
      expected: "Status 201 with token",
      actual: `Status ${resp.status}, token: ${
        data.token ? "present" : "missing"
      }`,
      bug: resp.status !== 201 ? "Registration may have issues" : null,
    };
  });

  await runTest("Registration without username fails", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@test.com",
        password: "123456",
        phone: "09123456789",
      }),
    });
    return {
      passed: resp.status === 400,
      expected: "Status 400",
      actual: `Status ${resp.status}`,
      bug: resp.status !== 400 ? "BUG: Missing username not validated" : null,
    };
  });

  await runTest("Registration with short password fails", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `short_${Date.now()}`,
        email: `short_${Date.now()}@test.com`,
        password: "12345",
        phone: "09123456789",
      }),
    });
    return {
      passed: resp.status === 400,
      expected: "Status 400 (password < 6 chars)",
      actual: `Status ${resp.status}`,
      bug: resp.status !== 400 ? "BUG: Short password accepted" : null,
    };
  });

  await runTest("Login with wrong password fails", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: "WrongPassword",
      }),
    });
    return {
      passed: resp.status === 401,
      expected: "Status 401",
      actual: `Status ${resp.status}`,
      bug: resp.status === 200 ? "CRITICAL: Wrong password accepted!" : null,
    };
  });

  await runTest("Protected endpoint without token fails", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/auth/profile`);
    return {
      passed: resp.status === 401,
      expected: "Status 401",
      actual: `Status ${resp.status}`,
      bug:
        resp.status === 200
          ? "CRITICAL: Protected endpoint accessible without auth!"
          : null,
    };
  });

  await runTest("SQL Injection prevention", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "' OR '1'='1", password: "' OR '1'='1" }),
    });
    return {
      passed: resp.status !== 200,
      expected: "Not status 200",
      actual: `Status ${resp.status}`,
      bug:
        resp.status === 200 ? "CRITICAL: SQL Injection vulnerability!" : null,
    };
  });

  // ========== ADMIN AUTH TESTS ==========
  console.log("\n👨‍💼 ADMIN AUTHENTICATION TESTS");
  console.log("─".repeat(50));

  await runTest("Admin login endpoint", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/cafe/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin123", password: "admin123" }),
    });
    const data = await resp.json();
    return {
      passed: resp.status === 200 || resp.status === 401,
      expected: "200 (success) or 401 (admin not set up)",
      actual: `Status ${resp.status}`,
      bug: null,
    };
  });

  // ========== PRODUCTS TESTS ==========
  console.log("\n📦 PRODUCTS TESTS");
  console.log("─".repeat(50));

  await runTest("Get all products", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/products`);
    const data = await resp.json();
    return {
      passed: resp.status === 200 && Array.isArray(data),
      expected: "Status 200 with array",
      actual: `Status ${resp.status}, isArray: ${Array.isArray(data)}`,
      bug: !Array.isArray(data) ? "BUG: Products not returning array" : null,
    };
  });

  await runTest("Filter products by category", async () => {
    const resp = await simpleFetch(
      `${API_BASE}/api/customer/products?category=Drinks`
    );
    const data = await resp.json();
    const allDrinks =
      Array.isArray(data) && data.every((p) => p.product_category === "Drinks");
    return {
      passed: resp.status === 200 && (data.length === 0 || allDrinks),
      expected: "All products are Drinks",
      actual: `${data.length} products, allDrinks: ${allDrinks}`,
      bug:
        !allDrinks && data.length > 0
          ? "BUG: Category filter not working"
          : null,
    };
  });

  await runTest("Non-existent product returns 404", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/products/999999`);
    return {
      passed: resp.status === 404,
      expected: "Status 404",
      actual: `Status ${resp.status}`,
      bug:
        resp.status !== 404
          ? "BUG: Invalid product ID not returning 404"
          : null,
    };
  });

  await runTest("Products have valid prices", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/products`);
    const data = await resp.json();
    const invalidPrices = Array.isArray(data)
      ? data.filter((p) => p.product_price <= 0)
      : [];
    return {
      passed: invalidPrices.length === 0,
      expected: "All prices > 0",
      actual: `${invalidPrices.length} invalid prices`,
      bug:
        invalidPrices.length > 0
          ? "BUG: Some products have invalid prices"
          : null,
    };
  });

  // ========== ORDERS TESTS ==========
  console.log("\n🛒 ORDERS TESTS");
  console.log("─".repeat(50));

  await runTest("Create order requires authentication", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }] }),
    });
    return {
      passed: resp.status === 401,
      expected: "Status 401",
      actual: `Status ${resp.status}`,
      bug:
        resp.status !== 401
          ? "CRITICAL: Orders can be created without auth!"
          : null,
    };
  });

  await runTest("Get orders requires authentication", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/orders`);
    return {
      passed: resp.status === 401,
      expected: "Status 401",
      actual: `Status ${resp.status}`,
      bug: resp.status !== 401 ? "BUG: Orders accessible without auth" : null,
    };
  });

  await runTest("Admin can view all orders", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/cafe/orders`);
    const data = await resp.json();
    return {
      passed: resp.status === 200 && Array.isArray(data),
      expected: "Status 200 with array",
      actual: `Status ${resp.status}`,
      bug: resp.status !== 200 ? "Admin orders endpoint issue" : null,
    };
  });

  await runTest("Invalid order status rejected", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/cafe/orders/1/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "invalid_status_xyz" }),
    });
    return {
      passed: resp.status === 400 || resp.status === 404,
      expected: "Status 400 or 404",
      actual: `Status ${resp.status}`,
      bug: resp.status === 200 ? "BUG: Invalid status values accepted" : null,
    };
  });

  // ========== PAYMENTS TESTS ==========
  console.log("\n💳 PAYMENTS TESTS");
  console.log("─".repeat(50));

  await runTest("Payment link requires authentication", async () => {
    const resp = await simpleFetch(
      `${API_BASE}/api/customer/payments/create-link`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }] }),
      }
    );
    return {
      passed: resp.status === 401,
      expected: "Status 401",
      actual: `Status ${resp.status}`,
      bug: resp.status !== 401 ? "CRITICAL: Payment links without auth!" : null,
    };
  });

  await runTest("OTP verification requires all fields", async () => {
    const resp = await simpleFetch(
      `${API_BASE}/api/customer/payments/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: 1 }),
      }
    );
    return {
      passed: resp.status === 400,
      expected: "Status 400 (missing fields)",
      actual: `Status ${resp.status}`,
      bug:
        resp.status !== 400 ? "BUG: OTP verification missing validation" : null,
    };
  });

  // ========== ERROR HANDLING TESTS ==========
  console.log("\n⚠️ ERROR HANDLING TESTS");
  console.log("─".repeat(50));

  await runTest("404 for non-existent routes", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/nonexistent/route`);
    return {
      passed: resp.status === 404,
      expected: "Status 404",
      actual: `Status ${resp.status}`,
      bug: resp.status !== 404 ? "BUG: Non-existent routes not 404" : null,
    };
  });

  await runTest("Invalid JSON handling", async () => {
    const resp = await simpleFetch(`${API_BASE}/api/customer/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not valid json{",
    });
    return {
      passed: resp.status === 400 || resp.status === 500,
      expected: "Status 400 or 500",
      actual: `Status ${resp.status}`,
      bug: null,
    };
  });

  // ========== RESULTS SUMMARY ==========
  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                    TEST RESULTS SUMMARY                         ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  const total = results.passed + results.failed;
  const passRate = ((results.passed / total) * 100).toFixed(1);

  console.log(`  📊 Total Tests: ${total}`);
  console.log(`  ✅ Passed: ${results.passed}`);
  console.log(`  ❌ Failed: ${results.failed}`);
  console.log(`  📈 Pass Rate: ${passRate}%`);

  if (results.bugs.length > 0) {
    console.log("\n  🐛 BUGS/ISSUES FOUND:");
    console.log("  " + "─".repeat(50));
    results.bugs.forEach((item, idx) => {
      console.log(`\n  ${idx + 1}. ${item.name}`);
      console.log(`     └─ ${item.bug}`);
    });
  } else {
    console.log("\n  ✨ No critical bugs found!");
  }

  console.log("\n" + "═".repeat(66) + "\n");
}

// Run tests
runAllTests().catch(console.error);
