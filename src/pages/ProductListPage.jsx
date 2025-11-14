import React, { useEffect, useState } from 'react';
import Table from '../components/Table.jsx';
import { fetchAllProducts, fetchProductsByUser, deleteProductForUser } from '../api/productApi';

const ProductListPage = ({ userId, isGuest = false }) => {
	const [products, setProducts] = useState([]);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const productList = isGuest ? await fetchAllProducts() : await fetchProductsByUser(userId);
				setProducts(productList);
				setErrorMessage('');
			} catch (error) {
				console.error('Error fetching products:', error);
				setErrorMessage('Failed to fetch products.');
			}
		};
		fetchProducts();
	}, [userId, isGuest]);

	const handleDelete = async (productId) => {
		if (!window.confirm('Are you sure you want to delete this product?')) return;
		try {
			await deleteProductForUser(userId, productId);
			setProducts(products.filter(product => product.id !== productId));
		} catch (error) {
			setErrorMessage('Failed to delete product.');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-yellow-50 to-amber-50 p-2 sm:p-4">
			<div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-3 sm:p-6 border-t-2 sm:border-t-4 border-amber-500">
				<div className="flex justify-center mb-3 text-2xl sm:text-4xl">🍱</div>
				<h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-amber-700 text-center">Your Food Pantry</h2>
				{errorMessage && <p className="text-red-600 mb-3 sm:mb-4 text-center text-sm">{errorMessage}</p>}
				<Table products={products} onDelete={handleDelete} readOnly={isGuest} />
			</div>
		</div>
	);
};

export default ProductListPage;
