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

  // Helper to determine Nutriscore color
  const getNutriscoreColor = (grade) => {
    const colors = {
      a: 'bg-green-600',
      b: 'bg-green-400',
      c: 'bg-yellow-400',
      d: 'bg-orange-400',
      e: 'bg-red-500',
    };
    return colors[grade?.toLowerCase()] || 'bg-gray-300';
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 text-gray-800 font-sans">

      {/* Header */}
      <div className="w-full bg-white shadow-sm p-4 flex items-center justify-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>🔎</span> Smart Food Scanner
        </h1>
      </div>

      <div className="w-full max-w-md flex-1 flex flex-col p-4">

        {/* STEP 0: CONTINOUS SCANNER */}
        {step === 0 && (
          <div className="flex-1 flex flex-col relative rounded-3xl overflow-hidden bg-black shadow-2xl">
            {/* Header Overlay */}
            <div className="absolute top-0 inset-x-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-6 text-center">
              <p className="text-white/90 font-medium text-lg">Scan a barcode</p>
              <p className="text-white/50 text-sm">Hold camera steady</p>
            </div>

            {/* Scanner viewfinder */}
            <div className="flex-1 relative">
              <BarcodeScannerComponent
                width="100%"
                height="100%"
                onUpdate={(err, result) => {
                  if (result) handleScanSuccess({ text: result.text || result.getText() });
                }}
                facingMode="environment"
                videoConstraints={{ width: 1280, height: 720, facingMode: "environment" }}
              />

              {/* Laser Animation & Corners */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative">
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-amber-400 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-amber-400 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-amber-400 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-amber-400 rounded-br-xl"></div>

                  {/* Scanning Laser */}
                  <div className="absolute w-full h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_2s_infinite]"></div>
                </div>
              </div>
            </div>

            {/* Footer Manual Entry */}
            <div className="bg-white p-4 pb-8 rounded-t-3xl -mt-6 z-30 relative">
              <p className="text-center text-gray-400 text-xs mb-3 uppercase tracking-wider font-bold">Or enter manually</p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 5449000000996"
                  value={barcode}
                  onChange={setBarcode}
                  className="flex-1 bg-gray-50 border-gray-200"
                />
                <Button onClick={() => { if (barcode) setStep(1); }} variant="primary" disabled={!barcode} className="aspect-square !p-0 w-12 flex items-center justify-center rounded-xl bg-amber-500">
                  ➜
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: LOADING / ERROR */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {errorMessage ? (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 w-full animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  🤷‍♂️
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Found</h2>
                <p className="text-gray-500 mb-6">We couldn't find a product with that barcode.</p>

                <div className="bg-gray-50 p-3 rounded-xl font-mono text-gray-600 mb-6 border border-gray-200">
                  {barcode}
                </div>

                <Button onClick={handleFetchProduct} variant="primary" className="w-full mb-3 shadow-red-200 shadow-xl bg-gradient-to-r from-red-500 to-pink-600">
                  🔄 Retry Search
                </Button>
                <Button onClick={resetFlow} variant="ghost" className="w-full">
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-xl font-semibold text-gray-700">Looking it up...</p>
                <p className="text-gray-400 text-sm mt-1">Fetching details from global database</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PRODUCT DETAILS & SAVE */}
        {step === 2 && productDetails && (
          <div className="flex-1 overflow-y-auto pb-20 animate-in slide-in-from-bottom-10 duration-500">
            {/* Product Card */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-gray-100">
              {/* Image Header */}
              <div className="h-48 bg-gray-100 relative mb-4">
                {productDetails.image_front_url ? (
                  <img src={productDetails.image_front_url} alt={productDetails.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">📷</div>
                )}
                <div className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${getNutriscoreColor(productDetails.nutriscore_grade)}`}>
                  Nutriscore {productDetails.nutriscore_grade?.toUpperCase() || '?'}
                </div>
              </div>

              <div className="px-6 pb-6">
                <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-1">{productDetails.product_name || 'Unknown Product'}</h2>
                <p className="text-gray-500 font-medium mb-4">{productDetails.brands}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-amber-50 p-3 rounded-2xl text-center">
                    <p className="text-xs text-amber-600 font-bold uppercase">Energy</p>
                    <p className="font-bold text-gray-800">{productDetails.nutriments?.energy_value || 0}</p>
                    <p className="text-[10px] text-gray-400">kcal</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-2xl text-center">
                    <p className="text-xs text-blue-600 font-bold uppercase">Sugar</p>
                    <p className="font-bold text-gray-800">{productDetails.nutriments?.sugars_100g?.toFixed(1) || 0}</p>
                    <p className="text-[10px] text-gray-400">g/100g</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-2xl text-center">
                    <p className="text-xs text-purple-600 font-bold uppercase">Fat</p>
                    <p className="font-bold text-gray-800">{productDetails.nutriments?.fat_100g?.toFixed(1) || 0}</p>
                    <p className="text-[10px] text-gray-400">g/100g</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                  <span className="font-bold text-gray-800">Ingredients: </span>
                  <span className="italic line-clamp-2">
                    {Array.isArray(productDetails.ingredients)
                      ? productDetails.ingredients.map(i => i.text).join(', ')
                      : 'Not listed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📅</span> Expiry Date
              </h3>
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-xl font-medium text-gray-700 focus:ring-2 focus:ring-amber-500 outline-none mb-6"
              />

              <div className="flex flex-col gap-3">
                <Button type="submit" variant="success" size="large" className="w-full py-4 text-lg shadow-green-200 shadow-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600">
                  Add to Pantry
                </Button>
                <Button type="button" onClick={resetFlow} variant="ghost" className="text-gray-400">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <style jsx>{`
          @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BarcodeScanPage;
