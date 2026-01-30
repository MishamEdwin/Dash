import React, { useState } from 'react'; 
import { X, Download, Upload as UploadIcon, FileText } from 'lucide-react'; 
 
const Upload = () => { 
  const [selectedDate, setSelectedDate] = useState({ month: 'January', year: '2025-26' }); 
  const [activeTab, setActiveTab] = useState('OverAllReview'); 
  const [activeModal, setActiveModal] = useState(null); 
 
  // Data mapping from your tables.png  
  const sectionData = { 
    OverAllReview: [ 
      'LOB wise NOP GWP GIC:GEP', 'Broker wise GWP Report', 'LOB & Segment wise Report',  
      'LOB wise Growth % (GWP)', 'Last Five year comparison', 'FIRE - Banca Channel wise UnderInsurance Report', 
      'Cordys TAT Report', 'Inward Fac', 'New Business Sourced (>5 lakhs)', 'New Initiatives', 'Large risk underwritten - More than 2500 Cr','New Business Sourced (>5 lakhs)' 
    ], 
    Fire: [ 
      'PRD Mix Exposure wise', 'PRD Mix on GWP', 'State wise Exposure', 'Average Rate Analysis BGR', 
      'Average Rate Analysis Non-BGR', 'Product wise Premium & Claims Report -Fire', 'SFSP, Sookshama & Laghu - Per lac Premium & Claim', 
      'FIRE-Segment wise Per policy Premium', 'FIRE-Segment wise NOP & NOC', 'Fire-Per Claim ticket size- comparison', 
      'Top 10 Occupancies ( in terms of GWP)- FIRE', 'Banca - Top 10 Occupancies', 'Banca (Partner Others) - Channel wise Report', 
      'Banca PSU Partner Report', 'Fire- Banca PSU - Dwelling Annual and Long Term', 'Fire Banca- Partner Others - Dwelling Annual and Long Term', 
      'FIRE - PSU Bank wise NOP', 'FIRE - PSU Bank wise GWP', 'FIRE - Occupancy wise GWP (PSU Banks)', 'PSU Banks - SI Band wise Report', 
      'PSU Banks - Risk location Region wise Report' 
    ], 
    Engineering: [ 
      'Portfolio - GWP Mix', 'CPM - Segment & Channel wise Premium contribution', 'IBL _ CPM - Top 15 Risk location wise Premium & Claims Report', 
      'MBD & EEI - Segment wise Report', 'IBL - CPM Equipment wise Report', 'EAR - Project wise Report', 'CAR - Project wise Report' 
    ], 
    Marine: [ 
      'Segment wise GWP Mix', 'Segment wise Average Premium & Rate', 'Segment wise Renewal Ratio',  
      'Marine policies issued with CPM cover', 'Marine Cargo wise Premium Report' 
    ], 
    Liability: [ 
      'WC - Top 5 Occupancy', 'Major Clients', 'CGL - Top 5 Occupancy', 'PI - Top 5 Occupancy' 
    ] 
  }; 
 
  const tabs = Object.keys(sectionData); 
 
  const handleDownloadTemplate = (templateName) => { 
    const link = document.createElement('a'); 
    link.href = `/src/templates/${templateName}.xlsx`; 
    link.download = `${templateName}_template.xlsx`; 
    link.click(); 
  }; 
 
  return ( 
    <div className="p-6 max-w-6xl mx-auto bg-white min-h-screen"> 
      {/* Header Section */} 
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b pb-6 border-gray-100"> 
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"> 
          <UploadIcon className="text-blue-600" /> Excel File Uploader 
        </h1> 
         
        <div className="flex gap-4 mt-4 md:mt-0"> 
          <div className="flex flex-col"> 
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Month</label> 
            <select  
              value={selectedDate.month} 
              onChange={(e) => setSelectedDate({ ...selectedDate, month: e.target.value })} 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
            > 
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October','November', 'December'].map(m => ( 
                <option key={m} value={m}>{m}</option> 
              ))} 
            </select> 
          </div> 
          <div className="flex flex-col"> 
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Financial Year</label> 
            <select  
              value={selectedDate.year} 
              onChange={(e) => setSelectedDate({ ...selectedDate, year: e.target.value })} 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
            > 
              <option value="2024-25">2024-25</option> 
              <option value="2025-26">2025-26</option> 
            </select> 
          </div> 
        </div> 
      </div> 
 
      {/* Tabs Navigation */} 
      <div className="flex flex-wrap border-b border-gray-200 mb-6"> 
        {tabs.map((tab) => ( 
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`mr-2 px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${ 
              activeTab === tab  
                ? 'border-blue-600 text-blue-600'  
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' 
            }`} 
          > 
            {tab.replace(/([A-Z])/g, ' $1').trim()} 
          </button> 
        ))} 
      </div> 
 
      {/* Buttons Grid */} 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"> 
        {sectionData[activeTab].map((item, index) => ( 
          <button 
            key={index} 
            onClick={() => setActiveModal(item)} 
            className="flex items-center p-3 text-left text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 
transition-all duration-200 shadow-sm" 
          > 
            <FileText className="w-4 h-4 mr-3 opacity-60" /> 
            {item} 
          </button> 
        ))} 
      </div> 
 
      {/* Upload Modal */} 
      {activeModal && ( 
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 
backdrop-blur-sm p-4"> 
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in 
fade-in zoom-in duration-200"> 
            <div className="flex items-center justify-between p-4 border-b"> 
              <h3 className="text-lg font-semibold text-gray-800 truncate pr-4"> 
                {activeModal} 
              </h3> 
              <button  
                onClick={() => setActiveModal(null)} 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors" 
              > 
                <X className="w-6 h-6 text-gray-500" /> 
              </button> 
            </div> 
             
            <div className="p-6"> 
              <div className="mb-6"> 
                <button  
                  onClick={() => handleDownloadTemplate(activeModal)} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 
text-green-700 font-semibold rounded-xl border border-green-200 hover:bg-green-100 
transition-colors" 
                > 
                  <Download className="w-5 h-5" /> Download Template 
                </button> 
              </div> 
 
              <div className="space-y-2"> 
                <label className="block text-sm font-medium text-gray-700">Upload Data File</label> 
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 
border-dashed rounded-xl hover:border-blue-400 transition-colors bg-gray-50"> 
                  <div className="space-y-1 text-center"> 
                    <UploadIcon className="mx-auto h-10 w-10 text-gray-400" /> 
                    <div className="flex text-sm text-gray-600"> 
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent 
rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"> 
                        <span>Browse files</span> 
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" 
accept=".xlsx, .xls" /> 
                      </label> 
                    </div> 
                    <p className="text-xs text-gray-500">Excel files only (max. 10MB)</p> 
                  </div> 
                </div> 
              </div> 
               
              <div className="mt-8 flex gap-3"> 
                <button  
                  onClick={() => setActiveModal(null)} 
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                > 
                  Cancel 
                </button> 
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
font-medium shadow-md shadow-blue-200 transition-colors"> 
                  Upload File 
                </button> 
              </div> 
            </div> 
          </div> 
        </div> 
      )} 
    </div> 
  ); 
}; 
 
export default Upload; 
