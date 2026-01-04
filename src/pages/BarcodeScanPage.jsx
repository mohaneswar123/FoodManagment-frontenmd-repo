import React, { useState } from 'react';
import { fetchProduct, saveProductForUser } from '../api/productApi';
import Input from '../components/Input';
import Button from '../components/Button';
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const BarcodeScanPage = ({ userId, isGuest = false }) => {
  const [step, setStep] = useState(0); // 0: Scan, 1: Confirm/Fetch, 2: Save
  const [barcode, setBarcode] = useState('');
  const [expiry, setExpiry] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  const resetFlow = () => {
    setStep(0);
    setBarcode('');
    setExpiry('');
    setProductDetails(null);
    setErrorMessage('');
    setIsScanning(true);
  };

  const handleScanSuccess = async (result) => {
    if (result && step === 0) {
      const code = result.text;
      setBarcode(code);
      setIsScanning(false);

      // Auto-fetch details
      try {
        setErrorMessage('');
        setStep(1); // temporary loading state or reuse step 1 as loading/error
        // Note: We used to show a "Found" screen here. Now we want to skip it.
        // Let's show a loading indicator on Step 1 if we're waiting?
        // Actually, let's just await.

        const product = await fetchProduct(code);
        setProductDetails(product);
        setStep(2); // Jump directly to Save Details
      } catch (error) {
        console.error('Fetch Error:', error);
        setErrorMessage(error.message);
        setStep(1); // Stay on "Confirm/Error" step if failed, so user can see what happened
      }
    }
  };

  const handleFetchProduct = async () => {
    // Manual retry handler
    try {
      setErrorMessage('');
      const product = await fetchProduct(barcode);
      setProductDetails(product);
      setStep(2);
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

    try {
      const formattedProductDetails = {
        barcode: productDetails?.barcode || barcode,
        name: productDetails?.product_name || 'Unknown Item',
        brand: productDetails?.brands || 'Unknown Brand',
        quantity: productDetails?.quantity || '1',
        ingredients: Array.isArray(productDetails?.ingredients)
          ? productDetails.ingredients.map(ingredient => ingredient.text || 'Unknown')
          : productDetails?.ingredients_text || 'N/A',
        caloriesPer100g: productDetails?.nutriments?.energy_100g || 0,
        sugarPer100g: productDetails?.nutriments?.sugars_100g || 0,
        date: expiry,
      };

      await saveProductForUser(userId, formattedProductDetails);
      alert('✅ Product saved successfully!');
      resetFlow();
    } catch (error) {
      console.error('Submit Error:', error);
      alert('Failed to save product: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-50 to-yellow-50 p-4">

      {/* Header / Title */}
      <h1 className="text-3xl font-bold text-amber-600 mb-6 flex items-center gap-2">
        {step === 0 && "📷 Scan a Barcode"}
        {step === 1 && "🎉 Barcode Found!"}
        {step === 2 && "📝 Save Details"}
      </h1>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-amber-100">

        {/* STEP 0: SCANNER */}
        {step === 0 && (
          <div className="p-4 flex flex-col items-center relative h-[60vh]">
            <div className="absolute inset-x-0 top-0 z-10 bg-black/50 text-white text-center py-2 text-sm">
              Point camera at a barcode
            </div>
            <div className="flex-1 w-full bg-black rounded-lg overflow-hidden relative">
              <BarcodeScannerComponent
                width="100%"
                height="100%"
                onUpdate={(err, result) => {
                  if (result) handleScanSuccess({ text: result.text || result.getText() });
                }}
                facingMode="environment"
                videoConstraints={{ width: 1280, height: 720, facingMode: "environment" }}
              />
            </div>
            <div className="mt-4 w-full">
              <p className="text-center text-gray-500 mb-2 text-sm">Or enter manually</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Type barcode..."
                  value={barcode}
                  onChange={setBarcode}
                  className="flex-1"
                />
                <Button onClick={() => { if (barcode) setStep(1); }} variant="primary" disabled={!barcode}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: CONFIRM / ERROR / LOADING */}
        {step === 1 && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="text-6xl mb-4">
              {errorMessage ? '⚠️' : '⏳'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {errorMessage ? 'Product Not Found' : 'Fetching Details...'}
            </h2>
            <div className="bg-gray-100 px-6 py-3 rounded-full text-xl font-mono font-bold text-gray-700 mb-8 border border-gray-300">
              {barcode}
            </div>

            {errorMessage ? (
              <div className="w-full">
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm w-full">
                  {errorMessage}
                </div>
                <Button onClick={handleFetchProduct} variant="primary" size="large" className="w-full mb-3">
                  🔄 Retry
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 animate-pulse">Looking up food information...</p>
            )}

            <Button onClick={resetFlow} variant="secondary" className="w-full mt-4">
              ❌ Scan Again
            </Button>
          </div>
        )}

        {/* STEP 2: SAVE */}
        {step === 2 && (
          <div className="p-6">
            {productDetails && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6">
                <h3 className="font-bold text-xl text-amber-800 mb-1">{productDetails.product_name || 'Unknown Product'}</h3>
                <p className="text-amber-600 text-sm mb-2">{productDetails.brands}</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="bg-white px-2 py-1 rounded border">{productDetails.quantity || 'Qty: 1'}</span>
                  <span className="bg-white px-2 py-1 rounded border">{productDetails.nutriments?.energy_100g || '0'} kcal</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2 ml-1">📅 Expiry Date</label>
                <input
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                  className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-amber-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" variant="primary" size="large" className="w-full py-4 text-lg shadow-xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none">
                  💾 Save to Pantry
                </Button>
                <Button type="button" onClick={resetFlow} variant="ghost" className="text-gray-500">
                  Start Over
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default BarcodeScanPage;
