const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");
const authConfig = require("./src/auth_config.json");

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

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

  const json = await accountResp.json();
  const { account } = await json;

  res.send({
    address: account
  });
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
