# hyperswitch-html-demo-app

A simple app to demo html integration of Hyperswitch Headless SDK

## Running the sample

1. Build the server

```
npm install or yarn
```

2. Provide valid Api key in .env and Publishable key in checkout.js. You can create your keys using the Hyperswitch dashboard. https://app.hyperswitch.io/

```
//in .env
HYPERSWITCH_PUBLISHABLE_KEY=
HYPERSWITCH_SECRET_KEY=
HYPERSWITCH_SERVER_URL=
PROFILE_ID=
```

```
//in checkout.js
const hyper = Hyper("publishable_key");
```

3. Run the server

```
npm install
npm start

```

4. Go to [http://localhost:4242/checkout.html](http://localhost:4242/checkout.html)
