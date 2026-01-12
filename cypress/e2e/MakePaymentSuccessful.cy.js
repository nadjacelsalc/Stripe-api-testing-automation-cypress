describe("Stripe – Successful payment scenarios", () => {

  beforeEach(() => {
    expect(Cypress.env("STRIPE_SECRET_KEY"), "Stripe secret key").to.exist;
  });

  it("T001 – Create payment intent successfully (basic)", () => {
    cy.fixture("stripeRequestBodies").then((bodies) => {

      cy.request({
        method: "POST",
        url: "/payment_intents",
        headers: {
          Authorization: `Bearer ${Cypress.env("STRIPE_SECRET_KEY")}`
        },
        form: true,
        body: bodies.createPaymentSuccessful
      }).then((response) => {

        expect(response.status).to.eq(200);
        expect(response.body.object).to.eq("payment_intent");
        expect(response.body.amount).to.eq(200);
        expect(response.body.currency).to.eq("usd");
        expect(response.body.status).to.eq("succeeded");
      });
    });
  });

  it("T002 – Create payment intent with description", () => {
    cy.fixture("stripeRequestBodies").then((bodies) => {

      cy.request({
        method: "POST",
        url: "/payment_intents",
        headers: {
          Authorization: `Bearer ${Cypress.env("STRIPE_SECRET_KEY")}`
        },
        form: true,
        body: bodies.createPaymentWithDescription
      }).then((response) => {

        expect(response.status).to.eq(200);
        expect(response.body.object).to.eq("payment_intent");
        expect(response.body.amount).to.eq(350);
        expect(response.body.description).to.eq("Test payment with description");
        expect(response.body.status).to.eq("succeeded");
      });
    });
  });

  it("T003 – Create payment intent with metadata", () => {
    cy.fixture("stripeRequestBodies").then((bodies) => {

      cy.request({
        method: "POST",
        url: "/payment_intents",
        headers: {
          Authorization: `Bearer ${Cypress.env("STRIPE_SECRET_KEY")}`
        },
        form: true,
        body: bodies.createPaymentWithMetadata
      }).then((response) => {

        expect(response.status).to.eq(200);
        expect(response.body.object).to.eq("payment_intent");
        expect(response.body.amount).to.eq(450);
        expect(response.body.metadata.order_id).to.eq("ORD-12345");
        expect(response.body.metadata.customer_type).to.eq("qa-test");
        expect(response.body.status).to.eq("succeeded");
      });
    });
  });

});
