# MITHx PoC

## Project setup

### 1. Clone the project

Follow the instructions displayed when clicking on the _Code_ button on this repo.

### 2. Install dependencies

```bash
npm i
```

### 3. Set up an Auth0 tenant

Follow Auth0's official instructions [here](https://auth0.com/docs/get-started/auth0-overview/create-tenants).

You can use a paid license as well as free trial, just as long as you have full access to the tenant dashboard.

### 4. Create an Auth0 application

Follow Auth0's official instructions [here](https://auth0.com/docs/get-started/auth0-overview/create-applications).

The recommended preset is _Single-Page Application_. Make sure to correctly set the `Allowed Callback URLs`, `Allowed Logout URLs` and `Allowed Web Origins` fields; the value should be `http://localhost:3000` or your chosen hostname.

See the [Application URIs](https://auth0.com/docs/get-started/auth0-overview/create-applications) page for more information.

### 5. Auth0 configuration

Copy the `auth_config.example.json` file and rename said copy to `auth_config.json`.

Find these settings in the Auth0 dashboard.

| Parameter  | Description                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| `domain`   | Application domain, found under your Application's _Settings_ > _Basic Information_ > _Domain_ section.       |
| `clientId` | Application client ID, found under your Application's _Settings_ > _Basic Information_ > _Client ID_ section. |
| `audience` | Auth0 Management API audience, found under _Applications_ > _APIs_ > _Auth0 Management API_ > _API Audience_. |

### 6. env configuration

Copy the `env.example` file and rename said copy to `.env`.

The Bitski values can be obtained from the [developer page](https://developer.bitski.com/) once you have a created account. After having done so, create an app in order to obtain a Client ID.

Make sure your app has API access. Contact the Bitski team in order to enable this.

Find these settings in the Bitski developer page. For the MySQL params, make sure you have access to a running server.

| Parameter                        | Description                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `REACT_APP_BACKEND_URL`          | Back-end URL, default value is `http://localhost:3001`.                                                             |
| `REACT_APP_BITSKI_CLIENT_ID`     | Bitski App Client ID, found under _Credentials_ > _Backend Credentials_.                                            |
| `REACT_APP_BITSKI_CLIENT_SECRET` | Bitski App Client ID, given when creating the app.                                                                  |
| `REACT_APP_SHOP_NAME`            | Shopify Shop name, found in the URL for a Shopify account -- after the `https://` and before `.myshopify`.          |
| `REACT_APP_STOREFRONT_TOKEN`     | Shopify [Storefront token](https://shopify.dev/docs/api/usage/authentication#access-tokens-for-the-storefront-api). |
| `MYSQL_HOST`                     | MySQL server host address.                                                                                          |
| `MYSQL_USER`                     | MySQL user.                                                                                                         |
| `MYSQL_PASSWORD`                 | MySQL password for the given user.                                                                                  |
| `MYSQL_DATABASE`                 | MySQL database name.                                                                                                |

### 7. Database setup

Create tables for the configured database as shown here:

```sql
CREATE TABLE `shops` (
  `name` varchar(45) NOT NULL,
  `api_key` varchar(45) NOT NULL,
  PRIMARY KEY (`name`)
);

CREATE TABLE `customers` (
  `sub` varchar(45) NOT NULL,
  `shop` varchar(45) NOT NULL,
  `shopify_id` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  PRIMARY KEY (`sub`,`shop`)
);
```

Then, add a row with your shop name and API key to use to the `shops` table. The shop name must match the one set up in the previous section.

## Execution

This command will start both the front-end as well as the

Make sure the database service is running.

```bash
npm start
```
