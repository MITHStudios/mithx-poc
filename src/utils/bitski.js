import { clientCredentialsGrantRequest } from "@panva/oauth4webapi";

const BITSKI_AUTH_SERVER = {
  issuer: "https://account.bitski.com/",
  authorization_endpoint: "https://account.bitski.com/oauth2/auth",
  token_endpoint: "https://account.bitski.com/oauth2/token",
  jwks_uri: "https://account.bitski.com/.well-known/jwks.json",
  subject_types_supported: ["public"],
  response_types_supported: [
    "code",
    "code id_token",
    "id_token",
    "token id_token",
    "token",
    "token id_token code",
  ],
  claims_supported: ["sub", "email", "email_verified"],
  grant_types_supported: [
    "authorization_code",
    "implicit",
    "client_credentials",
    "refresh_token",
  ],
  response_modes_supported: ["query", "fragment"],
  userinfo_endpoint: "https://account.bitski.com/userinfo",
  scopes_supported: ["offline", "openid", "email"],
  token_endpoint_auth_methods_supported: [
    "client_secret_post",
    "client_secret_basic",
    "private_key_jwt",
    "none",
  ],
  userinfo_signing_alg_values_supported: ["none", "RS256"],
  id_token_signing_alg_values_supported: ["RS256"],
  request_parameter_supported: true,
  request_uri_parameter_supported: true,
  require_request_uri_registration: true,
  claims_parameter_supported: false,
  revocation_endpoint: "https://account.bitski.com/oauth2/revoke",
  backchannel_logout_supported: true,
  backchannel_logout_session_supported: true,
  frontchannel_logout_supported: true,
  frontchannel_logout_session_supported: true,
  end_session_endpoint: "https://account.bitski.com/oauth2/sessions/logout",
};

export const getBitskiAccessToken = async () => {
  const params = new URLSearchParams();
  params.set("scope", "apps"); // required to mint tokens

  const credentialResp = await clientCredentialsGrantRequest(
    BITSKI_AUTH_SERVER,
    {
      client_id: process.env.REACT_APP_BITSKI_CLIENT_ID,
      client_secret: process.env.REACT_APP_BITSKI_CLIENT_SECRET,
    },
    params
  );

  const { access_token } = await credentialResp.json();

  return access_token;
};
