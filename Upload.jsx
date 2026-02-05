import React, { useState } from 'react'; 
import { X, Download, Upload as UploadIcon, FileText, CheckCircle, AlertCircle } from 
'lucide-react'; 
import * as XLSX from 'xlsx'; 
const Upload = () => { 
const [selectedDate, setSelectedDate] = useState({ month: 'January', year: '2025-26' }); 
const [activeTab, setActiveTab] = useState('OverAllReview'); 
const [activeModal, setActiveModal] = useState(null); 
// State for specific files in LOB Report 
const [lobFile, setLobFile] = useState(null); 
const [dwellingsFile, setDwellingsFile] = useState(null); 
const [processing, setProcessing] = useState(false); 
// Data mapping 
  const sectionData = { 
    OverAllReview: [ 
      'LOB wise NOP GWP GIC:GEP', 'Broker wise GWP Report', 'LOB & Segment wise Report', 
      'LOB wise Growth % (GWP)', 'Last Five year comparison', 'FIRE - Banca Channel wise UnderInsurance Report', 
      'Cordys TAT Report', 'Inward Fac', 'New Business Sourced (>5 lakhs)', 'New Initiatives', 'Large risk underwritten - More than 2500 Cr' 
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
 
  // --- Helper: Parse Excel Numbers (Handles commas, parenthesis for negative, blanks) --- 
  const parseExcelNumber = (val) => { 
    if (val === undefined || val === null || val === '') return 0; 
    if (typeof val === 'number') return val; 
     
    let str = val.toString().trim(); 
    if (str === '-') return 0; // Handle accounting dash 
 
    // Check for parenthesis negative notation (e.g., "(21,751)") 
    let isNegative = false; 
    if (str.startsWith('(') && str.endsWith(')')) { 
      isNegative = true; 
      str = str.replace(/[()]/g, ''); 
    } 
 
    // Remove commas 
    str = str.replace(/,/g, ''); 
 
    const parsed = parseFloat(str); 
    return isNaN(parsed) ? 0 : (isNegative ? -parsed : parsed); 
  }; 
 
  // --- Logic: Process LOB & Segment File --- 
  const processLobFile = (data) => { 
    // Structure: Group by Time -> then by LOB 
    const grouped = {}; 
 
    data.forEach(row => { 
      // Key mapping based on your excel headers 
      const time = row['Time']; 
      const lob = row['LOB']; 
       
      if (!time || !lob) return; 
 
      if (!grouped[time]) { 
        grouped[time] = {}; 
      } 
      if (!grouped[time][lob]) { 
        grouped[time][lob] = { 
          "Total Prem": 0, 
          "Total Earned Prem": 0, 
          "Total Net Pol": 0, 
          "Total Claim incurred in period": 0 
        }; 
      } 
 
      grouped[time][lob]["Total Prem"] += parseExcelNumber(row['Prem']); 
      grouped[time][lob]["Total Earned Prem"] += parseExcelNumber(row['Earned Prem']); 
      grouped[time][lob]["Total Net Pol"] += parseExcelNumber(row['Net Pol']); 
      grouped[time][lob]["Total Claim incurred in period"] += parseExcelNumber(row['Claim incurred in period']); 
    }); 
 
    // Convert to final array format 
    return Object.keys(grouped).map(timeKey => ({ 
      "Time": timeKey, 
      "LOB": grouped[timeKey] 
    })); 
  }; 
 
  // --- Logic: Process Dwellings File --- 
  const processDwellingsFile = (data) => { 
    // Structure: Group by Time only 
    const grouped = {}; 
 
    data.forEach(row => { 
      const time = row['Time']; 
      if (!time) return; 
 
      if (!grouped[time]) { 
        grouped[time] = { 
          "Total Prem": 0, 
          "Total Earned Prem": 0, 
          "Total Net Pol": 0, 
          "Total Claim incurred in period": 0 
        }; 
      } 
 
      grouped[time]["Total Prem"] += parseExcelNumber(row['Prem']); 
      grouped[time]["Total Earned Prem"] += parseExcelNumber(row['Earned Prem']); 
      grouped[time]["Total Net Pol"] += parseExcelNumber(row['Net Pol']); 
      grouped[time]["Total Claim incurred in period"] += parseExcelNumber(row['Claim incurred in period']); 
    }); 
 
    // Convert to final array format 
    return Object.keys(grouped).map(timeKey => ({ 
      "Time": timeKey, 
      ...grouped[timeKey] 
    })); 
  }; 
 
  // --- Trigger Download of JSON --- 
  const downloadJson = (data, filename) => { 
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 
2)); 
    const downloadAnchorNode = document.createElement('a'); 
    downloadAnchorNode.setAttribute("href", dataStr); 
    downloadAnchorNode.setAttribute("download", filename); 
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click(); 
    downloadAnchorNode.remove(); 
  }; 
 
  // --- Main Upload Handler --- 
  const handleUploadAndProcess = async () => { 
    setProcessing(true); 
     
    // 1. Process LOB File 
    if (lobFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        const sheetName = wb.SheetNames[0]; 
        const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]); 
        const processedData = processLobFile(json); 
        downloadJson(processedData, "LOB_AND_SEGMENT_WISE_DATA.json"); 
      }; 
      reader.readAsBinaryString(lobFile); 
    } 
 
    // 2. Process Dwellings File 
    if (dwellingsFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        const sheetName = wb.SheetNames[0]; 
        const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]); 
        const processedData = processDwellingsFile(json); 
        downloadJson(processedData, "Dwellings.json"); 
      }; 
      reader.readAsBinaryString(dwellingsFile); 
    } 
 
    // Small timeout to simulate processing visualization 
    setTimeout(() => { 
      setProcessing(false); 
      setActiveModal(null); 
      setLobFile(null); 
      setDwellingsFile(null); 
      alert("Files processed! JSON files have been downloaded. Please move them to 'src/data'."); 
    }, 1000); 
  }; 
 
  // --- UI: Reset state when closing modal --- 
  const closeModal = () => { 
    setActiveModal(null); 
    setLobFile(null); 
    setDwellingsFile(null); 
  }; 
 
  return ( 
    <div className="p-6 max-w-6xl mx-auto bg-white min-h-screen"> 
      {/* Header Section */} 
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b pb-6 
border-gray-100"> 
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"> 
          <UploadIcon className="text-blue-600" /> Excel File Uploader 
        </h1> 
         
        <div className="flex gap-4 mt-4 md:mt-0"> 
          <div className="flex flex-col"> 
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider 
mb-1">Month</label> 
            <select  
              value={selectedDate.month} 
              onChange={(e) => setSelectedDate({ ...selectedDate, month: e.target.value })} 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
            > 
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 
'November', 'December'].map(m => ( 
                <option key={m} value={m}>{m}</option> 
              ))} 
            </select> 
          </div> 
          <div className="flex flex-col"> 
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider 
mb-1">Financial Year</label> 
            <select  
              value={selectedDate.year} 
              onChange={(e) => setSelectedDate({ ...selectedDate, year: e.target.value })} 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
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
            className="flex items-center p-3 text-left text-sm font-medium text-gray-700 bg-gray-50 
