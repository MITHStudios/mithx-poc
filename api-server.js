const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");
const authConfig = require("./src/auth_config.json");
const mysql = require("mysql");

require("dotenv").config();

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABSE,
});
connection.connect((err) => {
  if (err) {
    throw Error(err);
  }
  console.log("Database connected");
});

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});

app.get("/customer/:id/:shop", async (req, res) => {
  const sub = req.params.id;
  const shop = req.params.shop;

  connection.query(
    `SELECT * FROM ${process.env.MYSQL_DATABASE}.customers WHERE customers.shop = "${shop}" AND customers.sub = "${sub}"`,
    async function (err, result) {
      res.send({
        customer: result[0] ? result[0].email : null,
      });
    }
  );
});

app.post("/customer/:id/:shop", async (req, res) => {
  const sub = req.params.id;
  const shop = req.params.shop;
  const email = `${sub.split("|")[1]}@${shop.split("-")[1]}.com`;
  const password = `mithx_${shop.split("-")[1]}`; // replace with safe password

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append(
    "X-Shopify-Storefront-Access-Token",
    process.env.STOREFRONT_TOKEN
  );

  var graphql = JSON.stringify({
    query:
      "mutation customerCreate($input: CustomerCreateInput!) {\n  customerCreate(input: $input) {\n    customer {\n      email\n      firstName\n      lastName\n      id\n    }\n    customerUserErrors {\n      message\n    }\n  }\n}",
    variables: {
      input: { email, password },
    },
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: graphql,
    redirect: "follow",
  };

  fetch(
    `https://${shop}.myshopify.com/api/2023-04/graphql.json`,
    requestOptions
  ).then((response) => {
    response.json().then((responseJson) => {
      connection.query(
        `INSERT INTO ${process.env.MYSQL_DATABASE}.customers (sub, shop, shopify_id, email, password) VALUES ("${sub}", "${shop}", "${responseJson.data.customerCreate.customer.id}", "${email}", "${password}")`,
        async function (err, result) {
          res.send({
            customer: email,
          });
        }
      );
    });
  });
});

app.post("/checkout/:shop", async (req, res) => {
  const shop = req.params.shop;

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append(
    "X-Shopify-Storefront-Access-Token",
    process.env.STOREFRONT_TOKEN
  );

  const lineItems = req.body.cart.map((item) => ({
    quantity: 1,
    variantId: "gid://shopify/ProductVariant/" + item,
  }));

  var graphql = JSON.stringify({
    query:
      "mutation checkoutCreate($input: CheckoutCreateInput!) {\n  checkoutCreate(input: $input) {\n    checkout {\n      id\n      webUrl\n    }\n    checkoutUserErrors {\n      message\n    }\n    queueToken\n  }\n}",
    variables: {
      input: {
        email: req.body.customer,
        lineItems: lineItems,
      },
    },
  });
  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: graphql,
    redirect: "follow",
  };

  const checkoutResp = await fetch(
    `https://${shop}.myshopify.com/api/2023-04/graphql.json`,
    requestOptions
  );
  const jsonResponse = await checkoutResp.json();
  
  res.send({
    checkoutUrl: jsonResponse.data.checkoutCreate.checkout.webUrl,
  });
});

app.get("/products/:shop", async (req, res) => {
  const shop = req.params.shop;

  connection.query(
    `SELECT * FROM ${process.env.MYSQL_DATABASE}.shops WHERE shops.name = "${shop}"`,
    async function (err, result) {
      const shopKey = result[0].api_key;

      const productsResp = await fetch(
        `https://${shop}.myshopify.com/admin/api/2023-04/products.json`,
        {
          method: "GET",
          redirect: "follow",
          headers: new Headers({
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": shopKey,
          }),
        }
      );
      const jsonResponse = await productsResp.json();

      res.send({
        products: jsonResponse.products,
      });
    }
  );
});

app.get("/wallet/:token/:id", async (req, res) => {
  const access_token = req.params.token;
  const userId = req.params.id;

  const accountResp = await fetch(
    "https://account.bitski.com/v2/federated-accounts",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${access_token}`,
        "User-Agent": "waas-demo/0.0.1",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    }
  );
  const jsonResponse = await accountResp.json();

  res.send({
    address: jsonResponse.account,
  });
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
