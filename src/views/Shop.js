import { Container } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";

export const Shop = () => {
  const { user } = useAuth0();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts(shop) {
      await fetch(`http://localhost:3001/products/${shop}`);
    }
    fetchProducts(process.env.REACT_APP_SHOP_NAME).then((res) =>
      setProducts(res)
    );
  }, []);

  return <Container className="mb-5">{}</Container>;
};

export default withAuthenticationRequired(Shop, {
  onRedirecting: () => <Loading />,
});
