import { useState, useEffect } from 'react'; 
import { 
Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
LineChart, Line, ComposedChart, PieChart, Pie, Cell 
} from 'recharts'; 
import '../styles/OverAllReview.css'; 
// Static configuration for LOB columns 
const lobOrder = [ 
{ key: 'FIRE (Dwellings)', label: 'FIRE (Dwellings)', colorClass: 'lob-fire' }, 
{ key: 'FIRE (Non-Dwellings)', label: 'FIRE (Non-Dwellings)', colorClass: 'lob-fire' }, 
{ key: 'ENGINEERING', label: 'ENGINEERING', colorClass: 'lob-engineering' }, 
{ key: 'MISCELLANEOUS', label: 'MISCELLANEOUS', colorClass: 'lob-miscellaneous' }, 
{ key: 'MARINE', label: 'MARINE', colorClass: 'lob-marine' }, 
{ key: 'LIABILITY', label: 'LIABILITY', colorClass: 'lob-liability' }, 
{ key: 'OVERALL', label: 'OVERALL', colorClass: 'lob-overall' } 
]; 
 
const OverAllReview = ({ selectedDate }) => { 
  // --- State Management --- 
  const [lobRawData, setLobRawData] = useState([]); 
  const [dwellingsRawData, setDwellingsRawData] = useState([]); 
  const [allData, setAllData] = useState({});  
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
 
  // Dynamic Dropdown & Chart Data 
  const [availablePeriods, setAvailablePeriods] = useState([]); 
  const [selectedLobPeriod, setSelectedLobPeriod] = useState(''); 
  const [chartData, setChartData] = useState([]); 
 
  // Existing states for other sections 
  const [selectedMatrixPeriod, setSelectedMatrixPeriod] = useState(''); 
  const [showGrowthPopup, setShowGrowthPopup] = useState(false); 
  const [popupPeriod, setPopupPeriod] = useState("Apr'24 - Mar'25"); 
 
  // --- Data Fetching (Robust Vite Glob Import) --- 
  useEffect(() => { 
    const loadData = async () => { 
      try { 
        setLoading(true); 
        setError(null); 
 
        // Safely load all JSON files from the data directory 
        const modules = import.meta.glob('../data/*.json', { eager: true }); 
         
        const getFile = (name) => { 
          const key = Object.keys(modules).find(k => k.includes(name)); 
          return key ? (modules[key].default || modules[key]) : null; 
        }; 
 
        const lobJson = getFile('LOB_AND_SEGMENT_WISE_DATA') || []; 
        const dwellingsJson = getFile('Dwellings') || []; 
        const overallJson = getFile('overall_review_data') || {}; 
 
        setLobRawData(lobJson); 
        setDwellingsRawData(dwellingsJson); 
        setAllData(overallJson); 
 
        // Initialize Dropdowns 
        if (Array.isArray(lobJson) && lobJson.length > 0) { 
          const periods = lobJson.map(item => item.Time); 
          setAvailablePeriods(periods); 
           
          // Default to the period matching selectedDate month, or first available 
          const match = periods.find(p => p.includes(selectedDate?.month)) || periods[0]; 
          setSelectedLobPeriod(match); 
          setSelectedMatrixPeriod(match); 
        } 
 
      } catch (err) { 
        console.error("Error loading data:", err); 
        setError("Failed to load data files."); 
      } finally { 
        setLoading(false); 
      } 
    }; 
 
    loadData(); 
  }, [selectedDate]); 
 
  // --- Chart Data Processing --- 
  useEffect(() => { 
    if (!selectedLobPeriod || !lobRawData || lobRawData.length === 0) return; 
 
    // 1. Find Data for Selected Period 
    const lobPeriodData = lobRawData.find(item => item.Time === selectedLobPeriod); 
    const dwellingPeriodData = dwellingsRawData.find(item => item.Time === 
selectedLobPeriod) || {}; 
 
    if (!lobPeriodData) return; 
 
    const getNum = (val) => val || 0; 
 
    const processedChartData = []; 
    let totalNop = 0; 
    let totalPrem = 0; 
    let totalEarned = 0; 
    let totalClaims = 0; 
 
    // --- Special Logic: FIRE Split --- 
     
    // A. Fire (Dwellings) - Directly from Dwellings.json 
    const fireDwelling = { 
      label: 'FIRE (Dwellings)', 
      nop: getNum(dwellingPeriodData["Total Net Pol"]), 
      prem: getNum(dwellingPeriodData["Total Prem"]), 
      earned: getNum(dwellingPeriodData["Total Earned Prem"]), 
      claims: getNum(dwellingPeriodData["Total Claim incurred in period"]), 
    }; 
 
    // B. Total Fire - From LOB Data 
    const totalFireLOB = lobPeriodData.LOB?.['FIRE'] || {}; 
    const totalFire = { 
      nop: getNum(totalFireLOB["Total Net Pol"]), 
      prem: getNum(totalFireLOB["Total Prem"]), 
      earned: getNum(totalFireLOB["Total Earned Prem"]), 
      claims: getNum(totalFireLOB["Total Claim incurred in period"]), 
    }; 
 
    // C. Fire (Non-Dwellings) = Total Fire - Dwellings 
    const fireNonDwelling = { 
      label: 'FIRE (Non-Dwellings)', 
      nop: totalFire.nop - fireDwelling.nop, 
      prem: totalFire.prem - fireDwelling.prem, 
      earned: totalFire.earned - fireDwelling.earned, 
      claims: totalFire.claims - fireDwelling.claims, 
    }; 
 
    // Add Fire Rows to Chart 
    [fireDwelling, fireNonDwelling].forEach(item => { 
      processedChartData.push({ 
        lob: item.label, 
        nop: item.nop, 
        // GWP: Divide by 1M and Round to Integer (No decimals) 
        gwp_millions: Math.round(item.prem / 1000000),  
        // GIC:GEP: (Claims / Earned) * 100 
        gic_gep: item.earned !== 0 ? Math.round((item.claims / item.earned) * 100) : 0, 
        raw_gwp: item.prem 
      }); 
      totalNop += item.nop; 
      totalPrem += item.prem; 
      totalEarned += item.earned; 
      totalClaims += item.claims; 
    }); 
 
    // --- Other LOBs --- 
    const otherLobs = ['ENGINEERING', 'MISCELLANEOUS', 'MARINE', 'LIABILITY']; 
     
    otherLobs.forEach(key => { 
      const data = lobPeriodData.LOB?.[key] || {}; 
      const nop = getNum(data["Total Net Pol"]); 
      const prem = getNum(data["Total Prem"]); 
      const earned = getNum(data["Total Earned Prem"]); 
      const claims = getNum(data["Total Claim incurred in period"]); 
 
      // Format Label (e.g., MISCELLANEOUS -> Misc.) 
      let label = key; 
      if (key === 'MISCELLANEOUS') label = 'Misc.'; 
      else label = key.charAt(0) + key.slice(1).toLowerCase(); // Marine, Liability 
 
      processedChartData.push({ 
        lob: label, 
        nop: nop, 
        gwp_millions: Math.round(prem / 1000000), 
        gic_gep: earned !== 0 ? Math.round((claims / earned) * 100) : 0, 
        raw_gwp: prem 
      }); 
 
      totalNop += nop; 
      totalPrem += prem; 
      totalEarned += earned; 
      totalClaims += claims; 
    }); 
 
    // --- OVERALL / Total --- 
    processedChartData.push({ 
      lob: 'Total', 
      nop: totalNop, 
      gwp_millions: Math.round(totalPrem / 1000000), 
      gic_gep: totalEarned !== 0 ? Math.round((totalClaims / totalEarned) * 100) : 0 
    }); 
 
    setChartData(processedChartData); 
 
  }, [selectedLobPeriod, lobRawData, dwellingsRawData]); 
 
  // --- Helpers --- 
  const getDefaultKey = () => selectedDate?.month === 'July' ? 'YTD July 2025' : 
selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'; 
  const getMonthName = () => selectedDate?.month || 'May'; 
  const getBrokerPeriod = (p) => (p && p.includes('July')) ? 'YTD July 2025' : (p && 
p.includes('June')) ? 'YTD June 2025' : 'YTD May 2025'; 
  const getGicGepStyle = (val) => { 
    const num = parseInt(val?.toString().replace('%', '') || 0); 
    return num >= 90 ? { color: 'red' } : {}; 
  }; 
 
  // --- Derived Data for Tables --- 
  const brokerPeriod = getBrokerPeriod(selectedLobPeriod); 
  const brokerData = allData?.brokerDataMap?.[brokerPeriod] || []; 
 
  const segmentLobMatrix = allData?.segmentMatrixDataMap?.[selectedMatrixPeriod] || []; 
  const segments = Array.from(new Set(segmentLobMatrix.map(r => r.uw_seg_map))); 
  const segMap = {}; 
  segmentLobMatrix.forEach(r => { 
    if (!segMap[r.uw_seg_map]) segMap[r.uw_seg_map] = {}; 
    segMap[r.uw_seg_map][r.lob] = r; 
  }); 
 
  const currentKey = getDefaultKey(); 
  const lobGrowthData = allData?.lobGrowthDataMap?.[currentKey] || []; 
  const cordysTatData = allData?.cordysTatDataMap?.[currentKey] || []; 
  const fireUnderData = allData?.fireUnderInsuranceDataMap?.[currentKey] || []; 
   
  const inwardMonthKey = selectedDate?.month?.toLowerCase() || 'may'; 
  const inwardFacRaw = allData?.inwardFacDataMap?.[currentKey] || { [inwardMonthKey]: [], 
ytd: [] }; 
  const inwardMonthData = inwardFacRaw[inwardMonthKey] || []; 
  const inwardYtdData = inwardFacRaw.ytd || []; 
 
  const newBusinessData = allData?.newBusinessDataMap?.[currentKey] || { commercial: [], 
liability: [], sme: [] }; 
  const largeRiskData = allData?.largeRiskDataMap?.[currentKey] || 'Nil'; 
  const newInitiativesData = allData?.newInitiativesDataMap?.[currentKey] || ''; 
  const popupData = allData?.popupDataMap?.[popupPeriod] || []; 
  const staticGrowth = allData?.staticGrowthDataMap?.[currentKey] || []; 
  const matrixNote = allData?.notes?.matrixNote?.[selectedMatrixPeriod] || ''; 
 
  if (loading) return <div className="or-loader-container"><div className="or-loader"></div></div>; 
  if (error) return <div className="or-error-container"><h3>{error}</h3></div>; 
 
  return ( 
    <div className="or-main"> 
      <div className="or-top-grid"> 
         
        {/* Chart Section */} 
        <div className="or-chart-container"> 
          <div className="or-chart-header"> 
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
              <h1 className="or-chart-title"> 
                LOB wise NOP, GWP and GIC:GEP (GWP in Mn) - {selectedLobPeriod} 
              </h1> 
              <select  
                value={selectedLobPeriod}  
                onChange={(e) => setSelectedLobPeriod(e.target.value)} 
                style={{  
                  padding: '4px 8px',  
                  borderRadius: '4px',  
                  border: '1px solid #ccc',  
                  fontSize: '14px',  
                  marginRight: '10px', 
                  color: '#000',           // Set font color to black 
                  backgroundColor: '#fff',  // Ensure background is white 
                  fontWeight: '500' 
                }} 
              > 
                {availablePeriods.length > 0 ? availablePeriods.map((period, index) => ( 
                  <option key={index} value={period}>{period}</option> 
                )) : <option>No Data Available</option>} 
              </select> 
            </div> 
          </div> 
          <div className="or-chart"> 
            <ResponsiveContainer width="100%" height="100%"> 
              <ComposedChart data={chartData} margin={{ top: 15, right: 25, left: 15, bottom: 60 }}> 
                <CartesianGrid strokeDasharray="3 3" /> 
                <XAxis dataKey="lob" angle={-45} textAnchor="end" height={80} fontSize={9} interval={0} /> 
                <YAxis yAxisId="left" orientation="left" scale="log" domain={[1, 10000000]} fontSize={9}  
                  tickFormatter={(val) => val >= 1000000 ? `${val/1000000}M` : val >= 1000 ? `${val/1000}K` : 
val} /> 
                <YAxis yAxisId="right" orientation="right" domain={[0, 200]} tickFormatter={(val) => `${val}%`} 
fontSize={9} /> 
                <Tooltip formatter={(val, name) => name === 'GIC:GEP' ? [`${val}%`, name] : 
[Number(val).toLocaleString(), name]} /> 
                <Legend wrapperStyle={{ fontSize: '10px' }} /> 
                <Bar yAxisId="left" dataKey="nop" fill="#30cd05" name="NOP" /> 
                <Bar yAxisId="left" dataKey="gwp_millions" fill="#2563eb" name="GWP (Mn)" /> 
                <Line yAxisId="right" type="monotone" dataKey="gic_gep" stroke="#e30613" strokeWidth={2} 
dot={{r:3}} name="GIC:GEP"  
                  label={({ x, y, value }) => ( 
                    <text x={x} y={y - 10} fill="#e30613" fontSize={10} textAnchor="middle" 
fontWeight="bold">{value}%</text> 
                  )} 
                /> 
              </ComposedChart> 
            </ResponsiveContainer> 
          </div> 
          <div className="or-note-chart or-note-red" style={{ marginTop: '10px', fontSize: '12px', 
lineHeight: '1.4' }}> 
            Fire is inclusive of Generic New NOP - 8,233 with GWP of Rs. 38 Mn. The drop in Misc. NOP and 
GWP is due to Burglary policies being issued under EPP Tiny (Fire).<br/> 
            *Engineering -  Commercial -  BAGMANE DEVELOPERS PRIVATE LTD - Rs. 14.88 Crs (Short 
Circuit Fire) 
          </div> 
        </div> 
 
        {/* Broker Table Section */} 
        <div className="or-broker-table-container"> 
          <div className="or-table-header"> 
            <h2 className="or-table-title"> 
              Broker wise GWP Report - {brokerPeriod} (Amt in Mn) 
            </h2> 
          </div> 
          <div className="or-table-scroll"> 
            <table className="or-table"> 
              <thead className="or-table-thead"> 
                <tr> 
                  <th className="or-table-th or-table-th-broker">Broker Name</th> 
                  <th className="or-table-th">UW Channel</th> 
                  <th className="or-table-th">Fire</th> 
                  <th className="or-table-th">Engg.</th> 
                  <th className="or-table-th">Marine</th> 
                  <th className="or-table-th">Misc</th> 
                  <th className="or-table-th">Liability</th> 
                </tr> 
              </thead> 
              <tbody className="or-table-tbody"> 
                {brokerData.length > 0 ? brokerData.map((item, index) => ( 
                  <tr key={index} className={`or-table-tr ${item.broker_name === 'Total GWP' ? 
'or-table-tr-total' : ''} ${item.broker_name === 'Others' ? 'or-table-tr-others' : ''}`}> 
                    <td className="or-table-td or-table-td-broker"><div className="or-table-broker-name" 
title={item.broker_name}>{item.broker_name}</div></td> 
                    <td className="or-table-td">{item.uw_channel}</td> 
                    <td className="or-table-td">{item.fire}</td> 
                    <td className="or-table-td">{item.engineering}</td> 
                    <td className="or-table-td">{item.marine}</td> 
                    <td className="or-table-td">{item.misc}</td> 
                    <td className="or-table-td">{item.liability}</td> 
                  </tr> 
                )) : <tr><td colSpan="7" className="or-table-td">No data available</td></tr>} 
              </tbody> 
            </table> 
          </div> 
        </div> 
      </div> 
 
      {/* Matrix Section */} 
      <div className="or-matrix-table-container"> 
        <div className="or-table-header"> 
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
            <h2 className="or-table-title"> 
              LOB & Segment wise Report - {selectedMatrixPeriod} 
            </h2> 
            <select  
              value={selectedMatrixPeriod}  
              onChange={(e) => setSelectedMatrixPeriod(e.target.value)} 
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', 
marginRight: '10px', color: '#000', backgroundColor: '#fff' }} 
            > 
              {availablePeriods.length > 0 ? availablePeriods.map(p => ( 
                 <option key={p} value={p}>{p}</option> 
              )) : ( 
                 <option>Loading...</option> 
              )} 
            </select> 
          </div> 
        </div> 
        <div className="or-table-scroll"> 
          <table className="or-matrix-table"> 
            <thead> 
              <tr> 
                <th rowSpan={2} className="or-matrix-th-segment">Segment</th> 
                {lobOrder.filter(l => !l.key.includes('Dwellings')).map(lob => <th key={lob.key} colSpan={3} 
className={`or-matrix-th-lob ${lob.colorClass}`}>{lob.label}</th>)} 
              </tr> 
              <tr> 
                {lobOrder.filter(l => !l.key.includes('Dwellings')).map(lob => <><th key={lob.key+'-n'} 
className="or-matrix-th-sub">NOP</th><th key={lob.key+'-g'} 
className="or-matrix-th-sub">GWP</th><th key={lob.key+'-r'} 
className="or-matrix-th-sub">GIC:GEP</th></>)} 
              </tr> 
            </thead> 
            <tbody> 
              {segments.length > 0 ? segments.map(segment => ( 
                <tr key={segment}> 
                  <td className="or-matrix-td-segment">{segment}</td> 
                  {lobOrder.filter(l => !l.key.includes('Dwellings')).map(lob => { 
                    const cell = segMap[segment][lob.key] || segMap[segment][lob.label] || 
segMap[segment][lob.key.split(' ')[0]];  
                    return ( 
                      <> 
                        <td className="or-matrix-td-nop">{cell ? cell.nop : '-'}</td> 
                        <td className="or-matrix-td-gwp">{cell ? cell.gwp.toLocaleString() : '-'}</td> 
                        <td className="or-matrix-td-gicgep" style={cell ? getGicGepStyle(cell.gic_gep) : {}}>{cell 
? cell.gic_gep || '0%' : '0%'}</td> 
                      </> 
                    ); 
                  })} 
                </tr> 
              )) : <tr><td colSpan="19" className="or-table-td" style={{textAlign:'center'}}>No 
Data</td></tr>} 
            </tbody> 
          </table> 
          <div className="or-note or-note-red" style={{ marginTop: '10px', fontSize: '11px' }} 
