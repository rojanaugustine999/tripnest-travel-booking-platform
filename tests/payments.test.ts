import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { bindingToken, getRazorpayConfig, paymentSignature } from "../src/lib/payments/razorpay";
import { confirmPaymentSchema } from "../src/features/payments/validation";

afterEach(() => vi.unstubAllEnvs());

describe("Razorpay config (test mode only)", () => {
  it("is off when keys are missing", () => {
    vi.stubEnv("RAZORPAY_KEY_ID", "");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "");
    expect(getRazorpayConfig()).toBeNull();
  });
  it("accepts a test key", () => {
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_abc123");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "secret");
    expect(getRazorpayConfig()).toEqual({ keyId: "rzp_test_abc123", keySecret: "secret" });
  });
  it("refuses a LIVE key, so real money can never move", () => {
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_live_abc123");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "secret");
    expect(getRazorpayConfig()).toBeNull();
  });
});

describe("payment signatures", () => {
  // Same values the database was checked with (extensions.hmac in Postgres gave this exact result).
  it("matches the HMAC-SHA256 of order_id|payment_id", () => {
    expect(paymentSignature("secret123", "order_X", "pay_Y")).toBe(
      "0ca40be08698f25c45485ea37d75952888b2d06d27d0255fdb0c1fe6380f6c05",
    );
  });
  it("binds an order to one booking and one amount", () => {
    const a = bindingToken("s", "order_1", "TN-AAAAAAAA", 10000);
    expect(bindingToken("s", "order_1", "TN-AAAAAAAA", 10000)).toBe(a);
    expect(bindingToken("s", "order_2", "TN-AAAAAAAA", 10000)).not.toBe(a);
    expect(bindingToken("s", "order_1", "TN-BBBBBBBB", 10000)).not.toBe(a);
    expect(bindingToken("s", "order_1", "TN-AAAAAAAA", 100)).not.toBe(a);
    expect(bindingToken("other", "order_1", "TN-AAAAAAAA", 10000)).not.toBe(a);
  });
});

describe("confirm payment input", () => {
  const good = {
    reference: "TN-ABCD1234",
    orderId: "order_abc12345",
    paymentId: "pay_abc12345",
    signature: "a".repeat(64),
    amountPaise: 1495200,
    binding: "b".repeat(64),
  };
  it("accepts a well-formed payload", () => expect(confirmPaymentSchema.safeParse(good).success).toBe(true));
  it.each([
    ["a bad reference", { reference: "TN-1" }],
    ["a zero amount", { amountPaise: 0 }],
    ["a fractional amount", { amountPaise: 10.5 }],
    ["a negative amount", { amountPaise: -5 }],
    ["an oversized id", { orderId: "o".repeat(500) }],
  ])("rejects %s", (_name, over) => expect(confirmPaymentSchema.safeParse({ ...good, ...over }).success).toBe(false));
});
