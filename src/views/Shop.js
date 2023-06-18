import { Container } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import "./Shop.css";

export const Shop = () => {
  const shop = process.env.REACT_APP_SHOP_NAME;
  const { user } = useAuth0();
  const [products, setProducts] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [customer, setCustomer] = useState();
  const [loading, setLoading] = useState(false);

  const handleCartSelection = (e) => {
    const target = e.target;

    if (target.checked) {
      setCheckoutItems((prevState) => [...prevState, target.id]);
    } else {
      setCheckoutItems((prevState) =>
        prevState.filter((elem) => elem !== target.id)
      );
    }
  };

  const handleBuy = () => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_BACKEND_URL}/checkout/${shop}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        customer: customer,
        cart: checkoutItems,
      }),
    }).then((res) => {
      res.json().then((resJson) => {
        window.location.replace(resJson.checkoutUrl);
      });
    });
  };

  // get or create shop user
  useEffect(() => {
    async function fetchShopUser(sub, shop) {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/customer/${sub}/${shop}`
      );
      const jsonResponse = await response.json();
      return jsonResponse;
    }
    fetchShopUser(user.sub, shop).then((res) => {
      if (res.customer === null) {
        // create customer
        fetch(
          `${process.env.REACT_APP_BACKEND_URL}/customer/${user.sub}/${shop}`,
          {
            method: "POST",
          }
        ).then((res) => {
          setCustomer(res.customer);
        });
      } else {
        setCustomer(res.customer);
      }
    });
  }, [shop, user.sub]);

  // get shop products
  useEffect(() => {
    async function fetchProducts(shop) {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/products/${shop}`
      );
      const jsonResponse = await response.json();
      return jsonResponse;
    }
    fetchProducts(shop).then((res) => {
      const p = [];
      const regex = /(<([^>]+)>)/gi;
      res.products.forEach((product) => {
        if (product.status === "active") {
          product.variants.forEach((variant) => {
            p.push({
              id: variant.id,
              title: product.title,
              description: product.body_html
                ? product.body_html.replace(regex, "")
                : "",
              image: product.image ? product.image.src : "",
              price: "$" + variant.price,
              buy: variant.id,
            });
          });
        }
      });
      setProducts(p);
    });
  }, [shop]);

  const columns = [
    { field: "title", headerName: "Title", width: 300 },
    { field: "description", headerName: "Description", width: 400 },
    {
      field: "image",
      headerName: "Image",
      renderCell: (params) => <img width="100px" src={params.value} alt={""} />,
    },
    { field: "price", headerName: "Price" },
    {
      field: "buy",
      headerName: "Add to Cart",
      renderCell: (params) => (
        <input
          type="checkbox"
          id={params.value}
          onClick={(e) => handleCartSelection(e)}
        ></input>
      ),
    },
  ];

  return (
    <Container className="mb-5">
      {loading && <Loading />}
      {!loading && (
        <>
          <h2>Shop: {shop}</h2>
          {products && <DataGrid rows={products} columns={columns} />}
          <div className="buy">
            <button
              className="btn btn-primary"
              onClick={handleBuy}
              disabled={checkoutItems.length === 0}
            >
              Buy {checkoutItems.length > 0 && <>({checkoutItems.length})</>}
            </button>
          </div>
        </>
      )}
    </Container>
  );
};

export default withAuthenticationRequired(Shop, {
  onRedirecting: () => <Loading />,
});