dangerouslySetInnerHTML={{ __html: matrixNote }}></div> 
        </div> 
      </div> 
 
      {/* Growth Section */} 
      <div className="or-growth-section"> 
        <div className="or-growth-header"> 
          LOB wise Growth % ( GWP ) - {getDefaultKey()} 
        </div> 
        <div className="or-growth-charts" style={{ justifyContent: 'space-between', gap: '0.5rem' }}> 
          {lobGrowthData.map((lob) => ( 
            <div key={lob.key} className="or-growth-chart-item" style={{ minWidth: 100 }}> 
              <div className="or-growth-chart-label" style={{ fontSize: '13px', fontWeight: 600 
}}>{lob.label}</div> 
              <div className="or-growth-pie-container" style={{ width: 140, height: 140 }}> 
                <ResponsiveContainer height={140}> 
                  <PieChart> 
                    <Pie data={[{ name: "FY25", value: lob.fy25, color: lob.colors[0] }, { name: "FY24", value: 
lob.fy24, color: lob.colors[1] }]} 
                      dataKey="value" cx="50%" cy="50%" innerRadius={25} outerRadius={65} startAngle={90} 
endAngle={450} stroke="white" strokeWidth={2}> 
                      <Cell fill={lob.colors[0]} /><Cell fill={lob.colors[1]} /> 
                    </Pie> 
                  </PieChart> 
                </ResponsiveContainer> 
                <div className="or-growth-pie-center"><div className="or-growth-pie-growth" style={{ 
fontSize: '14px' }}>{lob.growth}%</div></div> 
              </div> 
            </div> 
          ))} 
        </div> 
        <div style={{ textAlign: 'center', marginTop: '15px' }}> 
          <button onClick={() => setShowGrowthPopup(true)} className="or-growth-btn">
