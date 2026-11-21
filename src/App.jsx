import React from "react";
import Preloader from "./components/Preloader";
import Header from "./components/Header";
import ProductShowcase from "./components/ProductShowcase/ProductShowcase";
const App = () => {
  return (
    <>
      <Preloader />
      <Header />
<ProductShowcase />
    </>
  );
};

export default App;
