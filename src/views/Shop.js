import { Container } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import "./Shop.css";

export const Shop = () => {
  const { user } = useAuth0();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState();
  const [checkoutItems, setCheckoutItems] = useState([]);

  const handleCart = (e) => {
    const target = e.target;
    console.log(e.target.checked)
    console.log(e.target.id);

    if (target.checked){
      setCheckoutItems(prevState => [...prevState, target.id])
    }else {
      setCheckoutItems(prevState => prevState.filter((elem) => elem !== target.id))
    }    
  };

  useEffect(() => {
    async function fetchProducts(shop) {
      const response = await fetch(`http://localhost:3001/products/${shop}`);
      const jsonResponse = await response.json();
      return jsonResponse;
    }
    fetchProducts(process.env.REACT_APP_SHOP_NAME).then((res) => {
      if (res.error) {
        setError(res.error);
      } else {
        const p = [];
        const regex = /(<([^>]+)>)/gi;
        res.products.map((product) =>
          product.variants.map((variant) => {
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
          })
        );
        setProducts(p);
      }
    });
  }, []);

  const columns = [
    { field: "title", headerName: "Title", width: 300 },
    { field: "description", headerName: "Description", width: 400 },
    {
      field: "image",
      headerName: "Image",
      renderCell: (params) => <img width="100px" src={params.value} />,
    },
    { field: "price", headerName: "Price" },
    {
      field: "buy",
      headerName: "Add to Cart",
      renderCell: (params) => (
        <input
          type="checkbox"
          id={params.value}
          onClick={(e) => handleCart(e)}
        ></input>
      ),
    },
  ];

  return (
    <Container className="mb-5">
      <h2>Shop: {process.env.REACT_APP_SHOP_NAME}</h2>
      {error && <>Error: {error}</>}
      {!error && products && <DataGrid rows={products} columns={columns} />}
      {checkoutItems}
    </Container>
  );
};

export default withAuthenticationRequired(Shop, {
  onRedirecting: () => <Loading />,
});