📊
 Click Here - 
LOB Segment wise Report Last 5 Years Comparison</button> 
        </div> 
      </div> 
 
      {/* Bottom Tables */} 
      <div className="or-tables-section"> 
        <div className="or-tables-side-by-side"> 
          {/* Cordys TAT */} 
          <div className="or-table-block"> 
            <div className="or-table-block-header">Cordys TAT Report</div> 
            <table className="or-table-block-table"> 
              <thead> 
                <tr> 
                  <th rowSpan={2} className="or-table-block-th">Month</th><th rowSpan={2} 
className="or-table-block-th">LOB</th> 
                  <th colSpan={2} className="or-table-block-th">Same Day</th><th colSpan={2} 
className="or-table-block-th">Next day</th> 
                  <th colSpan={2} className="or-table-block-th">Beyond that</th><th rowSpan={2} 
className="or-table-block-th">Grand Total</th> 
                </tr> 
                <tr> 
                  <th className="or-table-block-th">No</th><th className="or-table-block-th">%</th><th 
className="or-table-block-th">No</th><th className="or-table-block-th">%</th><th 
className="or-table-block-th">No</th><th className="or-table-block-th">%</th> 
                </tr> 
              </thead> 
              <tbody> 
                {cordysTatData.map((row, idx) => ( 
                  <tr key={idx} className={idx%2===0?"or-table-block-tr-even":"or-table-block-tr-odd"}> 
                    {(idx===0 || cordysTatData[idx-1].month !== row.month) && <td 
rowSpan={cordysTatData.filter(r=>r.month===row.month).length} 
className="or-table-block-td">{row.month}</td>} 
                    <td className="or-table-block-td">{row.lob}</td> 
                    <td className="or-table-block-td">{row.sameDay}</td><td 
className="or-table-block-td">{row.sameDayPct}</td> 
                    <td className="or-table-block-td">{row.nextDay}</td><td 
className="or-table-block-td">{row.nextDayPct}</td> 
                    <td className="or-table-block-td">{row.beyond}</td><td 
className="or-table-block-td">{row.beyondPct}</td> 
                    <td className="or-table-block-td">{row.total}</td> 
                  </tr> 
                ))} 
              </tbody> 
            </table> 
          </div> 
 
          {/* Fire UnderInsurance */} 
          <div className="or-table-block"> 
            <div className="or-table-block-header"> 
              FIRE - Banca Channel wise UnderInsurance Report - {getDefaultKey()} 
            </div> 
            <table className="or-table-block-table"> 
              <thead> 
                <tr> 
                  <th className="or-table-block-th">Banca Channel</th><th 
