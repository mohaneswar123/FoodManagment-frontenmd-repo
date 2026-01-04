import React, { useState } from 'react';
import { fetchProduct, saveProductForUser } from '../api/productApi';
import Input from '../components/Input';
import Button from '../components/Button';
import BarcodeScannerComponent from "react-qr-barcode-scanner";

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
      // Retrieve product details automatically when scanned? The user flow suggests explicit "Find Food Details" click. 
      // Keeping it manual as per existing flow, just showing visual feedback.
    }
  };

  const handleScanFail = (error) => {
    console.error('QR Scan Error:', error);
    setScanError(true);
  };

  const handleFetchProduct = async () => {
    try {
      const product = await fetchProduct(barcode);
      setProductDetails(product);
      setErrorMessage('');
    } catch (error) {
      console.error('Fetch Error:', error);
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
        date: expiry,
      };

      await saveProductForUser(userId, formattedProductDetails);
      alert('Product saved successfully!');
      setBarcode('');
      setExpiry('');
      setProductDetails(null);
    } catch (error) {
      console.error('Submit Error:', error);
      alert('Failed to save product: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-yellow-50 to-amber-50 p-2 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-3 sm:p-6 border-t-2 sm:border-t-4 border-red-500">

        <div className="flex justify-center mb-3 text-2xl sm:text-4xl">🍽️</div>
        <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-amber-700 text-center">
          Scan Food Barcode
        </h2>

        {/* Scan Area */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-amber-200 to-red-200 h-32 sm:h-40 flex items-center justify-center rounded-lg mb-2 border border-amber-300 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-5 sm:opacity-10 text-xs sm:text-base">
              🍎 🍇 🥦 🥕 🍞 🥩 🧀 🍗
            </div>
            <span className="text-red-500 font-semibold z-10 text-sm sm:text-base">
              📷 Scan Below
            </span>
          </div>

          {scanError ? (
            <Input
              label="Enter Barcode Manually"
              value={barcode}
              onChange={setBarcode}
              placeholder="Type barcode here"
              required
            />
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

        {/* Fetch Product */}
        <div className="mb-4 sm:mb-6">
          <Button type="button" onClick={handleFetchProduct} variant="primary" size="medium" className="w-full">
            🔍 Find Food Details
          </Button>

          {errorMessage && <p className="text-red-600 mt-2 text-center text-sm">{errorMessage}</p>}

          {/* Product Details */}
          {productDetails && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg shadow border-l-4 border-amber-500">
              <h3 className="font-semibold text-amber-700 text-lg mb-2">🍽️ Food Details:</h3>

              <p className="mb-1"><span className="font-bold">🍴 Name:</span> {productDetails.product_name || 'N/A'}</p>
              <p className="mb-1"><span className="font-bold">🏷️ Brand:</span> {productDetails.brands || 'N/A'}</p>
              <p className="mb-1"><span className="font-bold">⚖️ Quantity:</span> {productDetails.quantity || 'N/A'}</p>

              <p className="mb-1 text-xs sm:text-sm"><span className="font-bold">📋 Ingredients:</span> {
                Array.isArray(productDetails.ingredients)
                  ? productDetails.ingredients.map((ing, i) => (
                    <span key={i}>{ing.text}{i < productDetails.ingredients.length - 1 ? ', ' : ''}</span>
                  ))
                  : productDetails.ingredients_text || 'N/A'
              }</p>

              <p className="mb-1"><span className="font-bold">🔥 Calories/100g:</span> {productDetails.nutriments?.energy_100g || 'N/A'}</p>
              <p className="mb-1"><span className="font-bold">🍯 Sugar/100g:</span> {productDetails.nutriments?.sugars_100g || 'N/A'}</p>
            </div>
          )}
        </div>

        {/* QR Scanner */}
        <div className="mb-4 sm:mb-6 relative">
          <BarcodeScannerComponent
            width="100%"
            height="100%"
            onUpdate={(err, result) => {
              if (result) {
                console.log('Scanner Result:', result);
                const code = result.text || result.getText();
                console.log('Detected Code:', code);

                if (code && code !== barcode) {
                  handleScanSuccess({ text: code });
                }
              } else if (err) {
                // console.log("Scan Error:", err); // Optional: log errors if needed, but often noisy
              }
            }}
            facingMode="environment"
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: "environment"
            }}
          />
        </div>

        {/* Save Form */}
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
