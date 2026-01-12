describe("Stripe – Idempotency key payment scenarios", () => {

  beforeEach(() => {
    expect(Cypress.env("STRIPE_SECRET_KEY"), "Stripe secret key").to.exist;
  });

  const sendPaymentWithIdempotencyKey = (body, idempotencyKey) => {
    return cy.request({
      method: "POST",
      url: "/payment_intents",
      headers: {
        Authorization: `Bearer ${Cypress.env("STRIPE_SECRET_KEY")}`,
        "Idempotency-Key": idempotencyKey
      },
      form: true,
      body
    });
  };

  it("T401 – Payment succeeds with idempotency key", () => {
    const idempotencyKey = `idem-key-${Date.now()}`;

    cy.fixture("stripeRequestBodies").then(({ paymentWithIdempotencyKeySuccessful }) => {

      sendPaymentWithIdempotencyKey(
        paymentWithIdempotencyKeySuccessful,
        idempotencyKey
      ).then((res) => {

        expect(res.status).to.eq(200);
        expect(res.body.object).to.eq("payment_intent");
        expect(res.body.status).to.eq("succeeded");
        expect(res.body.amount).to.eq(700);

        cy.wrap(res.body.id).as("paymentIntentId");
      });
    });
  });

  it("T402 – Duplicate request with same idempotency key returns same result", () => {
    const idempotencyKey = `idem-key-duplicate-${Date.now()}`;

    cy.fixture("stripeRequestBodies").then(({ paymentWithIdempotencyKeyDuplicate }) => {

      sendPaymentWithIdempotencyKey(
        paymentWithIdempotencyKeyDuplicate,
        idempotencyKey
      ).then((firstRes) => {

        expect(firstRes.status).to.eq(200);

        sendPaymentWithIdempotencyKey(
          paymentWithIdempotencyKeyDuplicate,
          idempotencyKey
        ).then((secondRes) => {

          expect(secondRes.status).to.eq(200);
          expect(secondRes.body.id).to.eq(firstRes.body.id);
          expect(secondRes.body.amount).to.eq(firstRes.body.amount);
          expect(secondRes.body.status).to.eq(firstRes.body.status);
        });
      });
    });
  });

});