border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 
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
                onClick={closeModal} 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors" 
              > 
                <X className="w-6 h-6 text-gray-500" /> 
              </button> 
            </div> 
             
            <div className="p-6"> 
              {/* Special Layout for LOB wise NOP GWP GIC:GEP */} 
              {activeModal === 'LOB wise NOP GWP GIC:GEP' ? ( 
                <div className="space-y-4"> 
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3"> 
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /> 
                    <p className="text-xs text-blue-800"> 
                      Upload one or both files. The system will process them and download the JSON data 
automatically. 
                    </p> 
                  </div> 
 
                  {/* Input 1: LOB & Segment Wise */} 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">1. LOB and Segment wise 
Data</label> 
                    <div className="flex items-center gap-3"> 
                       <label className="flex-1 cursor-pointer"> 
                          <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                            {lobFile ? ( 
                              <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                            ) : ( 
                              <span>Choose Excel File</span> 
                            )} 
                          </div> 
                          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setLobFile(e.target.files[0])} /> 
                       </label> 
                       {lobFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{lobFile.name}</span>} 
                    </div> 
                  </div> 
 
                  {/* Input 2: Dwellings */} 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">2. Dwellings Data</label> 
                    <div className="flex items-center gap-3"> 
                       <label className="flex-1 cursor-pointer"> 
                          <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                            {dwellingsFile ? ( 
                              <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                            ) : ( 
                              <span>Choose Excel File</span> 
                            )} 
                          </div> 
                          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setDwellingsFile(e.target.files[0])} /> 
                       </label> 
                       {dwellingsFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{dwellingsFile.name}</span>} 
                    </div> 
                  </div> 
 
                  <div className="mt-6 flex gap-3"> 
                    <button  
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
                      Cancel 
                    </button> 
                    <button  
                      onClick={handleUploadAndProcess} 
                      disabled={!lobFile && !dwellingsFile || processing} 
                      className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md 
transition-colors ${ 
                        (!lobFile && !dwellingsFile) || processing  
                        ? 'bg-gray-400 cursor-not-allowed'  
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                      }`} 
                    > 
                      {processing ? 'Processing...' : 'Process & Download JSON'} 
                    </button> 
                  </div> 
                </div> 
              ) : ( 
                /* Default Generic Upload UI */ 
                <> 
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
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
Cancel 
</button> 
<button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg 
hover:bg-blue-700 font-medium shadow-md shadow-blue-200 transition-colors"> 
Upload File 
</button> 
</div> 
</> 
)} 
</div> 
</div> 
</div> 
)} 
</div> 
); 
}; 
export default Upload;