className="or-table-block-th">Claims Paid</th> 
                  <th className="or-table-block-th">Under insurance est.</th><th 
className="or-table-block-th">Claims %</th><th className="or-table-block-th">NOC</th> 
                </tr> 
              </thead> 
              <tbody> 
                {fireUnderData.map((row, idx) => ( 
                  <tr key={idx} className={row[0]==='Grand Total'?"or-table-block-tr-total":(idx%2===0?"or-table-block-tr-even":"or-table-block-tr-odd")}> 
                    {row.map((cell, i) => <td key={i} className="or-table-block-td">{cell}</td>)} 
                  </tr> 
                ))} 
              </tbody> 
            </table> 
          </div> 
        </div> 
 
        {/* Inward Fac */} 
        <div className="or-table-block"> 
          <div className="or-table-block-header"> 
            Inward Fac - {getDefaultKey()} 
          </div> 
          <table className="or-table-block-table"> 
            <thead> 
              <tr> 
                <th rowSpan={2} className="or-table-block-th">LOB</th> 
                <th colSpan={6} className="or-table-block-th">{getMonthName()} 2025</th> 
                <th colSpan={6} className="or-table-block-th">YTD {getMonthName()} 2025</th> 
              </tr> 
              <tr> 
                <th className="or-table-block-th">NOP</th><th 
