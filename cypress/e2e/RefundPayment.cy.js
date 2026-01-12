describe("Stripe – Refund scenarios (dynamic intents)", () => {

  beforeEach(() => {
    // Ensure the Stripe secret key is set
    expect(Cypress.env("STRIPE_SECRET_KEY"), "Stripe secret key").to.exist;
  });

  const createPaymentIntent = () => {
    // Create a payment intent to refund
    return cy.fixture("stripeRequestBodies").then(({ createPaymentSuccessful }) => {
      return cy.request({
        method: "POST",
        url: "/payment_intents",
        headers: {
          Authorization: `Bearer ${Cypress.env("STRIPE_SECRET_KEY")}`
        },
        form: true,
        body: createPaymentSuccessful
      }).then((res) => {
        expect(res.status).to.eq(200);
        return res.body.id;
      });
    });
  };

  const createRefund = (body) => {
    return cy.request({
      method: "POST",
      url: "/refunds",
      headers: {
        Authorization: `Bearer ${Cypress.env("STRIPE_SECRET_KEY")}`
      },
      form: true,
      failOnStatusCode: false,
      body
    });
  };

  it("T201 – Full refund succeeds", () => {
    createPaymentIntent().then((paymentIntentId) => {

      createRefund({ payment_intent: paymentIntentId }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.object).to.eq("refund");
        expect(res.body.status).to.eq("succeeded");
        expect(res.body.amount).to.be.greaterThan(0);
        expect(res.body.payment_intent).to.eq(paymentIntentId);
      });

    });
  });

  it("T202 – Partial refund succeeds", () => {
    createPaymentIntent().then((paymentIntentId) => {

      createRefund({ payment_intent: paymentIntentId, amount: 100 }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.object).to.eq("refund");
        expect(res.body.status).to.eq("succeeded");
        expect(res.body.amount).to.eq(100);
        expect(res.body.payment_intent).to.eq(paymentIntentId);
      });

    });
  });

  it("T203 – Duplicate refund fails", () => {
    createPaymentIntent().then((paymentIntentId) => {

      // First refund
      createRefund({ payment_intent: paymentIntentId }).then(() => {

        // Attempt duplicate refund
        createRefund({ payment_intent: paymentIntentId }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error.type).to.eq("invalid_request_error");
          expect(res.body.error.message).to.include("refunded");
        });

      });

    });
  });

  it("T204 – Invalid payment intent fails", () => {
    createRefund({ payment_intent: "pi_invalid_123" }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.error.type).to.eq("invalid_request_error");
    });
  });

});
