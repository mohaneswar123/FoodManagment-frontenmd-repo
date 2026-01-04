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

  const [scannerKey, setScannerKey] = useState(0);

  const handleRefresh = () => {
    setScannerKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden">

      {/* BACKGROUND SCANNER Layer - Always rendered to keep camera active/ready */}
      <div className={`absolute inset-0 z-0 transition-all duration-700 ${step > 0 ? 'filter blur-md scale-110 opacity-40' : 'opacity-100'}`}>
        <BarcodeScannerComponent
          key={scannerKey}
          width="100%"
          height="100%"
          delay={300}
          onUpdate={(err, result) => {
            if (result) handleScanSuccess({ text: result.text || result.getText() });
          }}
          facingMode="environment"
          videoConstraints={{
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "environment",
            frameRate: { ideal: 30, max: 60 }
          }}
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none"></div>
      </div>

      {/* TOP HEADER - Glassmorphism */}
      <div className="absolute top-0 inset-x-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
            <span className="text-xl">🥗</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white drop-shadow-md">PantryLens</h1>
            <p className="text-xs text-white/60 font-medium tracking-wider uppercase">AI Food Scanner</p>
          </div>
        </div>

        {step === 0 && (
          <button
            onClick={handleRefresh}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all shadow-lg text-white"
            title="Refresh Camera"
          >
            <span className="text-xl">🔄</span>
          </button>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-40 w-full h-full flex flex-col justify-end pb-safe">

        {/* STEP 0: SCANNER UI */}
        {step === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Dynamic Scan Frame */}
            <div className="w-[75%] aspect-square max-w-sm relative">
              {/* Corners */}
              <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-white/80 rounded-tl-3xl drop-shadow-lg"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-white/80 rounded-tr-3xl drop-shadow-lg"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-white/80 rounded-bl-3xl drop-shadow-lg"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-white/80 rounded-br-3xl drop-shadow-lg"></div>

              {/* Animated Laser */}
              <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-[scan_2.5s_ease-in-out_infinite]"></div>

              <p className="absolute -bottom-12 inset-x-0 text-center text-white/90 font-medium tracking-wide text-sm drop-shadow-md">
                Align code within frame
              </p>
            </div>

            {/* Manual Entry Fab - Floating at bottom */}
            <div className="absolute bottom-10 inset-x-6 pointer-events-auto">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex gap-3 shadow-2xl items-center">
                <Input
                  placeholder="Or enter barcode manually..."
                  value={barcode}
                  onChange={setBarcode}
                  className="flex-1 bg-transparent border-none text-white placeholder-white/40 focus:ring-0 text-sm h-12"
                />
                <Button
                  onClick={() => { if (barcode) setStep(1); }}
                  disabled={!barcode}
                  variant="primary"
                  className="h-10 w-14 rounded-xl flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg"
                >
                  ➜
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: LOADING STATE */}
        {step === 1 && !errorMessage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-500">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl flex flex-col items-center shadow-2xl">
              <div className="w-16 h-16 rounded-full border-4 border-t-amber-400 border-white/20 animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Searching Database</h2>
              <p className="text-white/60 font-medium">Identifying product...</p>
              <div className="mt-6 px-4 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-mono text-white/80">
                {barcode}
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: ERROR STATE */}
        {step === 1 && errorMessage && (
          <div className="absolute inset-x-0 bottom-0 p-4 z-50 animate-in slide-in-from-bottom duration-500">
            <div className="bg-white rounded-[2rem] p-6 shadow-2xl mb-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
                🚫
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Product Not Found</h2>
              <p className="text-gray-500 text-center text-sm mb-6 px-4">
                We couldn't identify this barcode in our global database.
              </p>

              <div className="flex gap-3">
                <Button onClick={resetFlow} variant="ghost" className="flex-1 text-gray-500 bg-gray-50 hover:bg-gray-100">
                  Dismiss
                </Button>
                <Button onClick={handleFetchProduct} variant="primary" className="flex-1 bg-gray-900 text-white hover:bg-gray-800">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: RESULT SHEET */}
        {step === 2 && productDetails && (
          <div className="absolute inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-500 max-h-[85vh] flex flex-col">
            <div className="bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-full w-full">

              {/* Drag Handle */}
              <div className="w-full h-6 flex items-center justify-center pt-2 flex-shrink-0 bg-white">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
              </div>

              <div className="overflow-y-auto px-6 pb-8 pt-2">
                {/* Hero Section */}
                <div className="flex gap-4 mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 p-2 flex-shrink-0 border border-gray-100 shadow-sm relative overflow-hidden">
                    {productDetails.image_front_url ? (
                      <img src={productDetails.image_front_url} alt="Product" className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                    <div className={`absolute bottom-0 inset-x-0 h-1 ${getNutriscoreColor(productDetails.nutriscore_grade)}`}></div>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                        {productDetails.brands || 'Unknown Brand'}
                      </span>
                      {productDetails.nutriscore_grade && (
                        <span className={`text-[10px] font-bold tracking-wider uppercase text-white px-2 py-0.5 rounded-md ${getNutriscoreColor(productDetails.nutriscore_grade)}`}>
                          Score {productDetails.nutriscore_grade.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
                      {productDetails.product_name || 'Unknown Product'}
                    </h2>
                    <div className="text-sm text-gray-400 font-medium">
                      {productDetails.quantity || '1 unit'}
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { label: 'Calories', val: productDetails.nutriments?.energy_value, unit: 'kcal', color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Sugar', val: productDetails.nutriments?.sugars_100g, unit: 'g', color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Fat', val: productDetails.nutriments?.fat_100g, unit: 'g', color: 'text-purple-500', bg: 'bg-purple-50' },
                  ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm`}>
                      <span className={`text-xs font-bold uppercase tracking-wider ${stat.color} mb-1 opacity-80`}>{stat.label}</span>
                      <span className="text-lg font-black text-gray-800 leading-none mb-0.5">{stat.val ? Math.round(stat.val) : '-'}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{stat.unit}</span>
                    </div>
                  ))}
                </div>

                {/* Save Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Expiry Date</label>
                    <input
                      type="date"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required
                      className="w-full bg-gray-50 hover:bg-gray-100 transition-colors border-2 border-transparent focus:border-amber-500 text-gray-900 text-lg font-semibold rounded-2xl px-5 py-4 outline-none appearance-none"
                    />
                    <div className="absolute right-5 top-[3.2rem] pointer-events-none text-gray-400">📅</div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" onClick={resetFlow} variant="ghost" className="flex-1 py-4 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-2xl">
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-[2] py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl shadow-xl shadow-gray-200">
                      Save to Pantry
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanPage;
