import React, { useState, useEffect, useCallback } from 'react';
import { Popover } from '@headlessui/react';
import { Linkedin } from 'lucide-react';

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

function HelpButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xl transition-colors duration-200"
    >
      ?
    </button>
  );
}

function HelpPopup({ onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="help-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900">How to use the Charity Finance Checker</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              1. Enter your charity's financials in the input fields.<br/>
              2. Click "Generate Report" to see the financial analysis.<br/>
              3. Review the ratios and their interpretations in the report section.<br/>
              4. Use the information to assess your charity's financial health and make informed decisions.<br/>
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-2">Charity Finance Checker</h3>
            <p className="text-sm text-gray-300">
              A tool part of the <a href="https://nfptoolkit.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 transition-colors duration-200">NFP Toolkit</a>
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm">&copy; 2024 NFP Toolkit. All rights reserved.</p>
          </div>
          <div className="text-center md:text-right">
            <a 
              href="https://www.linkedin.com/company/nfp-toolkit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-white hover:text-blue-400 transition-colors duration-200"
            >
              <Linkedin size={20} className="mr-2" />
              <span>Follow us on LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}



const CharityFinanceChecker = () => {
  const [financials, setFinancials] = useState({
    totalRevenue: '',
    totalExpenses: '',
    netIncome: '',
    currentAssets: '',
    currentLiabilities: '',
    employmentCosts: ''
  });

  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFinancials(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const calculateRatios = useCallback(() => {
    const { totalRevenue, totalExpenses, netIncome, currentAssets, currentLiabilities, employmentCosts } = financials;
    if (!totalRevenue || !totalExpenses || !netIncome || !currentAssets || !currentLiabilities || !employmentCosts) {
      setError('Please fill in all fields.');
      return null;
    }

    const profitMargin = (netIncome / totalRevenue) * 100;
    const expenseRatio = (totalExpenses / totalRevenue) * 100;
    const liquidityCover = currentAssets / currentLiabilities;
    const employmentCostRatio = (employmentCosts / totalExpenses) * 100;

    return {
      profitMargin: {
        value: profitMargin,
        calculation: `(${netIncome} / ${totalRevenue}) * 100`
      },
      expenseRatio: {
        value: expenseRatio,
        calculation: `(${totalExpenses} / ${totalRevenue}) * 100`
      },
      liquidityCover: {
        value: liquidityCover,
        calculation: `${currentAssets} / ${currentLiabilities}`
      },
      employmentCostRatio: {
        value: employmentCostRatio,
        calculation: `(${employmentCosts} / ${totalExpenses}) * 100`
      }
    };
  }, [financials]);

  const interpretRatio = useCallback((ratio, name) => {
    switch (name) {
      case 'profitMargin':
        return ratio > 10 ? 'Good' : ratio > 5 ? 'OK' : 'Bad';
      case 'expenseRatio':
        return ratio < 65 ? 'Good' : ratio < 80 ? 'OK' : 'Bad';
      case 'liquidityCover':
        return ratio > 2 ? 'Good' : ratio > 1 ? 'OK' : 'Bad';
      case 'employmentCostRatio':
        return ratio < 30 ? 'Good' : ratio < 40 ? 'OK' : 'Bad';
      default:
        return 'Unknown';
    }
  }, []);

  const generateReport = useCallback(() => {
    const ratios = calculateRatios();
    if (ratios) {
      setReport(
        Object.entries(ratios).map(([name, data]) => ({
          name,
          value: data.value.toFixed(2),
          calculation: data.calculation,
          interpretation: interpretRatio(data.value, name)
        }))
      );
    }
  }, [calculateRatios, interpretRatio]);

  const getInterpretationColor = useCallback((interpretation) => {
    switch (interpretation) {
      case 'Good':
        return 'text-green-600 text-base font-semibold';
      case 'OK':
        return 'text-yellow-600 text-base font-semibold';
      case 'Bad':
        return 'text-red-600 text-base font-semibold';
      default:
        return 'text-gray-600 text-base font-semibold';
    }
  }, []);

  const tooltips = {
    totalRevenue: "The total amount of money received by the charity in a given period",
    totalExpenses: "The total costs incurred by the charity in a given period",
    netIncome: "The difference between total revenue and total expenses",
    currentAssets: "Assets that can be converted to cash within one year",
    currentLiabilities: "Debts or obligations due within one year",
    employmentCosts: "Total costs related to employing staff"
  };

  const ratioExplanations = {
    profitMargin: {
      description: "Measures the charity's ability to generate surplus. Higher margins can be reinvested into programs.",
      thresholds: {
        Good: "> 10%",
        OK: "5% - 10%",
        Bad: "< 5%"
      }
    },
    expenseRatio: {
      description: "Indicates how efficiently the charity uses its resources. Lower ratios are generally better.",
      thresholds: {
        Good: "< 65%",
        OK: "65% - 80%",
        Bad: "> 80%"
      }
    },
    liquidityCover: {
      description: "Assesses the charity's ability to meet short-term obligations.",
      thresholds: {
        Good: "> 2",
        OK: "1 - 2",
        Bad: "< 1"
      }
    },
    employmentCostRatio: {
      description: "Shows the proportion of expenses allocated to staff costs.",
      thresholds: {
        Good: "< 30%",
        OK: "30% - 40%",
        Bad: "> 40%"
      }
    }
  };

  useEffect(() => {
    if (Object.values(financials).every(val => val !== '')) {
      generateReport();
    }
  }, [financials, generateReport]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
            <div className="px-6 py-8 sm:p-10">
              <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Charity Finance Checker</h1>
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                  <p>{error}</p>
                </div>
              )}
              <div className="space-y-6">
                {Object.entries(financials).map(([key, value]) => (
                  <div key={key} className="relative">
                    <div className="flex items-center mb-2">
                    <label
                      htmlFor={key}
                      className="block text-lg font-medium text-gray-800"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                      <Popover className="ml-2">
                        <Popover.Button className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <InfoIcon />
                        </Popover.Button>
                        <Popover.Panel className="absolute z-10 w-64 px-4 mt-3 transform -translate-x-1/2 left-1/2 sm:px-0 lg:max-w-3xl">
                          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="p-4 bg-white">
                              <p className="text-sm text-gray-500">{tooltips[key]}</p>
                            </div>
                          </div>
                        </Popover.Panel>
                      </Popover>
                    </div>
                    <input
                      type="number"
                      name={key}
                      id={key}
                      value={value}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base py-3 px-4"
                      placeholder="Enter value"
                      aria-label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    />
                  </div>
                ))}
                <button
                  onClick={generateReport}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                  aria-label="Generate Report"
                >
                  Generate Report
                </button>
              </div>
            </div>
            {report && (
              <div className="bg-gray-50 px-6 py-8 sm:p-10 border-t border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Financial Report</h3>
                <div className="grid grid-cols-1 gap-6">
                  {report.map((item) => (
                    <div key={item.name} className="bg-white overflow-visible shadow rounded-lg relative">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center mb-2">
                          <h4 className="text-lg font-medium text-gray-900 mr-2">
                            {item.name.charAt(0).toUpperCase() + item.name.slice(1).replace(/([A-Z])/g, ' $1')}
                          </h4>
                          <Popover className="relative">
                            {({ open }) => (
                              <>
                                <Popover.Button className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                  <InfoIcon />
                                </Popover.Button>
                                <Popover.Panel
                                  className={`absolute z-50 w-72 transform sm:px-0 lg:max-w-3xl ${
                                    open ? 'opacity-100' : 'opacity-0'
                                  }`}
                                  style={{
                                    left: '100%',
                                    top: '0',
                                    marginLeft: '0.5rem',
                                  }}
                                >
                                  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                    <div className="p-4 bg-white">
                                    <p className="text-sm text-gray-500 mb-2">{ratioExplanations[item.name].description}</p>
                                  <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700">Thresholds:</p>
                                    <ul className="mt-1 text-sm text-gray-500">
                                      {Object.entries(ratioExplanations[item.name].thresholds).map(([rating, threshold]) => (
                                        <li key={rating} className="flex justify-between">
                                          <span>{rating}:</span>
                                          <span>{threshold}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </Popover.Panel>
                          </>
                        )}
                      </Popover>
                    </div>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{item.value}%</p>
                    <p className="mt-2 flex items-center text-sm">
                    <span className={`px-1 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getInterpretationColor(item.interpretation)}`}>
                      {item.interpretation}
                    </span>
                    </p>
                    <div className="mt-4 bg-gray-100 p-3 rounded-md">
                      <p className="text-sm font-medium text-gray-700">Calculation:</p>
                      <p className="text-sm text-gray-600 font-mono">{item.calculation} = {item.value}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  <Footer />
  <HelpButton onClick={() => setIsHelpOpen(true)} />
  {isHelpOpen && <HelpPopup onClose={() => setIsHelpOpen(false)} />}
</>
);
};
export default CharityFinanceChecker;