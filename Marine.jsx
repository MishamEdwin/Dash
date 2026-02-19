import React, { useState, useEffect } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Legend, PieChart, Pie, Cell
} from 'recharts';
import '../styles/Marine.css';
import { getProductWiseData, getSegWiseAvgPremRateData, getsegRenewalRatioData } from '../api/api';

/**
 * Marine component - Displays marine insurance dashboard with charts and tables
 * @param {Object} selectedDate - Object containing selected month and year for filtering data
 * @returns {JSX.Element} Marine dashboard component with charts and tables
 */
const Marine = ({ selectedDate }) => {
  // State variables for managing component data and UI state
  const [availableMonths, setAvailableMonths] = useState([]); // Array of available months for dropdown selection
  const [selectedMonth, setSelectedMonth] = useState(''); // Currently selected month for product data filtering
  const [selectSegMonth, setSelectSegMonth] = useState(''); // Selected month for segment data (unused)
  const [productData, setProductData] = useState([]); // Array of processed product data for charts
  const [loading, setLoading] = useState(false); // Boolean flag for loading state
  const [selectedJunePeriod, setSelectedJunePeriod] = useState('YTD June 2025'); // Selected period for June pie chart
  const [selectedJuneProductPeriod, setSelectedJuneProductPeriod] = useState('YTD June 2025'); // Selected period for June product data (unused)
  const [segAvgData, setSegAvgData] = useState([]); // Array of segment-wise average premium and rate data
  const [segRenewalData, setSegRenewalData] = useState([]); // Array of processed segment renewal ratio data

  /**
   * Effect hook to fetch marine data when selectedDate changes
   * Fetches product data, segment average data, and renewal data from APIs
   */
  useEffect(() => {
    /**
     * Async function to fetch all marine-related data
     * @returns {Promise<void>} No return value
     */
    const fetchMonths = async () => {
      try {
        // Fetch product-wise data for marine insurance
        const response = await getProductWiseData(selectedDate?.month, selectedDate?.year, 'MARINE');
        // Fetch segment-wise average premium rate data
        const segAvgResponse = await getSegWiseAvgPremRateData(selectedDate?.month, selectedDate?.year);
        // Fetch segment renewal ratio data
        const segRene = await getsegRenewalRatioData(selectedDate?.month, selectedDate?.year);
        
        // Process and set renewal data if API call successful
        if (segRene.success) {
          const processedRenewalData = processRenewalData(segRene.data);
          setSegRenewalData(processedRenewalData);
        }
        
        // Process and set product data if API call successful
        if (response.success) {
          // Extract unique months from response data
          const months = [...new Set(response.data.map(item => item.s_mon === selectedDate?.month ? item.month : ''))];
          setAvailableMonths(months);
          if (months.length > 0) {
            // Set the latest month as selected and process chart data
            setSelectedMonth(months[months.length-1]);
            processChartData(response.data, months[months.length-1]);
          }
        }
        
        // Set segment average data if API call successful
        if (segAvgResponse.success) {
          setSegAvgData(segAvgResponse.data);
        }
      } catch (error) {
        console.error('Error fetching marine data:', error);
      }
    };
    fetchMonths();
  }, [selectedDate]);

  /**
   * Processes raw renewal data from API into formatted structure for display
   * @param {Array} data - Raw renewal data from API containing segment, premium, nop, client data
   * @returns {Array} Processed array of renewal data with calculated ratios and formatted values
   */
  const processRenewalData = (data) => {
    const segmentGroups = {}; // Object to group data by segment
    
    // Group data by segment and separate current year (2025) from previous year (2024)
    data.forEach(item => {
      const segment = item.uw_sub; // Segment name from underwriting sub-category
      
      // Initialize segment group if not exists
      if (!segmentGroups[segment]) {
        segmentGroups[segment] = {
          segment,
          ytdCurrent: { premium: 0, nop: 0, client: 0 }, // Current year data
          ytdPrevious: { premium: 0, nop: 0, client: 0 } // Previous year data
        };
      }
      
      // Categorize data by year
      if (item.month.includes('2025')) {
        debugger; // Debug breakpoint for 2025 data
        segmentGroups[segment].ytdCurrent.premium = parseFloat(item.premium) || 0;
        segmentGroups[segment].ytdCurrent.nop = parseInt(item.nop) || 0;
        segmentGroups[segment].ytdCurrent.client = parseInt(item.client_count) || 0;
      } else if (item.month.includes('2024')) {
        segmentGroups[segment].ytdPrevious.premium = parseFloat(item.premium) || 0;
        segmentGroups[segment].ytdPrevious.nop = parseInt(item.nop) || 0;
        segmentGroups[segment].ytdPrevious.client = parseInt(item.client_count) || 0;
      }
    });
    
    // Transform grouped data into display format with calculated renewal ratios
    return Object.values(segmentGroups).map(group => {
      // Calculate renewed amounts (difference between previous and current)
      const premiumRenewed = group.ytdPrevious.premium - group.ytdCurrent.premium;
      const nopRenewed = group.ytdPrevious.nop; // Number of policies renewed
      const clientRenewed = group.ytdPrevious.client; // Number of clients renewed
      
      // Calculate renewal ratios as percentages
      const premiumRatio = group.ytdPrevious.premium > 0 ? 
        ((premiumRenewed / group.ytdCurrent.premium) * 100).toFixed(0) : '0';
      const nopRatio = group.ytdPrevious.nop > 0 ? 
        ((nopRenewed / group.ytdCurrent.nop) * 100).toFixed(0) : '0';
      const clientRatio = group.ytdPrevious.client > 0 ? 
        ((clientRenewed / group.ytdCurrent.client) * 100).toFixed(0) : '0';
      
      // Return formatted object for table display
      return {
        segment: group.segment,
        premium: {
          forRenewal: group.ytdCurrent.premium.toLocaleString(), // Formatted premium for renewal
          renewed: premiumRenewed.toLocaleString(), // Formatted renewed premium
          ratio: `${premiumRatio}%` // Renewal ratio percentage
        },
        policy: {
          forRenewal: group.ytdCurrent.nop, // Number of policies for renewal
          renewed: nopRenewed, // Number of policies renewed
          ratio: `${nopRatio}%` // Policy renewal ratio percentage
        },
        client: {
          forRenewal: group.ytdCurrent.client, // Number of clients for renewal
          renewed: clientRenewed, // Number of clients renewed
          ratio: `${clientRatio}%` // Client renewal ratio percentage
        }
      };
    });
  };

  /**
   * Processes raw product data into chart-ready format with grouped products and calculated metrics
   * @param {Array} data - Raw product data from API
   * @param {string} month - Selected month to filter data
   * @returns {void} Updates productData state with processed chart data
   */
  const processChartData = (data, month) => {
    // Filter data for selected month
    const filteredData = data.filter(item => item.month === month);
    const productGroups = {}; // Object to group products and aggregate values
    
    // Process each data item and group by product
    filteredData.forEach(item => {
      let productName = item.product; // Original product name
      
      // Group similar products under common names
      if (productName === 'MARINECARGOSPECIFIC' || productName === 'MARINEHULL') {
        productName = 'Specific'; // Group specific marine products
      }
      // Rename products for better display
      else if (productName === 'MARINE SALES TURNOVER') {
        productName = 'STCP'; // Short form for Sales Turnover Coverage Policy
      }
      else if (productName === 'MARINE CARGO OPEN POLICY') {
        productName = 'Cargo Open'; // Short form for open policy
      }
      
      // Initialize product group if not exists
      if (!productGroups[productName]) {
        productGroups[productName] = { nop: 0, premium: 0, gic: 0, gep: 0 };
      }
      
      // Aggregate values for each product
      productGroups[productName].nop += parseInt(item.nop) || 0; // Number of policies
      productGroups[productName].premium += parseFloat(item.premium) || 0; // Gross written premium
      productGroups[productName].gic += parseFloat(item.gic) || 0; // Gross incurred claims
      productGroups[productName].gep += parseFloat(item.gep) || 0; // Gross earned premium
    });
    
    // Transform grouped data into chart format
    const chartData = Object.keys(productGroups).map(name => ({
      name, // Product name
      NOP: productGroups[name].nop, // Number of policies
      GWP: (productGroups[name].premium / 1000000).toFixed(1), // GWP in millions
      GICGEP: productGroups[name].gep ? ((productGroups[name].gic / productGroups[name].gep) * 100).toFixed(0) : 0 // GIC:GEP ratio percentage
    }));
    
    // Calculate totals across all products
    const totals = Object.values(productGroups).reduce((sum, group) => ({
      nop: sum.nop + group.nop,
      premium: sum.premium + group.premium,
      gic: sum.gic + group.gic,
      gep: sum.gep + group.gep
    }), { nop: 0, premium: 0, gic: 0, gep: 0 });
    
    // Add total row to chart data
    chartData.push({
      name: 'Total',
      NOP: totals.nop,
      GWP: (totals.premium / 1000000).toFixed(1),
      GICGEP: totals.gep ? ((totals.gic / totals.gep) * 100).toFixed(0) : 0
    });
    
    // Update state with processed chart data
    setProductData(chartData);
  };

  /**
   * Calculates maximum GIC:GEP ratio value for chart Y-axis scaling
   * @returns {number} Maximum GIC:GEP value rounded up to nearest 10
   */
  const getMaxGicGep = () => {
    // Find maximum GIC:GEP ratio from product data
    const maxValue = Math.max(...productData.map(item => parseFloat(item.GICGEP) || 0));
    return Math.ceil(maxValue / 10) * 10; // Round up to nearest 10 for clean chart scaling
  };

  /**
   * Handles month selection change and refetches data for the new month
   * @param {string} month - Selected month value
   * @returns {Promise<void>} No return value, updates component state
   */
  const handleMonthChange = async (month) => {
    setSelectedMonth(month); // Update selected month state
    setLoading(true); // Show loading indicator
    
    try {
      // Fetch fresh data for the selected month
      const response = await getProductWiseData(selectedDate?.month, selectedDate?.year, 'MARINE');
      if (response.success) {
        // Process and update chart data for new month
        processChartData(response.data, month);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  /**
   * Determines CSS class for GEP (Gross Earned Premium) cell coloring based on value
   * @param {string} gep - GEP percentage value as string (e.g., '95%')
   * @param {boolean} isYtdMay24 - Flag to skip coloring for YTD May 2024 data
   * @returns {string} CSS class string for cell styling
   */
  const getGepColor = (gep, isYtdMay24 = false) => {
    if (isYtdMay24) return ''; // No special styling for 2024 data
    
    // Extract numeric value from percentage string
    const numericValue = parseInt(gep.replace('%', ''));
    
    // Return red styling for high GEP ratios (>90%)
    return numericValue > 90 ? 'mr-text-red mr-cell-bold' : '';
  };
  if (selectedDate?.month === 'July') {
    // July data
    const julySegmentData = [
      { segment: 'J&K', july25: { nop: 39, gwp: 86, gicGep: '25%' }, ytdJuly25: { nop: 158, gwp: 413, gicGep: '32%' }, ytdJuly24: { nop: 145, gwp: 381.3, gicGep: '26%' } },
      { segment: 'Banca PSU', july25: { nop: 5, gwp: 0, gicGep: '117%' }, ytdJuly25: { nop: 36, gwp: 1, gicGep: '28%' }, ytdJuly24: { nop: 25, gwp: 0.4, gicGep: '0%' } },
      { segment: 'Partner Others', july25: { nop: 110, gwp: 1, gicGep: '-20%' }, ytdJuly25: { nop: 584, gwp: 3, gicGep: '20%' }, ytdJuly24: { nop: 547, gwp: 2.9, gicGep: '0%' } },
      { segment: 'Commercial', july25: { nop: 122, gwp: 23, gicGep: '135%' }, ytdJuly25: { nop: 560, gwp: 126, gicGep: '129%' }, ytdJuly24: { nop: 692, gwp: 138.1, gicGep: '119%' } },
      { segment: 'SME', july25: { nop: 655, gwp: 44, gicGep: '78%' }, ytdJuly25: { nop: 2556, gwp: 106, gicGep: '79%' }, ytdJuly24: { nop: 2439, gwp: 75.8, gicGep: '86%' } },
      { segment: 'Others', july25: { nop: 223, gwp: 1, gicGep: '-352%' }, ytdJuly25: { nop: 824, gwp: 4, gicGep: '556%' }, ytdJuly24: { nop: 521, gwp: 2.0, gicGep: '37%' } }
    ];

    const julyTotals = {
      july25: { nop: 1154, gwp: 155, gicGep: '46%' },
      ytdJuly25: { nop: 4718, gwp: 653, gicGep: '60%' },
      ytdJuly24: { nop: 4369, gwp: 600, gicGep: '52%' }
    };

    const julyPieDataMap = {
      'YTD July 2025': [
        { name: 'J&K', value: 63, color: '#00BFFF' },
        { name: 'Banca PSU', value: 0, color: '#222' },
        { name: 'Partner Others', value: 0, color: '#FF6347' },
        { name: 'Commercial', value: 19, color: '#FF8C00' },
        { name: 'SME', value: 16, color: '#B3D267' },
        { name: 'Others', value: 1, color: '#FFD700' }
      ],
      'YTD July 2024': [
        { name: 'J&K', value: 64, color: '#00BFFF' },
        { name: 'Banca PSU', value: 0, color: '#222' },
        { name: 'Partner Others', value: 0, color: '#FF6347' },
        { name: 'Commercial', value: 23, color: '#FF8C00' },
        { name: 'SME', value: 13, color: '#B3D267' },
        { name: 'Others', value: 0, color: '#FFD700' }
      ],
      'July 2025': [
        { name: 'J&K', value: 56, color: '#00BFFF' },
        { name: 'Banca PSU', value: 0, color: '#222' },
        { name: 'Partner Others', value: 0, color: '#FF6347' },
        { name: 'Commercial', value: 15, color: '#FF8C00' },
        { name: 'SME', value: 29, color: '#B3D267' },
        { name: 'Others', value: 1, color: '#FFD700' }
      ],
      'July 2024': [
        { name: 'J&K', value: 73, color: '#00BFFF' },
        { name: 'Banca PSU', value: 0, color: '#222' },
        { name: 'Partner Others', value: 0, color: '#FF6347' },
        { name: 'Commercial', value: 17, color: '#FF8C00' },
        { name: 'SME', value: 8, color: '#B3D267' },
        { name: 'Others', value: 0, color: '#FFD700' }
      ]
    };

    const julyPieData = julyPieDataMap[selectedJunePeriod] || julyPieDataMap['YTD July 2025'];

    const julyPrdMix25 = [
      { name: 'Preferred', value: 31, color: '#B3D267' },
      { name: 'Referral', value: 58, color: '#FFA500' },
      { name: 'Declined', value: 11, color: '#FF2222' }
    ];

    const julyPrdMix24 = [
      { name: 'Preferred', value: 31, color: '#B3D267' },
      { name: 'Referral', value: 61, color: '#FFA500' },
      { name: 'Declined', value: 9, color: '#FF2222' }
    ];

    const renderJulyDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
      const RADIAN = Math.PI / 180;
      const radius = (innerRadius + outerRadius) / 2;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      return julyPieData[index].value > 0 ? (
        <text x={x} y={y} fill="#222" fontWeight="bold" fontSize={13} textAnchor="middle" dominantBaseline="central">
          {julyPieData[index].value}%
        </text>
      ) : null;
    };

    const renderJulyLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      return (
        <text x={x} y={y} fill="#222" fontWeight="bold" fontSize={13} textAnchor="middle" dominantBaseline="central">
          {value > 0 ? `${value}%` : ''}
        </text>
      );
    };

    return (
      <div className="mr-container">
        {/* Top Section - Charts */}
        <div className="mr-grid mr-gap mb-8">
          {/* Segment wise GWP Mix */}
          <div className="mr-card">
            <div className="mr-header mr-bg-blue">Segment wise GWP Mix</div>
            <div className="mr-content">
              <div className="mr-form-row">
                <label className="mr-label">Period (to be selected): </label>
                <select className="mr-select" value={selectedJunePeriod} onChange={(e) => setSelectedJunePeriod(e.target.value)}>
                  <option value="YTD July 2025">YTD July 2025</option>
                  <option value="YTD July 2024">YTD July 2024</option>
                  <option value="July 2025">July 2025</option>
                  <option value="July 2024">July 2024</option>
                </select>
              </div>
              <div className="mr-chart-center">
                <PieChart width={320} height={320}>
                  <Pie
                    data={julyPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={renderJulyDonutLabel}
                    isAnimationActive={true}
                    fill="#fff"
                    strokeWidth={2}
                  >
                    {julyPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </div>
              <div className="mr-legend">
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#00BFFF' }}></div><span>J&K</span></div>
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#222' }}></div><span>Banca PSU</span></div>
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF6347' }}></div><span>Partner Others</span></div>
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF8C00' }}></div><span>Commercial</span></div>
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#B3D267' }}></div><span>SME</span></div>
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FFD700' }}></div><span>Others</span></div>
              </div>
            </div>
          </div>
        </div>
        {/* Segment wise Report Table */}
        <div className="mr-card">
          <div className="mr-header mr-bg-blue">Segment wise Report - YTD July 25</div>
          <div className="mr-table-scroll">
            <table className="mr-table">
              <thead>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header" rowSpan="2">Segment</th>
                  <th className="mr-table-header" colSpan="3">July-25</th>
                  <th className="mr-table-header" colSpan="3">YTD July 2025</th>
                  <th className="mr-table-header" colSpan="3">YTD July 2024</th>
                </tr>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header">NOP</th>
                  <th className="mr-table-header">GWP in Mn</th>
                  <th className="mr-table-header">GIC-GEP</th>
                  <th className="mr-table-header">NOP</th>
                  <th className="mr-table-header">GWP in Mn</th>
                  <th className="mr-table-header">GIC-GEP</th>
                  <th className="mr-table-header">NOP</th>
                  <th className="mr-table-header">GWP in Mn</th>
                  <th className="mr-table-header">GIC-GEP</th>
                </tr>
              </thead>
              <tbody>
                {julySegmentData.map((row, index) => (
                  <tr key={index} className="mr-row">
                    <td className="mr-cell mr-cell-left">{row.segment}</td>
                    <td className="mr-cell">{row.july25.nop}</td>
                    <td className="mr-cell">{row.july25.gwp}</td>
                    <td className={`mr-cell mr-cell-bold ${getGepColor(row.july25.gicGep)}`}>{row.july25.gicGep}</td>
                    <td className="mr-cell">{row.ytdJuly25.nop}</td>
                    <td className="mr-cell">{row.ytdJuly25.gwp}</td>
                    <td className={`mr-cell mr-cell-bold ${getGepColor(row.ytdJuly25.gicGep)}`}>{row.ytdJuly25.gicGep}</td>
                    <td className="mr-cell">{row.ytdJuly24.nop}</td>
                    <td className="mr-cell">{row.ytdJuly24.gwp}</td>
                    <td className={`mr-cell mr-cell-bold ${getGepColor(row.ytdJuly24.gicGep, true)}`}>{row.ytdJuly24.gicGep}</td>
                  </tr>
                ))}
                <tr className="mr-total-row">
                  <td className="mr-cell mr-cell-left">TOTAL</td>
                  <td className="mr-cell">{julyTotals.july25.nop}</td>
                  <td className="mr-cell">{julyTotals.july25.gwp}</td>
                  <td className={`mr-cell ${getGepColor(julyTotals.july25.gicGep)}`}>{julyTotals.july25.gicGep}</td>
                  <td className="mr-cell">{julyTotals.ytdJuly25.nop}</td>
                  <td className="mr-cell">{julyTotals.ytdJuly25.gwp}</td>
                  <td className={`mr-cell ${getGepColor(julyTotals.ytdJuly25.gicGep)}`}>{julyTotals.ytdJuly25.gicGep}</td>
                  <td className="mr-cell">{julyTotals.ytdJuly24.nop}</td>
                  <td className="mr-cell">{julyTotals.ytdJuly24.gwp}</td>
                  <td className={`mr-cell ${getGepColor(julyTotals.ytdJuly24.gicGep, true)}`}>{julyTotals.ytdJuly24.gicGep}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mr-footer-notes">
            <div className="mr-note"><strong>Marine - Commercial : D LINK INDIA LTD = 2.19 Crs (General Average/ Jettison) ; Banca PSU : VFORM TECNOPACKS LIMITED = 3.23 L (Wet Damage) ; Others - TUBE INVESTMENTS OF INDIA LIMITED- CYCLE DIVISION = 16.48 L (Wet Damage)</strong></div>
          </div>
        </div>
        {/* Segment wise Average Premium & Rate */}
        <div className="mr-card">
          <div className="mr-header mr-bg-blue">Segment wise Average Premium & Rate</div>
          <div className="mr-flex">
            <div className="mr-flex-1 mr-table-scroll">
              <table className="mr-table">
                <thead>
                  <tr className="mr-table-header-row">
                    <th className="mr-table-header" rowSpan="2">Segment</th>
                    <th className="mr-table-header" colSpan="2">YTD {selectedDate?.month || 'July'} {selectedDate?.year?.split('-')[0] || '2025'}</th>
                    <th className="mr-table-header" colSpan="2">YTD {selectedDate?.month || 'July'} {selectedDate?.year ? (parseInt(selectedDate.year.split('-')[0]) - 1).toString() : '2024'}</th>
                  </tr>
                  <tr className="mr-table-header-row">
                    <th className="mr-table-header">Avg Prem ( Rs.)</th>
                    <th className="mr-table-header">Avg Rate %</th>
                    <th className="mr-table-header">Avg Prem ( Rs.)</th>
                    <th className="mr-table-header">Avg Rate %</th>
                  </tr>
                </thead>
                <tbody>
                  {segAvgData.map((row, index) => (
                    <tr key={index} className="mr-row">
                      <td className="mr-cell mr-cell-left">{row.segment}</td>
                      <td className="mr-cell">{parseFloat(row.current_avg_prem).toLocaleString()}</td>
                      <td className="mr-cell">{row.current_avg_rate}</td>
                      <td className="mr-cell">{parseFloat(row.last_avg_prem).toLocaleString()}</td>
                      <td className="mr-cell">{row.last_avg_rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mr-flex-1 mr-pie-wrap">
              <div className="mr-grid mr-gap">
                <div className="mr-pie-card">
                  <div className="mr-header mr-bg-blue">PRD Mix ( GWP ) - YTD July 25</div>
                  <PieChart width={260} height={220}>
                    <Pie data={julyPrdMix25} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={renderJulyLabel} labelLine={false} isAnimationActive={true} fill="#222" strokeWidth={2}>
                      {julyPrdMix25.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                  <div className="mr-legend mr-legend-row">
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#B3D267' }}></div><span>Preferred</span></div>
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FFA500' }}></div><span>Referral</span></div>
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF2222' }}></div><span>Declined</span></div>
                  </div>
                </div>
                <div className="mr-pie-card">
                  <div className="mr-header mr-bg-blue">PRD Mix ( GWP ) - YTD July 2024</div>
                  <PieChart width={260} height={220}>
                    <Pie data={julyPrdMix24} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={renderJulyLabel} labelLine={false} isAnimationActive={true} fill="#222" strokeWidth={2}>
                      {julyPrdMix24.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                  <div className="mr-legend mr-legend-row">
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#B3D267' }}></div><span>Preferred</span></div>
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FFA500' }}></div><span>Referral</span></div>
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF2222' }}></div><span>Declined</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Segment wise Renewal Ratio */}
        <div className="mr-card">
          <div className="mr-header mr-bg-blue">Segment wise Renewal Ratio - YTD July 25</div>
          <div className="mr-table-scroll">
            <table className="mr-table">
              <thead>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header" rowSpan="2">Segment</th>
                  <th className="mr-table-header" colSpan="3">Premium</th>
                  <th className="mr-table-header" colSpan="3">Policy</th>
                  <th className="mr-table-header" colSpan="3">Client</th>
                </tr>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header">For renewal</th>
                  <th className="mr-table-header">Renewed</th>
                  <th className="mr-table-header">Renewal Ratio</th>
                  <th className="mr-table-header">For renewal</th>
                  <th className="mr-table-header">Renewed</th>
                  <th className="mr-table-header">Renewal Ratio</th>
                  <th className="mr-table-header">For renewal</th>
                  <th className="mr-table-header">Renewed</th>
                  <th className="mr-table-header">Renewal Ratio</th>
                </tr>
              </thead>
              <tbody>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">J&K</td><td className="mr-cell">232,114,193</td><td className="mr-cell">213,995,517</td><td className="mr-cell">92%</td><td className="mr-cell">93</td><td className="mr-cell">84</td><td className="mr-cell">90%</td><td className="mr-cell">74</td><td className="mr-cell">67</td><td className="mr-cell">91%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Banca PSU</td><td className="mr-cell">311,154</td><td className="mr-cell">257,949</td><td className="mr-cell">83%</td><td className="mr-cell">17</td><td className="mr-cell">6</td><td className="mr-cell">35%</td><td className="mr-cell">17</td><td className="mr-cell">6</td><td className="mr-cell">35%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Partner Others</td><td className="mr-cell">2,779,137</td><td className="mr-cell">154,128</td><td className="mr-cell">6%</td><td className="mr-cell">528</td><td className="mr-cell">19</td><td className="mr-cell">4%</td><td className="mr-cell">485</td><td className="mr-cell">18</td><td className="mr-cell">4%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Commercial</td><td className="mr-cell">85,139,539</td><td className="mr-cell">52,341,580</td><td className="mr-cell">61%</td><td className="mr-cell">374</td><td className="mr-cell">208</td><td className="mr-cell">56%</td><td className="mr-cell">340</td><td className="mr-cell">191</td><td className="mr-cell">56%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">SME</td><td className="mr-cell">52,997,028</td><td className="mr-cell">31,757,963</td><td className="mr-cell">60%</td><td className="mr-cell">403</td><td className="mr-cell">176</td><td className="mr-cell">44%</td><td className="mr-cell">358</td><td className="mr-cell">161</td><td className="mr-cell">45%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Others</td><td className="mr-cell">625,010</td><td className="mr-cell">450,496</td><td className="mr-cell">72%</td><td className="mr-cell">9</td><td className="mr-cell">6</td><td className="mr-cell">67%</td><td className="mr-cell">9</td><td className="mr-cell">6</td><td className="mr-cell">75%</td></tr>
                <tr className="mr-total-row"><td className="mr-cell mr-cell-left">Grand Total</td><td className="mr-cell">373,966,061</td><td className="mr-cell">298,957,632</td><td className="mr-cell">80%</td><td className="mr-cell">1,424</td><td className="mr-cell">499</td><td className="mr-cell">35%</td><td className="mr-cell">1,282</td><td className="mr-cell">449</td><td className="mr-cell">35%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mr-grid mr-gap">
          {/* Marine policies issued with CPM cover - YTD July 25 */}
          <div className="mr-card">
            <div className="mr-header mr-bg-blue">Marine policies issued with CPM cover - YTD July 25</div>
            <div className="mr-table-scroll">
              <table className="mr-table mr-table-xs">
                <thead>
                  <tr className="mr-table-header-row">
                    <th className="mr-table-header">Branch Office</th>
                    <th className="mr-table-header">Marine NOP</th>
                    <th className="mr-table-header">Marine GWP</th>
                    <th className="mr-table-header">CPM NOP</th>
                    <th className="mr-table-header">CPM GWP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Nariman Point</td><td className="mr-cell">2</td><td className="mr-cell">585,000</td><td className="mr-cell">0</td><td className="mr-cell">0</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Guwahati</td><td className="mr-cell">36</td><td className="mr-cell">337,110</td><td className="mr-cell">39</td><td className="mr-cell">980,320</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Durgapore</td><td className="mr-cell">89</td><td className="mr-cell">264,467</td><td className="mr-cell">274</td><td className="mr-cell">2,520,379</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Raipur</td><td className="mr-cell">57</td><td className="mr-cell">257,602</td><td className="mr-cell">81</td><td className="mr-cell">1,295,849</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Chennai Head Office</td><td className="mr-cell">16</td><td className="mr-cell">256,403</td><td className="mr-cell">40</td><td className="mr-cell">230,146</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Kolkata</td><td className="mr-cell">75</td><td className="mr-cell">238,972</td><td className="mr-cell">152</td><td className="mr-cell">1,337,303</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Lucknow</td><td className="mr-cell">20</td><td className="mr-cell">222,789</td><td className="mr-cell">39</td><td className="mr-cell">367,830</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Patna</td><td className="mr-cell">17</td><td className="mr-cell">120,426</td><td className="mr-cell">19</td><td className="mr-cell">366,725</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Bhubaneshwar</td><td className="mr-cell">24</td><td className="mr-cell">108,221</td><td className="mr-cell">83</td><td className="mr-cell">744,651</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Chandigarh</td><td className="mr-cell">42</td><td className="mr-cell">106,819</td><td className="mr-cell">61</td><td className="mr-cell">426,297</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Others</td><td className="mr-cell">232</td><td className="mr-cell">1,272,615</td><td className="mr-cell">928</td><td className="mr-cell">6,321,033</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Marine Cargo wise Premium Report - YTD July 25 */}
          <div className="mr-card">
            <div className="mr-header mr-bg-blue">Marine Cargo wise Premium Report - YTD July 25</div>
            <div className="mr-table-scroll">
              <table className="mr-table mr-table-xs">
                <thead>
                  <tr className="mr-table-header-row">
                    <th className="mr-table-header">Cargo</th>
                    <th className="mr-table-header">P/R/D</th>
                    <th className="mr-table-header" colSpan="4">YTD July 2025</th>
                  </tr>
                  <tr className="mr-table-header-row">
                    <th className="mr-table-header"></th>
                    <th className="mr-table-header"></th>
                    <th className="mr-table-header">NOP</th>
                    <th className="mr-table-header">GWP in Mn</th>
                    <th className="mr-table-header">GIC in Mn</th>
                    <th className="mr-table-header">GIC GEP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Automobiles</td><td className="mr-cell">Preferred</td><td className="mr-cell">253</td><td className="mr-cell">168.9</td><td className="mr-cell">47.7</td><td className="mr-cell">36%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Electronic Goods</td><td className="mr-cell">Referral</td><td className="mr-cell">348</td><td className="mr-cell">108.7</td><td className="mr-cell">33.0</td><td className="mr-cell">94%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Sanitaryware/Abrasives/Granites/Marble</td><td className="mr-cell">Declined</td><td className="mr-cell">90</td><td className="mr-cell">67.4</td><td className="mr-cell">30.9</td><td className={`mr-cell ${getGepColor('97%')}`}>97%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Machinery/Tools</td><td className="mr-cell">Referral</td><td className="mr-cell">1178</td><td className="mr-cell">59.7</td><td className="mr-cell">33.7</td><td className="mr-cell">75%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Air Conditioners And Chillers</td><td className="mr-cell">Referral</td><td className="mr-cell">129</td><td className="mr-cell">36.3</td><td className="mr-cell">25.2</td><td className={`mr-cell ${getGepColor('281%')}`}>281%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Chemicals Liquid Chemicals</td><td className="mr-cell">Referral</td><td className="mr-cell">185</td><td className="mr-cell">21.3</td><td className="mr-cell">9.0</td><td className="mr-cell">62%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Electrical Goods/ Transformers</td><td className="mr-cell">Referral</td><td className="mr-cell">118</td><td className="mr-cell">18.0</td><td className="mr-cell">29.1</td><td className={`mr-cell ${getGepColor('423%')}`}>423%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Confectionary/Food & Beverages</td><td className="mr-cell">Referral</td><td className="mr-cell">21</td><td className="mr-cell">13.9</td><td className="mr-cell">11.9</td><td className={`mr-cell ${getGepColor('176%')}`}>176%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Cotton/Textiles/Garments/Yarn</td><td className="mr-cell">Preferred</td><td className="mr-cell">319</td><td className="mr-cell">13.4</td><td className="mr-cell">9.5</td><td className="mr-cell">49%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Paper products / stationary items</td><td className="mr-cell">Referral</td><td className="mr-cell">37</td><td className="mr-cell">9.7</td><td className="mr-cell">9.1</td><td className={`mr-cell ${getGepColor('96%')}`}>96%</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mr-footer-notes mr-footer-cargo">
              <div><strong>Air Conditioners And Chillers - DAIKIN AIRCONDITIONING INDIA PRIVATE LTD = 3.20 Crs</strong> (Jerks and jolts without any accident to the carrying vehicle); <strong>Confectionary/Food & Beverages - SLMG BEVERAGES PRIVATE LIMITED = 1.10 Crs</strong> (Accident to Carrying Vehicle); <strong>Electronic Goods - D LINK INDIA LTD = 2.36 Crs</strong> (General Average/ Jettison); <strong>Electrical Goods/ Transformers - VA TECH WABAG LTD = 1.48 Crs</strong> (Others); <strong>Sanitaryware - CONFFI SANITARYWARE PRIVATE LIMITED 64.41 L</strong> (Breakage); <strong>Paper products / stationary items - TCPL PACKAGING LIMITED = 44.85 L</strong> (Accident to Carrying Vehicle)</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedDate?.month === 'June') {
    // June data using same structure as May
    const juneSegmentData = [
      { segment: 'J&K', june25: { nop: 34, gwp: 56, gicGep: '64%' }, ytdJune25: { nop: 118, gwp: 292, gicGep: '36%' }, ytdJune24: { nop: 114, gwp: 270, gicGep: '25%' } },
      { segment: 'Banca PSU', june25: { nop: 15, gwp: 0, gicGep: '0%' }, ytdJune25: { nop: 31, gwp: 1, gicGep: '0%' }, ytdJune24: { nop: 17, gwp: 0.4, gicGep: '0%' } },
      { segment: 'Partner Others', june25: { nop: 106, gwp: 0, gicGep: '0%' }, ytdJune25: { nop: 474, gwp: 2, gicGep: '34%' }, ytdJune24: { nop: 436, gwp: 2, gicGep: '17%' } },
      { segment: 'Commercial', june25: { nop: 112, gwp: 26, gicGep: '212%' }, ytdJune25: { nop: 437, gwp: 103, gicGep: '126%' }, ytdJune24: { nop: 570, gwp: 112, gicGep: '131%' } },
      { segment: 'SME', june25: { nop: 542, gwp: 14, gicGep: '169%' }, ytdJune25: { nop: 1873, gwp: 62, gicGep: '79%' }, ytdJune24: { nop: 1912, gwp: 63, gicGep: '94%' } },
      { segment: 'Others', june25: { nop: 181, gwp: 1, gicGep: '640%' }, ytdJune25: { nop: 620, gwp: 2, gicGep: '1143%' }, ytdJune24: { nop: 442, gwp: 1.6, gicGep: '47%' } }
    ];

    const juneTotals = {
      june25: { nop: 990, gwp: 98, gicGep: '110%' },
      ytdJune25: { nop: 3553, gwp: 462, gicGep: '66%' },
      ytdJune24: { nop: 3491, gwp: 449, gicGep: '56%' }
    };

    const junePieDataMap = {
      'YTD June 2025': [
        { name: 'J&K', value: 63, color: '#00BFFF' },
        { name: 'Banca PSU', value: 0, color: '#222' },
        { name: 'Partner Others', value: 0, color: '#FF6347' },
        { name: 'Commercial', value: 22, color: '#FF8C00' },
        { name: 'SME', value: 14, color: '#B3D267' },
        { name: 'Others', value: 1, color: '#FFD700' }
      ],
      'YTD June 2024': [
        { name: 'J&K', value: 60, color: '#00BFFF' },
        { name: 'Banca PSU', value: 0, color: '#222' },
        { name: 'Partner Others', value: 0, color: '#FF6347' },
        { name: 'Commercial', value: 25, color: '#FF8C00' },
        { name: 'SME', value: 14, color: '#B3D267' },
        { name: 'Others', value: 1, color: '#FFD700' }
      ],
      'June 2025': [
        { name: 'J&K', value: 58, color: '#00BFFF' },
        { name: 'Banca PSU', value: 0, color: '#222' },
        { name: 'Partner Others', value: 1, color: '#FF6347' },
        { name: 'Commercial', value: 27, color: '#FF8C00' },
        { name: 'SME', value: 14, color: '#B3D267' },
        { name: 'Others', value: 0, color: '#FFD700' }
      ],
      'June 2024': [
        { name: 'J&K', value: 73, color: '#00BFFF' },
        { name: 'Banca PSU', value: 0, color: '#222' },
        { name: 'Partner Others', value: 1, color: '#FF6347' },
        { name: 'Commercial', value: 14, color: '#FF8C00' },
        { name: 'SME', value: 11, color: '#B3D267' },
        { name: 'Others', value: 1, color: '#FFD700' }
      ]
    };

    const junePieData = junePieDataMap[selectedJunePeriod] || junePieDataMap['YTD June 2025'];

    const junePrdMix25 = [
      { name: 'Preferred', value: 34, color: '#B3D267' },
      { name: 'Referral', value: 60, color: '#FFA500' },
      { name: 'Declined', value: 6, color: '#FF2222' }
    ];

    const junePrdMix24 = [
      { name: 'Preferred', value: 33, color: '#B3D267' },
      { name: 'Referral', value: 58, color: '#FFA500' },
      { name: 'Declined', value: 9, color: '#FF2222' }
    ];

    const renderJuneDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
      const RADIAN = Math.PI / 180;
      const radius = (innerRadius + outerRadius) / 2;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      return junePieData[index].value > 0 ? (
        <text x={x} y={y} fill="#222" fontWeight="bold" fontSize={13} textAnchor="middle" dominantBaseline="central">
          {junePieData[index].value}%
        </text>
      ) : null;
    };

    const renderJuneLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      return (
        <text x={x} y={y} fill="#222" fontWeight="bold" fontSize={13} textAnchor="middle" dominantBaseline="central">
          {value > 0 ? `${value}%` : ''}
        </text>
      );
    };

    return (
      <div className="mr-container">
        {/* Top Section - Charts */}
        <div className="mr-grid mr-gap mb-8">
          {/* Segment wise GWP Mix */}
          <div className="mr-card">
            <div className="mr-header mr-bg-blue">Segment wise GWP Mix</div>
            <div className="mr-content">
              <div className="mr-form-row">
                <label className="mr-label">Period (to be selected): </label>
                <select className="mr-select" value={selectedJunePeriod} onChange={(e) => setSelectedJunePeriod(e.target.value)}>
                  <option value="YTD June 2025">YTD June 2025</option>
                  <option value="YTD June 2024">YTD June 2024</option>
                  <option value="June 2025">June 2025</option>
                  <option value="June 2024">June 2024</option>
                </select>
              </div>
              <div className="mr-chart-center">
                <PieChart width={320} height={320}>
                  <Pie
                    data={junePieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={renderJuneDonutLabel}
                    isAnimationActive={true}
                    fill="#fff"
                    strokeWidth={2}
                  >
                    {junePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </div>
              <div className="mr-legend">
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#00BFFF' }}></div><span>J&K</span></div>
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#222' }}></div><span>Banca PSU</span></div>
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF6347' }}></div><span>Partner Others</span></div>
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF8C00' }}></div><span>Commercial</span></div>
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#B3D267' }}></div><span>SME</span></div>
                <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FFD700' }}></div><span>Others</span></div>
              </div>
            </div>
          </div>
        </div>
        {/* Segment wise Report Table */}
        <div className="mr-card">
          <div className="mr-header mr-bg-blue">Segment wise Report - YTD June 25</div>
          <div className="mr-table-scroll">
            <table className="mr-table">
              <thead>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header" rowSpan="2">Segment</th>
                  <th className="mr-table-header" colSpan="3">June-25</th>
                  <th className="mr-table-header" colSpan="3">YTD June 2025</th>
                  <th className="mr-table-header" colSpan="3">YTD June 2024</th>
                </tr>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header">NOP</th>
                  <th className="mr-table-header">GWP in Mn</th>
                  <th className="mr-table-header">GIC-GEP</th>
                  <th className="mr-table-header">NOP</th>
                  <th className="mr-table-header">GWP in Mn</th>
                  <th className="mr-table-header">GIC-GEP</th>
                  <th className="mr-table-header">NOP</th>
                  <th className="mr-table-header">GWP in Mn</th>
                  <th className="mr-table-header">GIC-GEP</th>
                </tr>
              </thead>
              <tbody>
                {juneSegmentData.map((row, index) => (
                  <tr key={index} className="mr-row">
                    <td className="mr-cell mr-cell-left">{row.segment}</td>
                    <td className="mr-cell">{row.june25.nop}</td>
                    <td className="mr-cell">{row.june25.gwp}</td>
                    <td className={`mr-cell mr-cell-bold ${getGepColor(row.june25.gicGep)}`}>{row.june25.gicGep}</td>
                    <td className="mr-cell">{row.ytdJune25.nop}</td>
                    <td className="mr-cell">{row.ytdJune25.gwp}</td>
                    <td className={`mr-cell mr-cell-bold ${getGepColor(row.ytdJune25.gicGep)}`}>{row.ytdJune25.gicGep}</td>
                    <td className="mr-cell">{row.ytdJune24.nop}</td>
                    <td className="mr-cell">{row.ytdJune24.gwp}</td>
                    <td className={`mr-cell mr-cell-bold ${getGepColor(row.ytdJune24.gicGep, true)}`}>{row.ytdJune24.gicGep}</td>
                  </tr>
                ))}
                <tr className="mr-total-row">
                  <td className="mr-cell mr-cell-left">TOTAL</td>
                  <td className="mr-cell">{juneTotals.june25.nop}</td>
                  <td className="mr-cell">{juneTotals.june25.gwp}</td>
                  <td className={`mr-cell ${getGepColor(juneTotals.june25.gicGep)}`}>{juneTotals.june25.gicGep}</td>
                  <td className="mr-cell">{juneTotals.ytdJune25.nop}</td>
                  <td className="mr-cell">{juneTotals.ytdJune25.gwp}</td>
                  <td className={`mr-cell ${getGepColor(juneTotals.ytdJune25.gicGep)}`}>{juneTotals.ytdJune25.gicGep}</td>
                  <td className="mr-cell">{juneTotals.ytdJune24.nop}</td>
                  <td className="mr-cell">{juneTotals.ytdJune24.gwp}</td>
                  <td className={`mr-cell ${getGepColor(juneTotals.ytdJune24.gicGep, true)}`}>{juneTotals.ytdJune24.gicGep}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mr-footer-notes">
            <div className="mr-note"><strong>Marine - Partner Others :</strong> PONKODI SEKAR = 6.18L (Jerks and jolts without any accident to the carrying vehicle)</div>
            <div className="mr-note"><strong>SME :</strong> AMBER ENTERPRISES INDIA LIMITED = 50.34 L (Jerks and jolts without any accident to the carrying vehicle)</div>
            <div className="mr-note"><strong>Others :</strong> AYTECH VOYAGE = 1.46 L (Jerks and jolts without any accident to the carrying vehicle) ; J&K : CHOLA MS = 5.34 L (Jerks and jolts without any accident to the carrying vehicle)</div>
          </div>
        </div>
        {/* Segment wise Average Premium & Rate */}
        <div className="mr-card">
          <div className="mr-header mr-bg-blue">Segment wise Average Premium & Rate</div>
          <div className="mr-flex">
            <div className="mr-flex-1 mr-table-scroll">
              <table className="mr-table">
                <thead>
                  <tr className="mr-table-header-row">
                    <th className="mr-table-header" rowSpan="2">Segment</th>
                    <th className="mr-table-header" colSpan="2">YTD {selectedDate?.month || 'May'} {selectedDate?.year?.split('-')[0] || '2025'}</th>
                    <th className="mr-table-header" colSpan="2">YTD {selectedDate?.month || 'May'} {selectedDate?.year ? (parseInt(selectedDate.year.split('-')[0]) - 1).toString() : '2024'}</th>
                  </tr>
                  <tr className="mr-table-header-row">
                    <th className="mr-table-header">Avg Prem ( Rs.)</th>
                    <th className="mr-table-header">Avg Rate %</th>
                    <th className="mr-table-header">Avg Prem ( Rs.)</th>
                    <th className="mr-table-header">Avg Rate %</th>
                  </tr>
                </thead>
                <tbody>
                  {segAvgData.map((row, index) => (
                    <tr key={index} className="mr-row">
                      <td className="mr-cell mr-cell-left">{row.segment}</td>
                      <td className="mr-cell">{parseFloat(row.current_avg_prem).toLocaleString()}</td>
                      <td className="mr-cell">{row.current_avg_rate}</td>
                      <td className="mr-cell">{parseFloat(row.last_avg_prem).toLocaleString()}</td>
                      <td className="mr-cell">{row.last_avg_rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mr-flex-1 mr-pie-wrap">
              <div className="mr-grid mr-gap">
                <div className="mr-pie-card">
                  <div className="mr-header mr-bg-blue">PRD Mix ( GWP ) - YTD June 25</div>
                  <PieChart width={260} height={220}>
                    <Pie data={junePrdMix25} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={renderJuneLabel} labelLine={false} isAnimationActive={true} fill="#222" strokeWidth={2}>
                      {junePrdMix25.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                  <div className="mr-legend mr-legend-row">
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#B3D267' }}></div><span>Preferred</span></div>
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FFA500' }}></div><span>Referral</span></div>
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF2222' }}></div><span>Declined</span></div>
                  </div>
                </div>
                <div className="mr-pie-card">
                  <div className="mr-header mr-bg-blue">PRD Mix ( GWP ) - YTD June 2024</div>
                  <PieChart width={260} height={220}>
                    <Pie data={junePrdMix24} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={renderJuneLabel} labelLine={false} isAnimationActive={true} fill="#222" strokeWidth={2}>
                      {junePrdMix24.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                  <div className="mr-legend mr-legend-row">
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#B3D267' }}></div><span>Preferred</span></div>
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FFA500' }}></div><span>Referral</span></div>
                    <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF2222' }}></div><span>Declined</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Segment wise Renewal Ratio */}
        <div className="mr-card">
          <div className="mr-header mr-bg-blue">Segment wise Renewal Ratio - YTD June 25</div>
          <div className="mr-table-scroll">
            <table className="mr-table">
              <thead>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header" rowSpan="2">Segment</th>
                  <th className="mr-table-header" colSpan="3">Premium</th>
                  <th className="mr-table-header" colSpan="3">Policy</th>
                  <th className="mr-table-header" colSpan="3">Client</th>
                </tr>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header">For renewal</th>
                  <th className="mr-table-header">Renewed</th>
                  <th className="mr-table-header">Renewal Ratio</th>
                  <th className="mr-table-header">For renewal</th>
                  <th className="mr-table-header">Renewed</th>
                  <th className="mr-table-header">Renewal Ratio</th>
                  <th className="mr-table-header">For renewal</th>
                  <th className="mr-table-header">Renewed</th>
                  <th className="mr-table-header">Renewal Ratio</th>
                </tr>
              </thead>
              <tbody>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">J&K</td><td className="mr-cell">157,432,935</td><td className="mr-cell">152,088,775</td><td className="mr-cell">97%</td><td className="mr-cell">76</td><td className="mr-cell">73</td><td className="mr-cell">96%</td><td className="mr-cell">63</td><td className="mr-cell">57</td><td className="mr-cell">90%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Banca PSU</td><td className="mr-cell">258,304</td><td className="mr-cell">150,949</td><td className="mr-cell">58%</td><td className="mr-cell">12</td><td className="mr-cell">5</td><td className="mr-cell">42%</td><td className="mr-cell">12</td><td className="mr-cell">5</td><td className="mr-cell">42%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Partner Others</td><td className="mr-cell">2,142,638</td><td className="mr-cell">86,969</td><td className="mr-cell">4%</td><td className="mr-cell">417</td><td className="mr-cell">14</td><td className="mr-cell">3%</td><td className="mr-cell">387</td><td className="mr-cell">13</td><td className="mr-cell">3%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Commercial</td><td className="mr-cell">68,194,214</td><td className="mr-cell">42,380,887</td><td className="mr-cell">62%</td><td className="mr-cell">294</td><td className="mr-cell">168</td><td className="mr-cell">57%</td><td className="mr-cell">263</td><td className="mr-cell">152</td><td className="mr-cell">58%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">SME</td><td className="mr-cell">45,768,270</td><td className="mr-cell">27,585,469</td><td className="mr-cell">60%</td><td className="mr-cell">307</td><td className="mr-cell">131</td><td className="mr-cell">43%</td><td className="mr-cell">270</td><td className="mr-cell">120</td><td className="mr-cell">44%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Others</td><td className="mr-cell">655,010</td><td className="mr-cell">450,496</td><td className="mr-cell">69%</td><td className="mr-cell">9</td><td className="mr-cell">6</td><td className="mr-cell">67%</td><td className="mr-cell">9</td><td className="mr-cell">6</td><td className="mr-cell">67%</td></tr>
                <tr className="mr-total-row"><td className="mr-cell mr-cell-left">Grand Total</td><td className="mr-cell">274,451,372</td><td className="mr-cell">222,743,545</td><td className="mr-cell">81%</td><td className="mr-cell">1,115</td><td className="mr-cell">397</td><td className="mr-cell">36%</td><td className="mr-cell">1,004</td><td className="mr-cell">353</td><td className="mr-cell">35%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mr-grid mr-gap">
          {/* Marine policies issued with CPM cover - YTD June 25 */}
          <div className="mr-card">
            <div className="mr-header mr-bg-blue">Marine policies issued with CPM cover - YTD June 25</div>
            <div className="mr-table-scroll">
              <table className="mr-table mr-table-xs">
                <thead>
                  <tr className="mr-table-header-row">
                    <th className="mr-table-header">Branch Office</th>
                    <th className="mr-table-header">Marine NOP</th>
                    <th className="mr-table-header">Marine GWP</th>
                    <th className="mr-table-header">CPM NOP</th>
                    <th className="mr-table-header">CPM GWP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Nariman Point</td><td className="mr-cell">2</td><td className="mr-cell">585,000</td><td className="mr-cell">0</td><td className="mr-cell">0</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Guwahati</td><td className="mr-cell">26</td><td className="mr-cell">271,612</td><td className="mr-cell">27</td><td className="mr-cell">791,956</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Durgapore</td><td className="mr-cell">86</td><td className="mr-cell">251,645</td><td className="mr-cell">219</td><td className="mr-cell">2,264,465</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Kolkata</td><td className="mr-cell">70</td><td className="mr-cell">225,709</td><td className="mr-cell">118</td><td className="mr-cell">1,180,458</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Raipur</td><td className="mr-cell">41</td><td className="mr-cell">172,381</td><td className="mr-cell">59</td><td className="mr-cell">850,145</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Chennai Head Office</td><td className="mr-cell">15</td><td className="mr-cell">162,989</td><td className="mr-cell">39</td><td className="mr-cell">227,169</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Lucknow</td><td className="mr-cell">14</td><td className="mr-cell">123,299</td><td className="mr-cell">28</td><td className="mr-cell">278,388</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Bhubaneshwar</td><td className="mr-cell">21</td><td className="mr-cell">97,099</td><td className="mr-cell">58</td><td className="mr-cell">609,447</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Siliguri</td><td className="mr-cell">30</td><td className="mr-cell">90,085</td><td className="mr-cell">64</td><td className="mr-cell">356,755</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Rourkela</td><td className="mr-cell">22</td><td className="mr-cell">87,015</td><td className="mr-cell">64</td><td className="mr-cell">581,948</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Others</td><td className="mr-cell">170</td><td className="mr-cell">979,436</td><td className="mr-cell">612</td><td className="mr-cell">4,260,125</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Marine Cargo wise Premium Report - YTD June 25 */}
          <div className="mr-card">
            <div className="mr-header mr-bg-blue">Marine Cargo wise Premium Report - YTD June 25</div>
            <div className="mr-table-scroll">
              <table className="mr-table mr-table-xs">
                <thead>
                  <tr className="mr-table-header-row">
                    <th className="mr-table-header">Cargo</th>
                    <th className="mr-table-header">P/R/D</th>
                    <th className="mr-table-header" colSpan="4">YTD June 2025</th>
                  </tr>
                  <tr className="mr-table-header-row">
                    <th className="mr-table-header"></th>
                    <th className="mr-table-header"></th>
                    <th className="mr-table-header">NOP</th>
                    <th className="mr-table-header">GWP in Mn</th>
                    <th className="mr-table-header">GIC in Mn</th>
                    <th className="mr-table-header">GIC GEP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Automobiles</td><td className="mr-cell">Preferred</td><td className="mr-cell">201</td><td className="mr-cell">124.7</td><td className="mr-cell">45.1</td><td className="mr-cell">47%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Electronic Goods</td><td className="mr-cell">Referral</td><td className="mr-cell">238</td><td className="mr-cell">55.4</td><td className="mr-cell">34.0</td><td className="mr-cell">62%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Machinery/Tools</td><td className="mr-cell">Referral</td><td className="mr-cell">904</td><td className="mr-cell">48.6</td><td className="mr-cell">21.9</td><td className="mr-cell">65%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Air Conditioners And Chillers</td><td className="mr-cell">Referral</td><td className="mr-cell">113</td><td className="mr-cell">36.1</td><td className="mr-cell">19.0</td><td className={`mr-cell ${getGepColor('348%')}`}>348%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Sanitaryware/</td><td className="mr-cell">Declined</td><td className="mr-cell">55</td><td className="mr-cell">25.8</td><td className="mr-cell">17.2</td><td className="mr-cell">77%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Chemicals Liquid Chemicals</td><td className="mr-cell">Referral</td><td className="mr-cell">156</td><td className="mr-cell">20.3</td><td className="mr-cell">8.7</td><td className="mr-cell">76%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Electrical Goods/ Transformers</td><td className="mr-cell">Referral</td><td className="mr-cell">81</td><td className="mr-cell">16.3</td><td className="mr-cell">20.7</td><td className={`mr-cell ${getGepColor('819%')}`}>819%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Confectionary/Food & Beverages</td><td className="mr-cell">Referral</td><td className="mr-cell">16</td><td className="mr-cell">13.1</td><td className="mr-cell">10.0</td><td className={`mr-cell ${getGepColor('192%')}`}>192%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Cotton/Textiles/Garments/Yarn</td><td className="mr-cell">Preferred</td><td className="mr-cell">217</td><td className="mr-cell">11.6</td><td className="mr-cell">8.0</td><td className="mr-cell">50%</td></tr>
                  <tr className="mr-row"><td className="mr-cell mr-cell-left">Metalware</td><td className="mr-cell">Preferred</td><td className="mr-cell">105</td><td className="mr-cell">8.2</td><td className="mr-cell">3.5</td><td className="mr-cell">81%</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mr-footer-notes mr-footer-cargo">
              <div><strong>Air Conditioners And Chillers - DAIKIN AIRCONDITIONING INDIA PRIVATE LTD = 63.34L</strong> (Jerks and jolts without any accident to the carrying vehicle);</div>
              <div><strong>Confectionary/Food & Beverages - SLMG BEVERAGES PRIVATE LIMITED = 53.72L</strong> (Accident to Carrying Vehicle);</div>
              <div><strong>Metalware - QTALBROS PRIVATE LIMITED = 24.29 L</strong> (Jerks and jolts without any accident to the carrying vehicle);</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const segmentData = [
    { segment: 'J&K', may25: { nop: 33, gwp: 41, gicGep: '47%' }, ytdMay25: { nop: 83, gwp: 235, gicGep: '20%' }, ytdMay24: { nop: 80, gwp: 197, gicGep: '34%' } },
    { segment: 'Banca PSU', may25: { nop: 8, gwp: 0, gicGep: '0%' }, ytdMay25: { nop: 16, gwp: 1, gicGep: '0%' }, ytdMay24: { nop: 13, gwp: 0.3, gicGep: '0%' } },
    { segment: 'Partner Others', may25: { nop: 118, gwp: 1, gicGep: '100%' }, ytdMay25: { nop: 366, gwp: 1, gicGep: '50%' }, ytdMay24: { nop: 325, gwp: 2, gicGep: '10%' } },
    { segment: 'Commercial', may25: { nop: 145, gwp: 22, gicGep: '78%' }, ytdMay25: { nop: 323, gwp: 76, gicGep: '83%' }, ytdMay24: { nop: 394, gwp: 97, gicGep: '116%' } },
    { segment: 'SME', may25: { nop: 648, gwp: 12, gicGep: '99%' }, ytdMay25: { nop: 1313, gwp: 48, gicGep: '36%' }, ytdMay24: { nop: 1268, gwp: 52, gicGep: '95%' } },
    { segment: 'Others', may25: { nop: 228, gwp: 2, gicGep: '1319%' }, ytdMay25: { nop: 436, gwp: 3, gicGep: '911%' }, ytdMay24: { nop: 200, gwp: 1.4, gicGep: '-39%' } }
  ];

  const totals = {
    may25: { nop: 1180, gwp: 77, gicGep: '73%' },
    ytdMay25: { nop: 2537, gwp: 364, gicGep: '43%' },
    ytdMay24: { nop: 2280, gwp: 349, gicGep: '60%' }
  };

  const getRenewalRatioColor = (ratio) => {
    const numericValue = parseInt(ratio.replace('%', ''));
    return numericValue > 90 ? 'mr-text-red mr-cell-bold' : '';
  };

  // Pie chart data for different periods
  const pieDataMap = {
    'YTD May 2025': [
      { name: 'J&K', value: 65, color: '#00BFFF' },
      { name: 'Banca PSU', value: 0, color: '#222' },
      { name: 'Partner Others', value: 0, color: '#FF6347' },
      { name: 'Commercial', value: 21, color: '#FF8C00' },
      { name: 'SME', value: 13, color: '#B3D267' },
      { name: 'Others', value: 1, color: '#FFD700' }
    ],
    'YTD May 2024': [
      { name: 'J&K', value: 56, color: '#00BFFF' },
      { name: 'Banca PSU', value: 0, color: '#222' },
      { name: 'Partner Others', value: 1, color: '#FF6347' },
      { name: 'Commercial', value: 28, color: '#FF8C00' },
      { name: 'SME', value: 15, color: '#B3D267' },
      { name: 'Others', value: 0, color: '#FFD700' }
    ],
    'May 2025': [
      { name: 'J&K', value: 53, color: '#00BFFF' },
      { name: 'Banca PSU', value: 0, color: '#222' },
      { name: 'Partner Others', value: 1, color: '#FF6347' },
      { name: 'Commercial', value: 28, color: '#FF8C00' },
      { name: 'SME', value: 16, color: '#B3D267' },
      { name: 'Others', value: 2, color: '#FFD700' }
    ],
    'May 2024': [
      { name: 'J&K', value: 57, color: '#00BFFF' },
      { name: 'Banca PSU', value: 0, color: '#222' },
      { name: 'Partner Others', value: 1, color: '#FF6347' },
      { name: 'Commercial', value: 23, color: '#FF8C00' },
      { name: 'SME', value: 18, color: '#B3D267' },
      { name: 'Others', value: 1, color: '#FFD700' }
    ]
  };

  const [selectedPieChartPeriod, setSelectedPieChartPeriod] = useState('YTD May 2025');
  const pieData = pieDataMap[selectedPieChartPeriod] || pieDataMap['YTD May 2025'];

  // Pie chart label for donut chart
  const renderDonutLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = (innerRadius + outerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return pieData[index].value > 0 ? (
      <text x={x} y={y} fill="#222" fontWeight="bold" fontSize={13} textAnchor="middle" dominantBaseline="central">
        {pieData[index].value}%
      </text>
    ) : null;
  };



  const prdMix25 = [
    { name: 'Preferred', value: 35, color: '#B3D267' },
    { name: 'Referral', value: 60, color: '#FFA500' },
    { name: 'Declined', value: 5, color: '#FF2222' },
  ];

  const prdMix24 = [
    { name: 'Preferred', value: 26, color: '#B3D267' },
    { name: 'Referral', value: 63, color: '#FFA500' },
    { name: 'Declined', value: 10, color: '#FF2222' },
  ];

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#222"
        fontWeight="bold"
        fontSize={13}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {value > 0 ? `${value}%` : ''}
      </text>
    );
  };

  return (
    <div className="mr-container">
      {/* Top Section - Charts */}
      <div className="mr-grid mr-gap mb-8">
        {/* Segment wise GWP Mix */}
        <div className="mr-card">
          <div className="mr-header mr-bg-blue">Segment wise GWP Mix</div>
          <div className="mr-content">
            <div className="mr-form-row">
              <label className="mr-label">Period (to be selected): </label>
              <select className="mr-select" value={selectedPieChartPeriod} onChange={(e) => setSelectedPieChartPeriod(e.target.value)}>
                <option value="YTD May 2025">YTD May 2025</option>
                <option value="YTD May 2024">YTD May 2024</option>
                <option value="May 2025">May 2025</option>
                <option value="May 2024">May 2024</option>
              </select>
            </div>
            <div className="mr-chart-center">
              <PieChart width={320} height={320}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                  label={renderDonutLabel}
                  isAnimationActive={true}
                  fill="#fff"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              </PieChart>
            </div>
            <div className="mr-legend">
              <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#00BFFF' }}></div><span>J&K</span></div>
              <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#222' }}></div><span>Banca PSU</span></div>
              <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF6347' }}></div><span>Partner Others</span></div>
              <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF8C00' }}></div><span>Commercial</span></div>
              <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#B3D267' }}></div><span>SME</span></div>
              <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FFD700' }}></div><span>Others</span></div>
            </div>
          </div>
        </div>
        {/* Product wise Premium & Claims Report */}
        <div className="mr-card">
          <div className="mr-header mr-bg-blue-dark mr-border-bottom">Product wise Premium & Claims Report</div>
          <div className="mr-subheader mr-bg-blue-light">
            <span className="mr-bold">Period ( to be selected )</span>
            <select className="mr-select mr-bg-yellow" value={selectedMonth} onChange={(e) => handleMonthChange(e.target.value)}>
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className="mr-content mr-bg-blue-xlight">
            {loading ? (
              <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
            ) : (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart
                data={productData}
                margin={{ top: 30, right: 40, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fontSize: 11 }}
                  domain={[0, 3000]}
                  allowDataOverflow
                  tickFormatter={v => v}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  domain={[0, getMaxGicGep() || 70]}
                  allowDataOverflow
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar yAxisId="left" dataKey="NOP" fill="#d6c7f7" name="NOP" barSize={28}>
                </Bar>
                <Bar yAxisId="left" dataKey="GWP" fill="#003366" name="GWP in Mn" barSize={24}>
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="GICGEP"
                  stroke="#e30613"
                  strokeWidth={3}
                  dot={{ fill: "#e30613", r: 4 }}
                  name="GIC:GEP"
                  label={({ x, y, value }) => (
                    <text
                      x={x}
                      y={y - 12}
                      fill="#e30613"
                      fontWeight="bold"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {value}%
                    </text>
                  )}
                />
              </ComposedChart>
            </ResponsiveContainer>
            )}
            <div className="mr-legend mr-legend-row">
              <div className="mr-legend-item"><div className="mr-legend-color mr-bg-nop"></div><span className="mr-text">NOP</span></div>
              <div className="mr-legend-item"><div className="mr-legend-color mr-bg-gwp"></div><span className="mr-text">GWP in Mn</span></div>
              <div className="mr-legend-item"><div className="mr-legend-color mr-bg-gic"></div><span className="mr-text">GIC-GEP</span></div>
            </div>
          </div>
          <div className="mr-footer mr-bg-blue-dark">*Total GWP - YTD May 2025 = 364 Mn;</div>
        </div>
      </div>
      {/* Segment wise Report Table */}
      <div className="mr-card">
        <div className="mr-header mr-bg-blue">Segment wise Report - YTD May 25</div>
        <div className="mr-table-scroll">
          <table className="mr-table">
            <thead>
              <tr className="mr-table-header-row">
                <th className="mr-table-header" rowSpan="2">Segment</th>
                <th className="mr-table-header" colSpan="3">May-25</th>
                <th className="mr-table-header" colSpan="3">YTD May 2025</th>
                <th className="mr-table-header" colSpan="3">YTD May 2024</th>
              </tr>
              <tr className="mr-table-header-row">
                <th className="mr-table-header">NOP</th>
                <th className="mr-table-header">GWP in Mn</th>
                <th className="mr-table-header">GIC-GEP</th>
                <th className="mr-table-header">NOP</th>
                <th className="mr-table-header">GWP in Mn</th>
                <th className="mr-table-header">GIC-GEP</th>
                <th className="mr-table-header">NOP</th>
                <th className="mr-table-header">GWP in Mn</th>
                <th className="mr-table-header">GIC-GEP</th>
              </tr>
            </thead>
            <tbody>
              {segmentData.map((row, index) => (
                <tr key={index} className="mr-row">
                  <td className="mr-cell mr-cell-left">{row.segment}</td>
                  <td className="mr-cell">{row.may25.nop}</td>
                  <td className="mr-cell">{row.may25.gwp}</td>
                  <td className={`mr-cell mr-cell-bold ${getGepColor(row.may25.gicGep)}`}>{row.may25.gicGep}</td>
                  <td className="mr-cell">{row.ytdMay25.nop}</td>
                  <td className="mr-cell">{row.ytdMay25.gwp}</td>
                  <td className={`mr-cell mr-cell-bold ${getGepColor(row.ytdMay25.gicGep)}`}>{row.ytdMay25.gicGep}</td>
                  <td className="mr-cell">{row.ytdMay24.nop}</td>
                  <td className="mr-cell">{row.ytdMay24.gwp}</td>
                  <td className={`mr-cell mr-cell-bold ${getGepColor(row.ytdMay24.gicGep, true)}`}>{row.ytdMay24.gicGep}</td>
                </tr>
              ))}
              <tr className="mr-total-row">
                <td className="mr-cell mr-cell-left">TOTAL</td>
                <td className="mr-cell">{totals.may25.nop}</td>
                <td className="mr-cell">{totals.may25.gwp}</td>
                <td className={`mr-cell ${getGepColor(totals.may25.gicGep)}`}>{totals.may25.gicGep}</td>
                <td className="mr-cell">{totals.ytdMay25.nop}</td>
                <td className="mr-cell">{totals.ytdMay25.gwp}</td>
                <td className={`mr-cell ${getGepColor(totals.ytdMay25.gicGep)}`}>{totals.ytdMay25.gicGep}</td>
                <td className="mr-cell">{totals.ytdMay24.nop}</td>
                <td className="mr-cell">{totals.ytdMay24.gwp}</td>
                <td className={`mr-cell ${getGepColor(totals.ytdMay24.gicGep, true)}`}>{totals.ytdMay24.gicGep}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mr-footer-notes">
          <div className="mr-note"><strong>Marine - Partner Others :</strong> PONKODI SEKAR = 6.18L (Jerks and jolts without any accident to the carrying vehicle)</div>
          <div className="mr-note"><strong>SME :</strong> AMBER ENTERPRISES INDIA LIMITED = 50.34 L (Jerks and jolts without any accident to the carrying vehicle)</div>
          <div className="mr-note"><strong>Others :</strong> AYTECH VOYAGE = 1.46 L (Jerks and jolts without any accident to the carrying vehicle) ; J&K : CHOLA MS = 5.34 L (Jerks and jolts without any accident to the carrying vehicle)</div>
        </div>
      </div>
      {/* Footer Notes */}
      {/* Segment wise Average Premium & Rate */}
      <div className="mr-card">
        <div className="mr-header mr-bg-blue">Segment wise Average Premium & Rate</div>
        <div className="mr-flex">
          <div className="mr-flex-1 mr-table-scroll">
            <table className="mr-table">
              <thead>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header" rowSpan="2">Segment</th>
                  <th className="mr-table-header" colSpan="2">YTD {selectedDate?.month || 'May'} {selectedDate?.year?.split('-')[0] || '2025'}</th>
                  <th className="mr-table-header" colSpan="2">YTD {selectedDate?.month || 'May'} {selectedDate?.year ? (parseInt(selectedDate.year.split('-')[0]) - 1).toString() : '2024'}</th>
                </tr>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header">Avg Prem ( Rs.)</th>
                  <th className="mr-table-header">Avg Rate %</th>
                  <th className="mr-table-header">Avg Prem ( Rs.)</th>
                  <th className="mr-table-header">Avg Rate %</th>
                </tr>
              </thead>
              <tbody>
                {segAvgData.map((row, index) => (
                  <tr key={index} className="mr-row">
                    <td className="mr-cell mr-cell-left">{row.segment}</td>
                    <td className="mr-cell">{parseFloat(row.current_avg_prem).toLocaleString()}</td>
                    <td className="mr-cell">{row.current_avg_rate}</td>
                    <td className="mr-cell">{parseFloat(row.last_avg_prem).toLocaleString()}</td>
                    <td className="mr-cell">{row.last_avg_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mr-flex-1 mr-pie-wrap">
            <div className="mr-grid mr-gap">
              {/* PRD Mix YTD May 25 */}
              <div className="mr-pie-card">
                <div className="mr-header mr-bg-blue">PRD Mix ( GWP ) - YTD May 25</div>
                <PieChart width={260} height={220}>
                  <Pie
                    data={prdMix25}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={renderLabel}
                    labelLine={false}
                    isAnimationActive={true}
                    fill="#222"
                    strokeWidth={2}
                  >
                    {prdMix25.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
                <div className="mr-legend mr-legend-row">
                  <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#B3D267' }}></div><span>Preferred</span></div>
                  <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FFA500' }}></div><span>Referral</span></div>
                  <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF2222' }}></div><span>Declined</span></div>
                </div>
              </div>
              {/* PRD Mix YTD May 2024 */}
              <div className="mr-pie-card">
                <div className="mr-header mr-bg-blue">PRD Mix ( GWP ) - YTD May 2024</div>
                <PieChart width={260} height={220}>
                  <Pie
                    data={prdMix24}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={renderLabel}
                    labelLine={false}
                    isAnimationActive={true}
                    fill="#222"
                    strokeWidth={2}
                  >
                    {prdMix24.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
                <div className="mr-legend mr-legend-row">
                  <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#B3D267' }}></div><span>Preferred</span></div>
                  <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FFA500' }}></div><span>Referral</span></div>
                  <div className="mr-legend-item"><div className="mr-legend-color" style={{ background: '#FF2222' }}></div><span>Declined</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Segment wise Renewal Ratio */}
      <div className="mr-card">
        <div className="mr-header mr-bg-blue">Segment wise Renewal Ratio - YTD May 25</div>
        <div className="mr-table-scroll">
          <table className="mr-table">
            <thead>
              <tr className="mr-table-header-row">
                <th className="mr-table-header" rowSpan="2">Segment</th>
                <th className="mr-table-header" colSpan="3">Premium</th>
                <th className="mr-table-header" colSpan="3">Policy</th>
                <th className="mr-table-header" colSpan="3">Client</th>
              </tr>
              <tr className="mr-table-header-row">
                <th className="mr-table-header">For renewal</th>
                <th className="mr-table-header">Renewed</th>
                <th className="mr-table-header">Renewal Ratio</th>
                <th className="mr-table-header">For renewal</th>
                <th className="mr-table-header">Renewed</th>
                <th className="mr-table-header">Renewal Ratio</th>
                <th className="mr-table-header">For renewal</th>
                <th className="mr-table-header">Renewed</th>
                <th className="mr-table-header">Renewal Ratio</th>
              </tr>
            </thead>
            <tbody>
              {segRenewalData.map((row, index) => (
                <tr key={index} className="mr-row">
                  <td className="mr-cell mr-cell-left">{row.segment}</td>
                  <td className="mr-cell">{row.premium.forRenewal}</td>
                  <td className="mr-cell">{row.premium.renewed}</td>
                  <td className="mr-cell">{row.premium.ratio}</td>
                  <td className="mr-cell">{row.policy.forRenewal}</td>
                  <td className="mr-cell">{row.policy.renewed}</td>
                  <td className="mr-cell">{row.policy.ratio}</td>
                  <td className="mr-cell">{row.client.forRenewal}</td>
                  <td className="mr-cell">{row.client.renewed}</td>
                  <td className="mr-cell">{row.client.ratio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mr-grid mr-gap">
        {/* Marine policies issued with CPM cover - YTD May 25 */}
        <div className="mr-card">
          <div className="mr-header mr-bg-blue">Marine policies issued with CPM cover - YTD May 25</div>
          <div className="mr-table-scroll">
            <table className="mr-table mr-table-xs">
              <thead>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header">Branch Office</th>
                  <th className="mr-table-header">Marine NOP</th>
                  <th className="mr-table-header">Marine GWP</th>
                  <th className="mr-table-header">CPM NOP</th>
                  <th className="mr-table-header">CPM GWP</th>
                </tr>
              </thead>
              <tbody>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Nariman Point</td><td className="mr-cell">2</td><td className="mr-cell">585,000</td><td className="mr-cell">0</td><td className="mr-cell">0</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Durgapore</td><td className="mr-cell">78</td><td className="mr-cell">232,319</td><td className="mr-cell">167</td><td className="mr-cell">1,887,826</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Kolkata</td><td className="mr-cell">60</td><td className="mr-cell">193,228</td><td className="mr-cell">85</td><td className="mr-cell">-</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Chennai Head Office</td><td className="mr-cell">9</td><td className="mr-cell">157,159</td><td className="mr-cell">13</td><td className="mr-cell">-</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Guwahati</td><td className="mr-cell">9</td><td className="mr-cell">120,051</td><td className="mr-cell">11</td><td className="mr-cell">321,784</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Raipur</td><td className="mr-cell">26</td><td className="mr-cell">113,387</td><td className="mr-cell">38</td><td className="mr-cell">538,224</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Rourkela</td><td className="mr-cell">21</td><td className="mr-cell">82,516</td><td className="mr-cell">40</td><td className="mr-cell">466,025</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Siliguri</td><td className="mr-cell">27</td><td className="mr-cell">78,862</td><td className="mr-cell">47</td><td className="mr-cell">333,178</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Bhubaneshwar</td><td className="mr-cell">16</td><td className="mr-cell">73,308</td><td className="mr-cell">30</td><td className="mr-cell">418,830</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Pune</td><td className="mr-cell">5</td><td className="mr-cell">62,787</td><td className="mr-cell">7</td><td className="mr-cell">84,577</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Others</td><td className="mr-cell">125</td><td className="mr-cell">712,849</td><td className="mr-cell">441</td><td className="mr-cell">3,097,356</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Marine Cargo wise Premium Report - YTD May 25 */}
        <div className="mr-card">
          <div className="mr-header mr-bg-blue">Marine Cargo wise Premium Report - YTD May 25</div>
          <div className="mr-table-scroll">
            <table className="mr-table mr-table-xs">
              <thead>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header">Cargo</th>
                  <th className="mr-table-header">P/R/D</th>
                  <th className="mr-table-header" colSpan="4">YTD May 2025</th>
                </tr>
                <tr className="mr-table-header-row">
                  <th className="mr-table-header"></th>
                  <th className="mr-table-header"></th>
                  <th className="mr-table-header">NOP</th>
                  <th className="mr-table-header">GWP in Mn</th>
                  <th className="mr-table-header">GIC in Mn</th>
                  <th className="mr-table-header">GIC GEP</th>
                </tr>
              </thead>
              <tbody>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Automobiles</td><td className="mr-cell">Preferred</td><td className="mr-cell">145</td><td className="mr-cell">106.1</td><td className="mr-cell">28.6</td><td className="mr-cell">43%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Electronic Goods</td><td className="mr-cell">Referral</td><td className="mr-cell">157</td><td className="mr-cell">52.3</td><td className="mr-cell">-4.7</td><td className="mr-cell">-34%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Machinery/Tools</td><td className="mr-cell">Referral</td><td className="mr-cell">690</td><td className="mr-cell">36.3</td><td className="mr-cell">8.4</td><td className="mr-cell">40%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Air Conditioners And Chillers</td><td className="mr-cell">Referral</td><td className="mr-cell">102</td><td className="mr-cell">18.8</td><td className="mr-cell">4.8</td><td className={`mr-cell ${getGepColor('148%')}`}>148%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Chemicals Liquid Chemicals</td><td className="mr-cell">Referral</td><td className="mr-cell">116</td><td className="mr-cell">16.6</td><td className="mr-cell">2.6</td><td className="mr-cell">34%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Sanitaryware/Abrasives/Granites/Mayble</td><td className="mr-cell">Declined</td><td className="mr-cell">41</td><td className="mr-cell">14.8</td><td className="mr-cell">11.4</td><td className="mr-cell">77%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Electrical Goods/ Transformers</td><td className="mr-cell">Referral</td><td className="mr-cell">54</td><td className="mr-cell">13.3</td><td className="mr-cell">15.1</td><td className="mr-cell">-684%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Confectionary/Food & Beverages</td><td className="mr-cell">Referral</td><td className="mr-cell">13</td><td className="mr-cell">13.0</td><td className="mr-cell">6.3</td><td className={`mr-cell ${getGepColor('163%')}`}>163%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Cotton/Textiles/Garments/Yarn</td><td className="mr-cell">Preferred</td><td className="mr-cell">148</td><td className="mr-cell">7.6</td><td className="mr-cell">5.0</td><td className="mr-cell">39%</td></tr>
                <tr className="mr-row"><td className="mr-cell mr-cell-left">Metalware</td><td className="mr-cell">Preferred</td><td className="mr-cell">87</td><td className="mr-cell">7.2</td><td className="mr-cell">4.0</td><td className={`mr-cell ${getGepColor('127%')}`}>127%</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mr-footer-notes mr-footer-cargo">
            <div><strong>Air Conditioners And Chillers - DAIKIN AIRCONDITIONING INDIA PRIVATE LTD = 63.34L</strong> (Jerks and jolts without any accident to the carrying vehicle);</div>
            <div><strong>Confectionary/Food & Beverages - SLMG BEVERAGES PRIVATE LIMITED = 53.72L</strong> (Accident to Carrying Vehicle);</div>
            <div><strong>Metalware - QTALBROS PRIVATE LIMITED = 24.29 L</strong> (Jerks and jolts without any accident to the carrying vehicle);</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marine;
