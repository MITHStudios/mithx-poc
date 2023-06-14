import React from "react";
import { Container} from "reactstrap";

import Loading from "../components/Loading";
import { withAuthenticationRequired } from "@auth0/auth0-react";

export const Wallet = () => {
  return <Container className="mb-5">Wallet</Container>;
};

export default withAuthenticationRequired(Wallet, {
  onRedirecting: () => <Loading />,
});
