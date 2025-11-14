import React, { useState } from 'react';
import { fetchProduct, saveProductForUser } from '../api/productApi';
import Input from '../components/Input';
import Button from '../components/Button';
import { QrReader } from 'react-qr-reader';

const BarcodeScanPage = ({ userId, isGuest = false }) => {
  const [barcode, setBarcode] = useState('');
  const [expiry, setExpiry] = useState('');
  const [scanError, setScanError] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleScanSuccess = (result) => {
    if (result) {
      setBarcode(result.text);
      setScanError(false);
    }
  };

  const handleScanFail = (error) => {
    console.error('Error in handleScanFail:', error);
    setScanError(true);
  };

  const handleFetchProduct = async () => {
    try {
      const product = await fetchProduct(barcode);
      setProductDetails(product);
      setErrorMessage('');
    } catch (error) {
      console.error('Error in handleFetchProduct:', error);
      setErrorMessage(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) {
      alert('Guest mode is read-only. Login to save items.');
      return;
    }
    if (!productDetails) {
      alert('Please fetch product details before submitting.');
      return;
    }
    try {
      const formattedProductDetails = {
        barcode: productDetails.barcode || barcode,
        name: productDetails.product_name || 'N/A',
        brand: productDetails.brands || 'N/A',
        quantity: productDetails.quantity || 'N/A',
        ingredients: Array.isArray(productDetails.ingredients)
          ? productDetails.ingredients.map(ingredient => ingredient.text || 'Unknown')
          : productDetails.ingredients_text || 'N/A',
        caloriesPer100g: productDetails.nutriments?.energy_100g || 'N/A',
        sugarPer100g: productDetails.nutriments?.sugars_100g || 'N/A',
        date: expiry, // Directly store the date given by user
      };

      await saveProductForUser(userId, formattedProductDetails);
      alert('Product saved successfully!');
      setBarcode('');
      setExpiry('');
      setProductDetails(null);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('Failed to save product: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-yellow-50 to-amber-50 p-2 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-3 sm:p-6 border-t-2 sm:border-t-4 border-red-500">
        <div className="flex justify-center mb-3 text-2xl sm:text-4xl">🍽️</div>
        <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-amber-700 text-center">Scan Food Barcode</h2>
        <div className="mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-amber-200 to-red-200 h-32 sm:h-40 flex items-center justify-center rounded-lg mb-2 border border-amber-300 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-5 sm:opacity-10 text-xs sm:text-base">
              🍎 🍇 🥦 🥕 🍞 🥩 🧀 🍗
            </div>
            <span className="text-red-500 font-semibold z-10 text-sm sm:text-base">📷 [Scanner Placeholder]</span>
          </div>
          {scanError ? (
            <div className="mb-3 sm:mb-4">
              <p className="text-red-600 font-medium mb-2 text-sm sm:text-base">Scan failed. Please enter manually:</p>
              <Input
                label="Enter Barcode"
                value={barcode}
                onChange={setBarcode}
                placeholder="Type barcode here"
                required
              />
            </div>
          ) : (
            <Input
              label="Detected Barcode"
              value={barcode}
              onChange={setBarcode}
              placeholder="Barcode will appear here"
              disabled
            />
          )}
          <Button type="button" onClick={handleScanFail} variant="warning" size="medium" className="mt-2 w-full">
            📝 Can't scan? Enter manually
          </Button>
        </div>
        <div className="mb-4 sm:mb-6">
          <Button type="button" onClick={handleFetchProduct} variant="primary" size="medium" className="w-full">
            🔍 Find Food Details
          </Button>
          {errorMessage && <p className="text-red-600 mt-2 text-center text-sm">{errorMessage}</p>}
          {productDetails && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg shadow border-l-2 sm:border-l-4 border-amber-500">
              <h3 className="font-semibold text-amber-700 text-base sm:text-lg mb-2">🍽️ Food Details:</h3>
              <p className="mb-1 text-sm sm:text-base"><span className="font-bold text-amber-700">🍴 Name:</span> {productDetails.product_name || 'N/A'}</p>
              <p className="mb-1 text-sm sm:text-base"><span className="font-bold text-amber-700">🏷️ Brand:</span> {productDetails.brands || 'N/A'}</p>
              <p className="mb-1 text-sm sm:text-base"><span className="font-bold text-amber-700">⚖️ Quantity:</span> {productDetails.quantity || 'N/A'}</p>
              <p className="mb-1 text-xs sm:text-sm"><span className="font-bold text-amber-700">📋 Ingredients:</span> {
                Array.isArray(productDetails.ingredients)
                  ? productDetails.ingredients.map((ingredient, index) => (
                      <span key={index} className="italic">{ingredient.text || 'Unknown'}{index < productDetails.ingredients.length - 1 ? ', ' : ''}</span>
                    ))
                  : productDetails.ingredients_text || 'N/A'
              }</p>
              <p className="mb-1 text-sm sm:text-base"><span className="font-bold text-amber-700">🔥 Calories/100g:</span> {productDetails.nutriments?.energy_100g || 'N/A'}</p>
              <p className="mb-1 text-sm sm:text-base"><span className="font-bold text-amber-700">🍯 Sugar/100g:</span> {productDetails.nutriments?.sugars_100g || 'N/A'}</p>
            </div>
          )}
        </div>
        <div className="mb-4 sm:mb-6">
          <QrReader
            onResult={(result, error) => {
              if (result) handleScanSuccess(result);
              if (error) handleScanFail(error);
            }}
            constraints={{ facingMode: 'environment' }}
            style={{ width: '100%' }}
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <Input
            label="Expiry Date"
            type="date"
            value={expiry}
            onChange={setExpiry}
            required
          />
          <Button type="submit" variant="success" size="large" className="w-full" disabled={isGuest}>
            {isGuest ? '🔒 Read-only in Guest' : '💾 Save Food Item'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BarcodeScanPage;