className="or-table-block-th">GWP</th><th className="or-table-block-th">SI</th><th 
className="or-table-block-th">GIC</th><th className="or-table-block-th">GEP</th><th 
className="or-table-block-th">Ratio</th> 
                <th className="or-table-block-th">NOP</th><th 
className="or-table-block-th">GWP</th><th className="or-table-block-th">SI</th><th 
className="or-table-block-th">GIC</th><th className="or-table-block-th">GEP</th><th 
className="or-table-block-th">Ratio</th> 
              </tr> 
            </thead> 
            <tbody> 
              {inwardMonthData.length > 0 ? inwardMonthData.map((row, idx) => ( 
                <tr key={idx} className={idx%2===0?"or-table-block-tr-even":"or-table-block-tr-odd"}> 
                  <td className="or-table-block-td">{row.lob}</td> 
                  <td className="or-table-block-td">{row.nop}</td><td 
className="or-table-block-td">{row.gwp}</td><td className="or-table-block-td">{row.si}</td><td 
className="or-table-block-td">{row.gic}</td><td className="or-table-block-td">{row.gep}</td><td 
className="or-table-block-td">{row.gicgep}</td> 
                  {inwardYtdData[idx] ? ( 
                    <><td className="or-table-block-td">{inwardYtdData[idx].nop}</td><td 
className="or-table-block-td">{inwardYtdData[idx].gwp}</td><td 
className="or-table-block-td">{inwardYtdData[idx].si}</td><td 
className="or-table-block-td">{inwardYtdData[idx].gic}</td><td 
className="or-table-block-td">{inwardYtdData[idx].gep}</td><td 
className="or-table-block-td">{inwardYtdData[idx].gicgep}</td></> 
                  ) : <td colSpan={6} className="or-table-block-td">-</td>} 
                </tr> 
              )) : <tr><td colSpan="13" className="or-table-block-td">No data</td></tr>} 
            </tbody> 
          </table> 
        </div> 
      </div> 
 
      {/* Bottom Grid */} 
      <div className="or-bottom-grid" style={{ fontSize: '10px' }}> 
        <div className="or-bottom-left"> 
          <div className="or-bottom-header" style={{ padding: '0.2rem 0', fontSize: '11px' }}> 
            New Business Sourced ({">"}5 lakhs) - {getDefaultKey()} 
          </div> 
          <div className="or-bottom-content" style={{ padding: '0.2rem', fontSize: '10px' }}> 
            <span className="or-bottom-label" style={{ fontSize: '10px' }}>Commercial:</span> 
            <ol className="or-bottom-list" style={{ marginBottom: '0.2rem' 
}}>{newBusinessData.commercial.map((item, idx) => <li key={idx}>{item}</li>)}</ol> 
            <span className="or-bottom-label" style={{ fontSize: '10px' }}>Liability:</span> 
            <ol className="or-bottom-list" style={{ marginBottom: '0.2rem' 
}}>{newBusinessData.liability.map((item, idx) => <li key={idx}>{item}</li>)}</ol> 
          </div> 
          <div className="or-bottom-header or-bottom-header-secondary" style={{ padding: '0.2rem 0', 
fontSize: '11px', marginTop: '0.3rem' }}> 
            Large risk underwritten - More than 2500 Cr - {getDefaultKey()} 
          </div> 
          <div className="or-bottom-content" style={{ padding: '0.2rem', fontSize: '9px', lineHeight: '1.2' 
}}>{largeRiskData}</div> 
        </div> 
        <div className="or-bottom-right"> 
          <div className="or-bottom-header" style={{ padding: '0.2rem 0', fontSize: '11px' }}>New 
