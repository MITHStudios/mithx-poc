import { Container } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import Highlight from "../components/Highlight";
import { useState } from "react";
import { getBitskiAccessToken } from "../utils/bitski";

export const Wallet = () => {
  const { user } = useAuth0();
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const getBitskiWallet = async () => {
    setLoading(true);
    const token = await getBitskiAccessToken();
    const response = await fetch(
      `http://localhost:3001/wallet/${token}/${user.sub}`
    );
    const res = await response.json();
    setAddress(res.address);
    setLoading(false);
  };

  return (
    <Container className="mb-5">
      <div>
        <h2>Username</h2>
        <p>{user.name}</p>
        <h2>User Identifier (sub)</h2>
        <p>{user.sub}</p>
        {!address && (
          <button className="btn btn-primary" onClick={getBitskiWallet}>
            Get Wallet
          </button>
        )}
        {loading && <Loading />}
        {address && (
          <>
            <h2>Bitski wallet</h2>
            <Highlight>{address}</Highlight>
          </>
        )}
      </div>
    </Container>
  );
};

export default withAuthenticationRequired(Wallet, {
  onRedirecting: () => <Loading />,
});
