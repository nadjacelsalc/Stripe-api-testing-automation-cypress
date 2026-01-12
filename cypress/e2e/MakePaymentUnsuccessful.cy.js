describe("Stripe – Unsuccessful and edge payment scenarios", () => {

  beforeEach(() => {
    expect(Cypress.env("STRIPE_SECRET_KEY"), "Stripe secret key").to.exist;
  });

  const sendRequest = (body) => {
    return cy.request({
      method: "POST",
      url: "/payment_intents",
      headers: {
        Authorization: `Bearer ${Cypress.env("STRIPE_SECRET_KEY")}`
      },
      form: true,
      failOnStatusCode: false,
      body
    });
  };

  it("T101 – Amount too large", () => {
    cy.fixture("stripeRequestBodies").then(({ createPaymentUnsuccessfulAmountTooLarge }) => {

      sendRequest(createPaymentUnsuccessfulAmountTooLarge).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.error.type).to.eq("invalid_request_error");
        expect(res.body.error.message).to.include("Amount");
      });
    });
  });

  it("T102 – Missing currency", () => {
    cy.fixture("stripeRequestBodies").then(({ createPaymentUnsuccessfulMissingCurrency }) => {

      sendRequest(createPaymentUnsuccessfulMissingCurrency).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.error.type).to.eq("invalid_request_error");
        expect(res.body.error.param).to.eq("currency");
      });
    });
  });

  it("T103 – Negative amount", () => {
    cy.fixture("stripeRequestBodies").then(({ createPaymentUnsuccessfulNegativeAmount }) => {

      sendRequest(createPaymentUnsuccessfulNegativeAmount).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.error.type).to.eq("invalid_request_error");
        expect(res.body.error.message).to.include("value");
      });
    });
  });

  it("T104 – Zero amount", () => {
    cy.fixture("stripeRequestBodies").then(({ createPaymentUnsuccessfulZeroAmount }) => {

      sendRequest(createPaymentUnsuccessfulZeroAmount).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.error.type).to.eq("invalid_request_error");
      });
    });
  });

  it("T105 – Unsupported currency", () => {
    cy.fixture("stripeRequestBodies").then(({ createPaymentUnsupportedCurrency }) => {

      sendRequest(createPaymentUnsupportedCurrency).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.error.type).to.eq("invalid_request_error");
        expect(res.body.error.message).to.include("currency");
      });
    });
  });

  it("T106 – Requires authentication (3DS)", () => {
    cy.fixture("stripeRequestBodies").then(({ createPaymentRequiresAuthentication }) => {

      sendRequest(createPaymentRequiresAuthentication).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.object).to.eq("payment_intent");
        expect(res.body.status).to.eq("requires_action");
        expect(res.body.next_action.type).to.eq("use_stripe_sdk");
      });
    });
  });

  it("T107 – Insufficient funds", () => {
    cy.fixture("stripeRequestBodies").then(({ createPaymentInsufficientFunds }) => {

      sendRequest(createPaymentInsufficientFunds).then((res) => {
        expect(res.status).to.eq(402);
        expect(res.body.error.type).to.eq("card_error");
        expect(res.body.error.code).to.eq("card_declined");
      });
    });
  });

  it("T108 – Card declined", () => {
    cy.fixture("stripeRequestBodies").then(({ createPaymentCardDeclined }) => {

      sendRequest(createPaymentCardDeclined).then((res) => {
        expect(res.status).to.eq(402);
        expect(res.body.error.type).to.eq('card_error');
        expect(res.body.error.code).to.eq("card_declined");
      });
    });
  });

  it("T109 – Expired card", () => {
    cy.fixture("stripeRequestBodies").then(({ createPaymentExpiredCard }) => {

      sendRequest(createPaymentExpiredCard).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.error.type).to.eq('invalid_request_error');
        expect(res.body.error.code).to.eq('resource_missing');
      });
    });
  });

  it("T110 – Manual confirmation (confirm=false)", () => {
    cy.fixture("stripeRequestBodies").then(({ createPaymentManualConfirmation }) => {

      sendRequest(createPaymentManualConfirmation).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.object).to.eq("payment_intent");
        expect(res.body.status).to.eq("requires_confirmation");
      });
    });
  });

  it("T111 - Invalid payment method", () => {
    cy.fixture("stripeRequestBodies").then(({ paymentWithInvalidPaymentMethod }) => {

      sendRequest(paymentWithInvalidPaymentMethod).then((res) => {
        expect(res.status).to.eq(400);
      });
    });
  });
  
  

});