Initiatives - {getDefaultKey()}</div> 
          <div className="or-bottom-content" style={{ padding: '0.2rem', fontSize: '9px', lineHeight: '1.2' }} 
dangerouslySetInnerHTML={{ __html: newInitiativesData }}></div> 
          <div className="or-bottom-header or-bottom-header-secondary" style={{ padding: '0.2rem 0', 
fontSize: '11px', marginTop: '0.3rem' }}> 
            New Business Sourced ({">"}5 lakhs) - {getDefaultKey()} 
          </div> 
          <div className="or-bottom-content" style={{ padding: '0.2rem', fontSize: '10px' }}> 
            <span className="or-bottom-label" style={{ fontSize: '10px' }}>SME:</span> 
            <ol className="or-bottom-list" style={{ marginBottom: '0.2rem' 
}}>{newBusinessData.sme.map((item, idx) => <li key={idx}>{item}</li>)}</ol> 
          </div> 
        </div> 
      </div> 
 
      {/* Growth Popup */} 
      {showGrowthPopup && ( 
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}> 
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '95vw', 
maxHeight: '90vh', overflow: 'auto', position: 'relative' }}> 
            <button onClick={() => setShowGrowthPopup(false)} style={{ position: 'absolute', top: '10px', 
right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' 
}}>×</button> 
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>LOB wise Growth % (GWP)</h2> 
            <div style={{ marginBottom: '30px' }}> 
              <h3 style={{ backgroundColor: '#ff6600', color: 'white', padding: '8px', margin: '0 0 10px 0', 
textAlign: 'center' }}> 
                {selectedDate?.month === 'July' ? "Apr'25 - July'25" : selectedDate?.month === 'June' ? 
"Apr'25 - June'25" : "Apr'25 - May'25"} 
              </h3> 
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}> 
                <thead> 
                  <tr style={{ backgroundColor: '#f0f0f0' }}> 
                    <th rowSpan={2} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ffb3b3' 
}}>Segment</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ff9900' 
}}>FIRE</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: 
'#00cc00' }}>ENGINEERING</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ffff00' 
}}>MISCELLANEOUS</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: 
'#0066cc' }}>Marine</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: 
'#00cccc' }}>LIABILITY</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ff00cc' 
}}>OVERALL</th> 
                  </tr> 
                  <tr>{Array(6).fill(['NOP', 'GWP', 'GIC:GEP']).flat().map((h, i) => <th key={i} style={{ border: '1px solid #ccc', padding: '4px', fontSize: '10px' }}>{h}</th>)}</tr> 
                </thead> 
                <tbody> 
                  {staticGrowth.map((row, i) => ( 
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : 'white' }}> 
                       <td style={{ border: '1px solid #ccc', padding: '4px', fontWeight: 'bold' 
}}>{row.segment}</td> 
                       {[row.fire_nop, row.fire_gwp, row.fire_gicgep, row.engg_nop, row.engg_gwp, 
row.engg_gicgep, row.misc_nop, row.misc_gwp, row.misc_gicgep, row.marine_nop, row.marine_gwp, 
row.marine_gicgep, row.liability_nop, row.liability_gwp, row.liability_gicgep, row.overall_nop, 
row.overall_gwp, row.overall_gicgep].map((val, idx) => ( 
                         <td key={idx} style={{ border: '1px solid #ccc', padding: '4px' }}>{typeof val === 'number' ? 
val.toLocaleString() : val}</td> 
                       ))} 
                    </tr> 
                  ))} 
                </tbody> 
              </table> 
            </div> 
            <div> 
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}> 
                <h3 style={{ backgroundColor: '#ff6600', color: 'white', padding: '8px', margin: '0', textAlign: 
'center', flex: 1 }}>LOB & Segment wise Report</h3> 
                <select value={popupPeriod} onChange={(e) => setPopupPeriod(e.target.value)} style={{ 
padding: '4px 8px', marginLeft: '10px' }}> 
                  <option value="Apr'24 - Mar'25">Apr'24 - Mar'25</option><option value="Apr'23 - 
