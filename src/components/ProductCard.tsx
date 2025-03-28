const ProductCard = ({ name, price }) => {
  return (
    <div className="product-card bg-white border border-gray-300 p-4 rounded-lg shadow-md hover:shadow-lg">
      <img src="/placeholder-image.jpg" alt="Product Image" className="w-full h-48 object-cover rounded-lg mb-4" />
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-gray-500 mb-4">${price}</p>
      <button className="bg-teal-500 text-white p-2 rounded-lg w-full">
        Comprar
      </button>
    </div>
  );
};

export default ProductCard;
