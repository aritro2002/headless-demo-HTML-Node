const fetch = require("node-fetch");
const express = require("express");
const { resolve } = require("path");
const dotenv = require("dotenv");
const hyper = require("@juspay-tech/hyperswitch-node");
dotenv.config({ path: "./.env" });

const app = express();
const PORT = 4242;
app.use(express.static("public"));
app.use(express.json());
const hyperswitch = hyper(process.env.HYPERSWITCH_SECRET_KEY);

function getUrl(envVar, selfHostedValue) {
  return process.env[envVar] === selfHostedValue ? "" : process.env[envVar];
}

const SERVER_URL = getUrl("HYPERSWITCH_SERVER_URL", "SELF_HOSTED_SERVER_URL");

const paymentData = {
  currency: "USD",
  amount: 2999,
  order_details: [
    {
      product_name: "Apple iPhone 15",
      quantity: 1,
      amount: 2999,
    },
  ],
  confirm: false,
  capture_method: "automatic",
  authentication_type: "three_ds",
  setup_future_usage: "on_session",
  customer_id: "hyperswitch_sdk_demo_id",
  email: "hyperswitch_sdk_demo_id@gmail.com",
  request_external_three_ds_authentication: false,
  description: "Hello this is description",
  shipping: {
    address: {
      line1: "1467",
      line2: "Harrison Street",
      line3: "Harrison Street",
      city: "San Fransico",
      state: "California",
      zip: "94122",
      country: "US",
      first_name: "joseph",
      last_name: "Doe",
    },
    phone: {
      number: "8056594427",
      country_code: "+91",
    },
  },
  metadata: {
    udf1: "value1",
    new_customer: "true",
    login_date: "2019-09-10T10:11:12Z",
  },
  billing: {
    address: {
      line1: "1467",
      line2: "Harrison Street",
      line3: "Harrison Street",
      city: "San Fransico",
      state: "California",
      zip: "94122",
      country: "US",
      first_name: "joseph",
      last_name: "Doe",
    },
    phone: {
      number: "8056594427",
      country_code: "+91",
    },
  },
};

const profileId = process.env.PROFILE_ID;
if (profileId) {
  paymentData.profile_id = profileId;
}

function createPaymentRequest() {
  return paymentData;
}

app.get("/create-payment-intent", async (_, res) => {
  try {
    const paymentRequest = createPaymentRequest();
    const paymentIntent = await createPaymentIntent(paymentRequest);

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(400).send({
      error: { message: err.message },
    });
  }
});

async function createPaymentIntent(request) {
  if (SERVER_URL) {
    const url =
      process.env.HYPERSWITCH_SERVER_URL_FOR_DEMO_APP ||
      process.env.HYPERSWITCH_SERVER_URL;
    const apiResponse = await fetch(`${url}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": process.env.HYPERSWITCH_SECRET_KEY,
      },
      body: JSON.stringify(request),
    });
    const paymentIntent = await apiResponse.json();

    if (paymentIntent.error) {
      console.error("Error - ", paymentIntent.error);
      throw new Error(paymentIntent?.error?.message ?? "Something went wrong.");
    }
    return paymentIntent;
  } else {
    return await hyperswitch?.paymentIntents?.create(request);
  }
}

app.listen(PORT, () => {
  console.log(`Node server listening at http://localhost:${PORT}`);
});