Mar'24">Apr'23 - Mar'24</option><option value="Apr'22 - Mar'23">Apr'22 - Mar'23</option><option 
value="Apr'21 - Mar'22">Apr'21 - Mar'22</option> 
                </select> 
              </div> 
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}> 
                <thead> 
                  <tr style={{ backgroundColor: '#f0f0f0' }}> 
                    <th rowSpan={2} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ffb3b3' 
}}>Segment</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ff9900' 
}}>FIRE</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: 
'#00cc00' }}>ENGINEERING</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ffff00' 
}}>MISCELLANEOUS</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: 
'#0066cc' }}>Marine</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: 
'#00cccc' }}>LIABILITY</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ff00cc' 
}}>OVERALL</th> 
                  </tr> 
                  <tr>{Array(6).fill(['NOP', 'GWP', 'GIC:GEP']).flat().map((h, i) => <th key={i} style={{ border: '1px solid #ccc', padding: '4px', fontSize: '10px' }}>{h}</th>)}</tr> 
                </thead> 
                <tbody> 
                  {popupData.map((row, i) => ( 
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : 'white' }}> 
                      <td style={{ border: '1px solid #ccc', padding: '4px', fontWeight: 'bold' 
}}>{row.segment}</td> 
                      {[row.fire_nop, row.fire_gwp, row.fire_gicgep, row.engg_nop, row.engg_gwp, 
row.engg_gicgep, row.misc_nop, row.misc_gwp, row.misc_gicgep, row.marine_nop, row.marine_gwp, 
row.marine_gicgep, row.liability_nop, row.liability_gwp, row.liability_gicgep, row.overall_nop, 
row.overall_gwp, row.overall_gicgep].map((val, idx) => ( 
                        <td key={idx} style={{ border: '1px solid #ccc', padding: '4px' }}>{typeof val === 'number' ? 
val.toLocaleString() : val}</td> 
                      ))} 
                    </tr> 
                  ))} 
                </tbody> 
              </table> 
            </div> 
          </div> 
        </div> 
      )} 
    </div> 
  ); 
}; 
 
export default OverAllReview;
