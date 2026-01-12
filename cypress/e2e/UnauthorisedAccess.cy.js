describe("Stripe – Unauthorized payment request", () => {

  it("T301 – Payment request without valid API key", () => {
    cy.fixture("stripeRequestBodies").then(({ unauthorizedPaymentRequest }) => {

      cy.request({
        method: "POST",
        url: "/payment_intents",
        form: true,
        failOnStatusCode: false,
        body: unauthorizedPaymentRequest
      }).then((res) => {

        expect(res.status).to.eq(401);
        expect(res.body.error.type).to.eq("invalid_request_error");
        expect(res.body.error.message).to.include("API key");
      });
    });
  });

});
