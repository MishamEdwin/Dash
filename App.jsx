import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar'
import Header from './components/MainHeader'
import Home from './components/Home';
import OverAllReview from './components/OverAllReview';
import Liability from './components/Liability';
import Marine from './components/Marine';
import Engineering from './components/Engineering';
import Fire from './components/Fire';     
import MonthYearSelector from './components/MonthYearSelector';

function App() {
  const [selectedOption, setSelectedOption] = useState('Home')
  const [selectedDate, setSelectedDate] = useState({ month: 'May', year: '2025-26' })

  const handleOptionClick = (option) => {
    setSelectedOption(option)
  }

  const handleHomeClick = () => {
    setSelectedOption('Home')
  }

  const handleLogout = () => {
    // Logout logic would go here
  }

  const handleDateChange = (dateObj) => {
    setSelectedDate(dateObj);
  }

  const renderContent = () => {
    switch (selectedOption) {
      case 'Home':
        return <Home selectedDate={selectedDate} onDateChange={handleDateChange} />;
      case 'OverAll Review':
        return <OverAllReview selectedDate={selectedDate} />;
      case 'Liability':
        return <Liability selectedDate={selectedDate} />;
      case 'Marine':
        return <Marine selectedDate={selectedDate} />;
      case 'Engineering':
        return <Engineering selectedDate={selectedDate} />
      case 'Fire':
        return <Fire selectedDate={selectedDate} />
      case 'Upload':
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-6">Upload Data</h2>
            <MonthYearSelector onChange={handleDateChange} />
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-blue-600">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {selectedOption} Dashboard
            </h2>
            <p className="text-gray-600 mb-8">
              Content for {selectedOption} analysis will be displayed here
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-sm text-gray-700">
                This section will contain detailed analytics, charts, and data visualizations
                for the selected insurance category.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <BrowserRouter basename="/main_dashboard">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          selectedOption={selectedOption}
          onOptionClick={handleOptionClick}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header
            selectedOption={selectedOption}
            onHomeClick={handleHomeClick}
            onLogout={handleLogout}
          />

          {/* Main Content */}
          <main className="flex-1 p-2 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 min-h-[500px]">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
