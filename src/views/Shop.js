import { Container } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";

export const Shop = () => {
  const { user } = useAuth0();

  return <Container className="mb-5">Shop</Container>;
};

export default withAuthenticationRequired(Shop, {
  onRedirecting: () => <Loading />,
});
