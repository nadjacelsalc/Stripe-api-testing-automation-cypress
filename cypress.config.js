import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://api.stripe.com/v1"
  }
});
