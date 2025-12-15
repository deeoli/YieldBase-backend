'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface CalculationLimit {
  date: string;
  count: number;
}

const DAILY_CALCULATION_LIMIT = 3;
const LIMIT_STORAGE_KEY = 'yieldCalculatorLimit';

export default function YieldCalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [renovationCost, setRenovationCost] = useState('');
  const [numRooms, setNumRooms] = useState('');
  const [calculationsLeft, setCalculationsLeft] = useState(DAILY_CALCULATION_LIMIT);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    // Check daily limit from localStorage
    // Use YYYY-MM-DD format as per requirements
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(LIMIT_STORAGE_KEY);
    
    if (stored) {
      const limit: CalculationLimit = JSON.parse(stored);
      if (limit.date === today) {
        setCalculationsLeft(Math.max(0, DAILY_CALCULATION_LIMIT - limit.count));
      } else {
        // Reset for new day
        localStorage.setItem(LIMIT_STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
        setCalculationsLeft(DAILY_CALCULATION_LIMIT);
      }
    } else {
      setCalculationsLeft(DAILY_CALCULATION_LIMIT);
    }
  }, []);

  const calculateYield = () => {
    // Check if required fields are filled
    if (!purchasePrice || !monthlyRent) {
      return;
    }

    // Check limit BEFORE calculating
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(LIMIT_STORAGE_KEY);
    let limit: CalculationLimit = stored ? JSON.parse(stored) : { date: today, count: 0 };

    if (limit.date !== today) {
      limit = { date: today, count: 0 };
    }

    // If limit reached, show modal and DO NOT calculate
    if (limit.count >= DAILY_CALCULATION_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    // Increment count and save
    limit.count += 1;
    localStorage.setItem(LIMIT_STORAGE_KEY, JSON.stringify(limit));
    setCalculationsLeft(Math.max(0, DAILY_CALCULATION_LIMIT - limit.count));
    setHasCalculated(true);
  };

  // Calculations (only show if hasCalculated is true)
  const annualRent = hasCalculated && monthlyRent ? Number(monthlyRent) * 12 : 0;
  const netInvestment = hasCalculated && purchasePrice
    ? renovationCost
      ? Number(purchasePrice) + Number(renovationCost)
      : Number(purchasePrice)
    : 0;
  const yieldPercentage = hasCalculated && netInvestment > 0 && annualRent > 0
    ? (annualRent / netInvestment) * 100
    : 0;

  return (
    <>
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-heading font-bold text-text-dark mb-4">
            Yield Calculator
          </h1>
          <p className="text-lg text-text-muted mb-8">
            Calculate the potential rental yield for your UK property investment.
          </p>

          {calculationsLeft > 0 && (
            <div className="bg-yield-high-bg text-yield-high-text px-4 py-2 rounded-lg mb-6 inline-block">
              <span className="font-semibold">{calculationsLeft} free calculation{calculationsLeft !== 1 ? 's' : ''} remaining today</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-medium text-text-dark mb-2">
                  Purchase Price (£) *
                </label>
                <input
                  type="number"
                  id="purchasePrice"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="75000"
                  disabled={calculationsLeft <= 0}
                  className="w-full px-4 py-3 border border-border-grey rounded-xl focus:ring-2 focus:ring-accent-gold focus:border-transparent text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="monthlyRent" className="block text-sm font-medium text-text-dark mb-2">
                  Monthly Rent (£) *
                </label>
                <input
                  type="number"
                  id="monthlyRent"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="530"
                  disabled={calculationsLeft <= 0}
                  className="w-full px-4 py-3 border border-border-grey rounded-xl focus:ring-2 focus:ring-accent-gold focus:border-transparent text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="renovationCost" className="block text-sm font-medium text-text-dark mb-2">
                  Renovation Cost (£) <span className="text-text-muted">(optional)</span>
                </label>
                <input
                  type="number"
                  id="renovationCost"
                  value={renovationCost}
                  onChange={(e) => setRenovationCost(e.target.value)}
                  placeholder="5000"
                  disabled={calculationsLeft <= 0}
                  className="w-full px-4 py-3 border border-border-grey rounded-xl focus:ring-2 focus:ring-accent-gold focus:border-transparent text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="numRooms" className="block text-sm font-medium text-text-dark mb-2">
                  Number of Rooms <span className="text-text-muted">(optional)</span>
                </label>
                <input
                  type="number"
                  id="numRooms"
                  value={numRooms}
                  onChange={(e) => setNumRooms(e.target.value)}
                  placeholder="3"
                  disabled={calculationsLeft <= 0}
                  className="w-full px-4 py-3 border border-border-grey rounded-xl focus:ring-2 focus:ring-accent-gold focus:border-transparent text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
              <button
                onClick={calculateYield}
                disabled={!purchasePrice || !monthlyRent}
                className="w-full bg-primary-navy text-white px-6 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Calculate Yield
              </button>
            </div>

            {/* Results Card - Right/Bottom */}
            <div className="bg-background-light rounded-2xl p-8">
              <h2 className="text-2xl font-heading font-bold text-text-dark mb-6">
                Results
              </h2>
              {hasCalculated && purchasePrice && monthlyRent ? (
                <div className="space-y-6">
                  {/* Yield % - Large text, shown first */}
                  <div className="border-b border-border-grey pb-6">
                    <div className="text-sm text-text-muted mb-2">Yield</div>
                    <div className={`text-5xl font-heading font-bold ${
                      yieldPercentage >= 8 ? 'text-yield-high-text' : 'text-accent-gold'
                    }`}>
                      {yieldPercentage.toFixed(2)}%
                    </div>
                    {yieldPercentage >= 8 && (
                      <div className="mt-2 inline-block bg-yield-high-bg text-yield-high-text px-3 py-1 rounded-full text-xs font-semibold">
                        High Yield
                      </div>
                    )}
                  </div>
                  
                  {/* Annual Rent */}
                  <div>
                    <div className="text-sm text-text-muted mb-1">Annual Rent</div>
                    <div className="text-3xl font-heading font-bold text-text-dark">
                      £{annualRent.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Net Investment */}
                  <div>
                    <div className="text-sm text-text-muted mb-1">Net Investment</div>
                    <div className="text-3xl font-heading font-bold text-text-dark">
                      £{netInvestment.toLocaleString()}
                    </div>
                    {renovationCost && (
                      <div className="text-sm text-text-muted mt-1">
                        Purchase: £{Number(purchasePrice).toLocaleString()} + Renovation: £{Number(renovationCost).toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Optional: Rent per Room */}
                  {numRooms && Number(numRooms) > 0 && (
                    <div className="border-t border-border-grey pt-6">
                      <div className="text-sm text-text-muted mb-1">Rent per Room</div>
                      <div className="text-xl font-heading font-semibold text-text-dark">
                        £{(Number(monthlyRent) / Number(numRooms)).toFixed(2)}/month
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-text-muted">
                  Enter values and click &quot;Calculate Yield&quot; to see results
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Limit Modal */}
      <Transition appear show={showLimitModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowLimitModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-2xl font-heading font-bold text-text-dark mb-4">
                    Daily Limit Reached
                  </Dialog.Title>
                  <p className="text-text-muted mb-6">
                    You&apos;ve reached your free daily limit of {DAILY_CALCULATION_LIMIT} calculations.
                    <br /><br />
                    Create a free account or upgrade to unlock unlimited access. (coming soon)
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        // Placeholder - no backend yet
                        console.log('Notify me clicked');
                        setShowLimitModal(false);
                      }}
                      className="w-full bg-primary-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                    >
                      Notify me when this is available
                    </button>
                    <button
                      onClick={() => setShowLimitModal(false)}
                      className="w-full text-text-muted hover:text-text-dark"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

