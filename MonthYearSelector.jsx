import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { uploadExcelFile, uploadGCLFile, uploadMajClientFile, uploadProfesIndFile, uploadWCTop5File, uploadAvgPreRateFile, uploadsegRenewalRatioFile } from '../api/api';

/**
 * MonthYearSelector component - Provides month/year selection and file upload functionality
 * Handles Excel file uploads for various insurance data types with validation and template generation
 * @returns {JSX.Element} Month/year selector with upload buttons and modal
 */
const MonthYearSelector = () => {
  // State variables for component functionality
  const [selectedMonth, setSelectedMonth] = useState('January'); // Currently selected month for data filtering
  const [selectedYear, setSelectedYear] = useState('2025-26'); // Currently selected year range for data filtering
  const [showUploadModal, setShowUploadModal] = useState(false); // Boolean flag to show/hide upload modal
  const [selectedUploadType, setSelectedUploadType] = useState(''); // Type of file being uploaded (Product, CGL, etc.)
  const [uploadErrors, setUploadErrors] = useState([]); // Array of validation errors to display (limited to 5)
  const [allErrors, setAllErrors] = useState([]); // Complete array of all validation errors
  const [uploadedFile, setUploadedFile] = useState(null); // Currently uploaded file object for error processing
  
  // File input references for different upload types (unused in current implementation)
  const productFileRef = useRef(null); // Reference for product file input
  const segmentFileRef = useRef(null); // Reference for segment file input
  const wcOccupancyFileRef = useRef(null); // Reference for WC occupancy file input
  const majorClientsFileRef = useRef(null); // Reference for major clients file input
  const cglOccupancyFileRef = useRef(null); // Reference for CGL occupancy file input
  const piOccupancyFileRef = useRef(null); // Reference for PI occupancy file input
  const segmentGwpMixFileRef = useRef(null); // Reference for segment GWP mix file input
  const segmentAvgPremiumFileRef = useRef(null); // Reference for segment average premium file input
  const segmentRenewalRatioFileRef = useRef(null); // Reference for segment renewal ratio file input
  const marineCpmFileRef = useRef(null); // Reference for marine CPM file input
  const marineCargoFileRef = useRef(null); // Reference for marine cargo file input
  const portfolioGwpMixFileRef = useRef(null); // Reference for portfolio GWP mix file input
  const cpmSegmentChannelFileRef = useRef(null); // Reference for CPM segment channel file input
  const iblCpmTop15FileRef = useRef(null); // Reference for IBL CPM top 15 file input
  const mbdEeiSegmentFileRef = useRef(null); // Reference for MBD EEI segment file input
  const iblCpmEquipmentFileRef = useRef(null); // Reference for IBL CPM equipment file input
  const earProjectFileRef = useRef(null); // Reference for EAR project file input
  const carProjectFileRef = useRef(null); // Reference for CAR project file input
  
  // Fire section file input references
  const prdMixExposureFileRef = useRef(null); // Reference for PRD mix exposure file input
  const prdMixGwpFileRef = useRef(null); // Reference for PRD mix GWP file input
  const stateExposureFileRef = useRef(null); // Reference for state exposure file input
  const avgRateBgrFileRef = useRef(null); // Reference for average rate BGR file input
  const avgRateNonBgrFileRef = useRef(null); // Reference for average rate non-BGR file input
  const productPremiumClaimsFileRef = useRef(null); // Reference for product premium claims file input
  const sfspLacPremiumFileRef = useRef(null); // Reference for SFSP lac premium file input
  const segmentPolicyPremiumFileRef = useRef(null); // Reference for segment policy premium file input
  const segmentNopNocFileRef = useRef(null); // Reference for segment NOP NOC file input
  const claimTicketSizeFileRef = useRef(null); // Reference for claim ticket size file input
  const top10OccupanciesFileRef = useRef(null); // Reference for top 10 occupancies file input
  const bancaTop10FileRef = useRef(null); // Reference for banca top 10 file input
  const bancaPartnerChannelFileRef = useRef(null); // Reference for banca partner channel file input
  const bancaPsuPartnerFileRef = useRef(null); // Reference for banca PSU partner file input
  const bancaPsuDwellingFileRef = useRef(null); // Reference for banca PSU dwelling file input
  const bancaPartnerDwellingFileRef = useRef(null); // Reference for banca partner dwelling file input
  const psuBankNopFileRef = useRef(null); // Reference for PSU bank NOP file input
  const psuBankGwpFileRef = useRef(null); // Reference for PSU bank GWP file input
  const occupancyGwpPsuFileRef = useRef(null); // Reference for occupancy GWP PSU file input
  const psuSiBandFileRef = useRef(null); // Reference for PSU SI band file input
  const psuRiskRegionFileRef = useRef(null); // Reference for PSU risk region file input
  
  // OverAllReview section file input references
  const lobNopGwpGicFileRef = useRef(null); // Reference for LOB NOP GWP GIC file input
  const brokerGwpReportFileRef = useRef(null); // Reference for broker GWP report file input
  const lobSegmentReportFileRef = useRef(null); // Reference for LOB segment report file input
  const lobGrowthPercentFileRef = useRef(null); // Reference for LOB growth percent file input
  const lastFiveYearFileRef = useRef(null); // Reference for last five year file input
  const fireBancaUnderInsuranceFileRef = useRef(null); // Reference for fire banca under insurance file input
  const cordysTatReportFileRef = useRef(null); // Reference for Cordys TAT report file input
  const inwardFacFileRef = useRef(null); // Reference for inward fac file input
  const newBusinessSourcedFileRef = useRef(null); // Reference for new business sourced file input
  const newInitiativesFileRef = useRef(null); // Reference for new initiatives file input
  const newBusinessSourced2FileRef = useRef(null); // Reference for new business sourced 2 file input
  const largeRiskUnderwrittenFileRef = useRef(null); // Reference for large risk underwritten file input

  /**
   * Handles click on upload button to open upload modal
   * @param {string} type - Type of file to upload (e.g., 'Product', 'CGL Occupancy')
   * @returns {void} No return value, updates component state
   */
  const handleFileClick = (type) => {
    setSelectedUploadType(type); // Set the type of file being uploaded
    setShowUploadModal(true); // Show the upload modal
    setUploadErrors([]); // Clear previous upload errors
    setAllErrors([]); // Clear all previous errors
    setUploadedFile(null); // Clear previously uploaded file
  };

  /**
   * Downloads Excel file with error annotations for debugging validation issues
   * @returns {Promise<void>} No return value, triggers file download
   */
  const downloadErrorsExcel = async () => {
    if (!uploadedFile) return; // Exit if no file uploaded
    
    try {
      // Read original Excel file data
      const originalData = await readExcelFile(uploadedFile);
      const wb = XLSX.utils.book_new(); // Create new workbook
      
      // Add Error column to existing headers
      const headers = [...originalData[0], 'Error'];
      const dataWithErrors = [headers];
      
      // Process each data row and add error information
      for (let i = 1; i < originalData.length; i++) {
        const row = [...originalData[i]];
        // Ensure row has same length as original headers
        while (row.length < originalData[0].length) {
          row.push(''); // Fill missing cells with empty strings
        }
        // Get validation error for this row
        const rowError = getRowError(originalData, i);
        row.push(rowError || ''); // Add error message or empty string
        dataWithErrors.push(row);
      }
      
      // Create worksheet from data array
      const ws = XLSX.utils.aoa_to_sheet(dataWithErrors);
      
      // Set column widths for better readability
      const colWidths = originalData[0].map(() => ({ wch: 15 })); // Standard width for data columns
      colWidths.push({ wch: 50 }); // Wider column for error messages
      ws['!cols'] = colWidths;
      
      // Add worksheet to workbook and download
      XLSX.utils.book_append_sheet(wb, ws, 'Data with Errors');
      XLSX.writeFile(wb, `${selectedUploadType}_with_Errors_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Error creating file with errors:', error);
    }
  };

  /**
   * Gets validation error message for a specific row in uploaded data
   * Currently only validates CGL Occupancy file format
   * @param {Array} data - Complete Excel data as 2D array
   * @param {number} rowIndex - Index of row to validate (0-based)
   * @returns {string} Error message string or empty string if no errors
   */
  const getRowError = (data, rowIndex) => {
    if (selectedUploadType !== 'CGL Occupancy') return ''; // Only validate CGL Occupancy files
    
    const headers = data[0]; // First row contains column headers
    const row = data[rowIndex]; // Current row data
    
    // Find column indices for required fields
    const industryIndex = headers.indexOf('Industry Description');
    const premIndex = headers.indexOf('Prem');
    const netPolIndex = headers.indexOf('Net Pol');
    
    // Extract cell values
    const industry = row[industryIndex];
    const prem = row[premIndex];
    const netPol = row[netPolIndex];
    
    const errors = []; // Array to collect validation errors
    
    // If Industry Description exists, Prem and Net Pol are required
    if (industry && industry.toString().trim()) {
      if (!prem || prem.toString().trim() === '') {
        errors.push('Prem is missing');
      }
      if (!netPol || netPol.toString().trim() === '') {
        errors.push('Net Pol is missing');
      }
    }
    
    // Cannot have Prem or Net Pol without Industry Description
    if ((!industry || industry.toString().trim() === '') && 
        ((prem && prem.toString().trim()) || (netPol && netPol.toString().trim()))) {
      errors.push('Cannot have Prem or Net Pol without Industry Description');
    }
    
    return errors.join('; '); // Join multiple errors with semicolon
  };

  /**
   * Handles template download based on selected upload type
   * Creates and downloads appropriate Excel template for data entry
   * @returns {void} No return value, triggers template creation or shows alert
   */
  const handleTemplateDownload = () => {
    // Route to appropriate template creation function based on upload type
    if (selectedUploadType === 'Product') {
      createLOBProductTemplate();
    } else if (selectedUploadType === 'CGL Occupancy') {
      createCGLOccupancyTemplate();
    } else if (selectedUploadType === 'Major Clients') {
      createMajorClientsTemplate();
    } else if (selectedUploadType === 'PI Occupancy') {
      createPIOccupancyTemplate();
    } else if (selectedUploadType === 'Segment Avg Premium') {
      createSegmentAvgPremiumTemplate();
    } else if(selectedUploadType === 'Segment Renewal Ratio'){
      createSegmentRenewalRatioTemplate();
    } else {
      // Handle other template types with generic mapping
      const templates = {
        'WC Occupancy': 'wc_occupancy_template.xlsx'
      };
      
      const templateName = templates[selectedUploadType] || 'template.xlsx';
      alert(`Downloading template: ${templateName}`); // Show alert for unimplemented templates
    }
  };

  /**
   * Creates and downloads Excel template for CGL Occupancy data entry
   * @returns {void} No return value, triggers Excel file download
   */
  const createCGLOccupancyTemplate = () => {
    const wb = XLSX.utils.book_new(); // Create new workbook
    
    // Define header row with required columns
    const headerData = [
      ['Industry Description', 'Prem', 'Net Pol', 'Issued Pol', 'Cancellations']
    ];
    
    // Create worksheet from header data
    const ws = XLSX.utils.aoa_to_sheet(headerData);
    
    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 50 }, // Industry Description - wider for long text
      { wch: 15 }, // Prem - premium amount
      { wch: 12 }, // Net Pol - net policies
      { wch: 12 }, // Issued Pol - issued policies
      { wch: 15 }  // Cancellations - cancellation amount
    ];
    
    // Add worksheet to workbook and download
    XLSX.utils.book_append_sheet(wb, ws, 'CGL Occupancy');
    XLSX.writeFile(wb, `CGL_Occupancy_Template_${selectedMonth}_${selectedYear.split('-')[0]}.xlsx`);
  };

  /**
   * Creates and downloads Excel template for Major Clients data entry
   * @returns {void} No return value, triggers Excel file download
   */
  const createMajorClientsTemplate = () => {
    const wb = XLSX.utils.book_new(); // Create new workbook
    
    // Define header row with required columns for major clients
    const headerData = [
      ['Product', 'GC client', 'Client', 'Prem', 'Net Pol', 'Issued Pol', 'Cancellations']
    ];
    
    // Create worksheet from header data
    const ws = XLSX.utils.aoa_to_sheet(headerData);
    
    // Set column widths optimized for major clients data
    ws['!cols'] = [
      { wch: 25 }, // Product - product name
      { wch: 20 }, // GC client - general client category
      { wch: 30 }, // Client - specific client name (wider for company names)
      { wch: 15 }, // Prem - premium amount
      { wch: 12 }, // Net Pol - net policies
      { wch: 12 }, // Issued Pol - issued policies
      { wch: 15 }  // Cancellations - cancellation amount
    ];
    
    // Add worksheet to workbook and download
    XLSX.utils.book_append_sheet(wb, ws, 'Major Clients');
    XLSX.writeFile(wb, `Major_Clients_Template_${selectedMonth}_${selectedYear.split('-')[0]}.xlsx`);
  };

  /**
   * Creates and downloads Excel template for PI (Professional Indemnity) Occupancy data entry
   * @returns {void} No return value, triggers Excel file download
   */
  const createPIOccupancyTemplate = () => {
    const wb = XLSX.utils.book_new(); // Create new workbook
    
    // Define header row with required columns for PI occupancy
    const headerData = [
      ['Client', 'Industry Description', 'Prem', 'Net Pol', 'Issued Pol', 'Cancellations']
    ];
    
    // Create worksheet from header data
    const ws = XLSX.utils.aoa_to_sheet(headerData);
    
    // Set column widths optimized for PI occupancy data
    ws['!cols'] = [
      { wch: 30 }, // Client - client name (wider for company names)
      { wch: 50 }, // Industry Description - detailed industry info (widest column)
      { wch: 15 }, // Prem - premium amount
      { wch: 12 }, // Net Pol - net policies
      { wch: 12 }, // Issued Pol - issued policies
      { wch: 15 }  // Cancellations - cancellation amount
    ];
    
    // Add worksheet to workbook and download
    XLSX.utils.book_append_sheet(wb, ws, 'PI Occupancy');
    XLSX.writeFile(wb, `PI_Occupancy_Template_${selectedMonth}_${selectedYear.split('-')[0]}.xlsx`);
  };

  /**
   * Creates and downloads Excel template for Segment Average Premium data entry
   * @returns {void} No return value, triggers Excel file download
   */
  const createSegmentAvgPremiumTemplate = () => {
    const wb = XLSX.utils.book_new(); // Create new workbook
    
    // Define header row with required columns for segment average premium
    const headerData = [
      ['UW Sub Channel', 'Time', 'Prem', 'Issued risk SI', 'Net Pol']
    ];
    
    // Create worksheet from header data
    const ws = XLSX.utils.aoa_to_sheet(headerData);
    
    // Set column widths optimized for segment average premium data
    ws['!cols'] = [
      { wch: 20 }, // UW Sub Channel - underwriting sub-channel name
      { wch: 15 }, // Time - time period
      { wch: 15 }, // Prem - premium amount
      { wch: 18 }, // Issued risk SI - sum insured for issued risks (wider for large numbers)
      { wch: 12 }  // Net Pol - net policies count
    ];
    
    // Add worksheet to workbook and download
    XLSX.utils.book_append_sheet(wb, ws, 'Segment Avg Premium');
    XLSX.writeFile(wb, `Segment_Avg_Premium_Template_${selectedMonth}_${selectedYear.split('-')[0]}.xlsx`);
  };

  /**
   * Creates and downloads Excel template for Segment Renewal Ratio data entry
   * Template includes merged headers for premium and policy data across two years
   * @returns {void} No return value, triggers Excel file download
   */
  const createSegmentRenewalRatioTemplate = () => {
    const wb = XLSX.utils.book_new(); // Create new workbook
    
    // Define header structure with merged cells for premium and policy columns
    const headerData = [
      ['', '', 'Prem', 'Prem', 'Net Pol', 'Net Pol'], // First row with merged headers
      ['Client', 'UW Sub Channel', 'April, 2024-25 - May, 2024-25', 'April, 2025-26 - May, 2025-26', 'April, 2024-25 - May, 2024-25', 'April, 2025-26 - May, 2025-26'] // Second row with specific period headers
    ];
    
    // Create worksheet from header data
    const ws = XLSX.utils.aoa_to_sheet(headerData);
    
    // Set column widths optimized for renewal ratio data
    ws['!cols'] = [
      { wch: 30 }, // Client - client name (wider for company names)
      { wch: 20 }, // UW Sub Channel - underwriting sub-channel
      { wch: 25 }, // April, 2024-25 - May, 2024-25 (Prem) - previous year premium
      { wch: 25 }, // April, 2025-26 - May, 2025-26 (Prem) - current year premium
      { wch: 25 }, // April, 2024-25 - May, 2024-25 (Net Pol) - previous year policies
      { wch: 25 }  // April, 2025-26 - May, 2025-26 (Net Pol) - current year policies
    ];
    
    // Define merged cell ranges for grouped headers
    ws['!merges'] = [
      { s: { c: 2, r: 0 }, e: { c: 3, r: 0 } }, // Merge 'Prem' header across columns 2-3
      { s: { c: 4, r: 0 }, e: { c: 5, r: 0 } }  // Merge 'Net Pol' header across columns 4-5
    ];
    
    // Add worksheet to workbook and download
    XLSX.utils.book_append_sheet(wb, ws, 'Segment Renewal Ratio');
    XLSX.writeFile(wb, `Segment_Renewal_Ratio_Template_${selectedMonth}_${selectedYear.split('-')[0]}.xlsx`);
  };

  /**
   * Creates and downloads Excel template for LOB (Line of Business) Product-wise data entry
   * Complex template with merged headers for multiple time periods and metrics
   * @returns {void} No return value, triggers Excel file download
   */
  const createLOBProductTemplate = () => {
    const wb = XLSX.utils.book_new(); // Create new workbook
    
    // Extract year components for template generation
    const currentMonth = selectedMonth;
    const currentYear = selectedYear.split('-')[0]; // Get first year from range
    const nextYear = (parseInt(currentYear) + 1).toString().slice(-2); // Last 2 digits of next year
    
    // Calculate previous year values for comparison columns
    const prevYear = (parseInt(currentYear) - 1).toString();
    const prevNextYear = currentYear.slice(-2); // Last 2 digits of current year
    
    const headerData = [
      // Row 1: Period headers spanning multiple columns
      ['', '', `${currentMonth}, ${currentYear}/${nextYear}`, `${currentMonth}, ${currentYear}/${nextYear}`, `${currentMonth}, ${currentYear}/${nextYear}`, `${currentMonth}, ${currentYear}/${nextYear}`, `${currentMonth}, ${currentYear}/${nextYear}`, `${currentMonth}, ${prevYear}/${prevNextYear}`, `${currentMonth}, ${prevYear}/${prevNextYear}`, `${currentMonth}, ${prevYear}/${prevNextYear}`, `${currentMonth}, ${prevYear}/${prevNextYear}`, `${currentMonth}, ${prevYear}/${prevNextYear}`, `April, ${currentYear}-${parseInt(currentYear)+1} - ${currentMonth}, ${currentYear}-${nextYear}`, `April, ${currentYear}-${parseInt(currentYear)+1} - ${currentMonth}, ${currentYear}-${nextYear}`, `April, ${currentYear}-${parseInt(currentYear)+1} - ${currentMonth}, ${currentYear}-${nextYear}`, `April, ${currentYear}-${parseInt(currentYear)+1} - ${currentMonth}, ${currentYear}-${nextYear}`, `April, ${currentYear}-${parseInt(currentYear)+1} - ${currentMonth}, ${currentYear}-${nextYear}`, `April, ${prevYear}-${currentYear} - ${currentMonth}, ${prevYear}-${prevNextYear}`, `April, ${prevYear}-${currentYear} - ${currentMonth}, ${prevYear}-${prevNextYear}`, `April, ${prevYear}-${currentYear} - ${currentMonth}, ${prevYear}-${prevNextYear}`, `April, ${prevYear}-${currentYear} - ${currentMonth}, ${prevYear}-${prevNextYear}`, `April, ${prevYear}-${currentYear} - ${currentMonth}, ${prevYear}-${prevNextYear}`],
      // Row 2: Detailed column headers for each metric
      ['LOB (2) - Drill down of LOB (1)', 'Product', 'Prem', 'Net Pol', 'Accounting LR', 'Earned Prem', 'Claim incurred in period', 'Prem', 'Net Pol', 'Accounting LR', 'Earned Prem', 'Claim incurred in period', 'Prem', 'Net Pol', 'Accounting LR', 'Earned Prem', 'Claim incurred in period', 'Prem', 'Net Pol', 'Accounting LR', 'Earned Prem', 'Claim incurred in period']
    ];
    
    // Create worksheet from header data
    const ws = XLSX.utils.aoa_to_sheet(headerData);
    
    // Set column widths for all 22 columns (standard width for data columns)
    ws['!cols'] = Array(22).fill({ wch: 12 });
    ws['!cols'][0] = { wch: 35 }; // LOB column - wider for business line names
    ws['!cols'][1] = { wch: 40 }; // Product column - wider for product names
    
    // Define merged cell ranges for period headers
    ws['!merges'] = [
      { s: { r: 0, c: 2 }, e: { r: 0, c: 6 } },   // Current year monthly data (columns 2-6)
      { s: { r: 0, c: 7 }, e: { r: 0, c: 11 } },  // Previous year monthly data (columns 7-11)
      { s: { r: 0, c: 12 }, e: { r: 0, c: 16 } }, // Current year YTD data (columns 12-16)
      { s: { r: 0, c: 17 }, e: { r: 0, c: 21 } }  // Previous year YTD data (columns 17-21)
    ];
    
    // Add worksheet to workbook and download
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `LOB_Product_Wise_Template_${currentMonth}_${currentYear}.xlsx`);
  };

  /**
   * Validates uploaded Excel file for format, size, and content requirements
   * @param {File} file - Uploaded file object to validate
   * @returns {Promise<Array>} Array of validation error messages
   */
  const validateFile = async (file) => {
    const errors = []; // Array to collect validation errors
    
    // Check file extension
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      errors.push('File must be an Excel file (.xlsx or .xls)');
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size must be less than 10MB');
    }
    
    // Validate Excel content based on upload type
    if (selectedUploadType === 'CGL Occupancy') {
      try {
        const data = await readExcelFile(file);
        const contentErrors = validateCGLContent(data);
        errors.push(...contentErrors); // Spread content errors into main errors array
      } catch (error) {
        errors.push('Error reading Excel file: ' + error.message);
      }
    } else if (selectedUploadType === 'Major Clients') {
      try {
        const data = await readExcelFile(file);
        const contentErrors = validateMajorClientsContent(data);
        errors.push(...contentErrors);
      } catch (error) {
        errors.push('Error reading Excel file: ' + error.message);
      }
    } else if (selectedUploadType === 'PI Occupancy') {
      try {
        const data = await readExcelFile(file);
        const contentErrors = validatePIOccupancyContent(data);
        errors.push(...contentErrors);
      } catch (error) {
        errors.push('Error reading Excel file: ' + error.message);
      }
    } else if (selectedUploadType === 'Segment Avg Premium') {
      try {
        const data = await readExcelFile(file);
        const contentErrors = validateSegmentAvgPremiumContent(data);
        errors.push(...contentErrors);
      } catch (error) {
        errors.push('Error reading Excel file: ' + error.message);
      }
    } else if (selectedUploadType === 'Segment Renewal Ratio') {
      try {
        const data = await readExcelFile(file);
        const contentErrors = validateSegmentRenewalRatioContent(data);
        errors.push(...contentErrors);
      } catch (error) {
        errors.push('Error reading Excel file: ' + error.message);
      }
    }
    
    return errors; // Return all collected validation errors
  };

  /**
   * Reads Excel file and converts it to 2D array format
   * @param {File} file - Excel file to read
   * @returns {Promise<Array>} Promise resolving to 2D array of Excel data
   */
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); // Create file reader instance
      
      // Handle successful file read
      reader.onload = (e) => {
        try {
          // Convert file data to Uint8Array for XLSX processing
          const data = new Uint8Array(e.target.result);
          // Parse Excel workbook from array buffer
          const workbook = XLSX.read(data, { type: 'array' });
          // Get first worksheet name
          const sheetName = workbook.SheetNames[0];
          // Get worksheet object
          const worksheet = workbook.Sheets[sheetName];
          // Convert worksheet to JSON array format (2D array)
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData); // Return parsed data
        } catch (error) {
          reject(error); // Handle parsing errors
        }
      };
      
      // Handle file read errors
      reader.onerror = reject;
      // Start reading file as array buffer
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Validates CGL Occupancy Excel file content for required columns and data integrity
   * @param {Array} data - 2D array of Excel data (rows and columns)
   * @returns {Array} Array of validation error messages
   */
  const validateCGLContent = (data) => {
    const errors = []; // Array to collect validation errors
    
    // Check minimum data requirement
    if (data.length < 2) {
      errors.push('File must have at least header row and one data row');
      return errors;
    }
    
    const headers = data[0]; // First row contains column headers
    const requiredColumns = ['Industry Description', 'Prem', 'Net Pol']; // Mandatory columns
    
    // Check if all required columns are present
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      return errors; // Return early if columns are missing
    }
    
    // Get column indices for validation
    const industryIndex = headers.indexOf('Industry Description');
    const premIndex = headers.indexOf('Prem');
    const netPolIndex = headers.indexOf('Net Pol');
    
    // Validate each data row
    for (let i = 1; i < data.length; i++) {
      const row = data[i]; // Current row data
      const industry = row[industryIndex];
      const prem = row[premIndex];
      const netPol = row[netPolIndex];
      
      // Business rule: If Industry Description exists, Prem and Net Pol are required
      if (industry && industry.toString().trim()) {
        if (prem === null || prem === undefined || prem.toString().trim() === '') {
          errors.push(`Row ${i + 1}: Industry Description exists but Prem is missing`);
        }
        if (netPol === null || netPol === undefined || netPol.toString().trim() === '') {
          errors.push(`Row ${i + 1}: Industry Description exists but Net Pol is missing`);
        }
      }
      
      // Business rule: Cannot have Prem or Net Pol without Industry Description
      if ((industry === null || industry === undefined || industry.toString().trim() === '') && 
          ((prem && prem.toString().trim()) || (netPol && netPol.toString().trim()))) {
        errors.push(`Row ${i + 1}: Cannot have Prem or Net Pol values without Industry Description`);
      }
    }
    
    return errors; // Return all validation errors
  };

  const validateMajorClientsContent = (data) => {
    const errors = [];
    
    if (data.length < 2) {
      errors.push('File must have at least header row and one data row');
      return errors;
    }
    
    const headers = data[0];
    const requiredColumns = ['Product', 'GC client', 'Client'];
    
    // Check if required columns exist
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      return errors;
    }
    
    // Get column indices
    const productIndex = headers.indexOf('Product');
    const gcClientIndex = headers.indexOf('GC client');
    const clientIndex = headers.indexOf('Client');
    
    // Validate data rows
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const product = row[productIndex];
      const gcClient = row[gcClientIndex];
      const client = row[clientIndex];
      
      // If Product has value, GC client and Client must also have values
      if (product && product.toString().trim()) {
        if (gcClient === null || gcClient === undefined || gcClient.toString().trim() === '') {
          errors.push(`Row ${i + 1}: Product exists but GC client is missing`);
        }
        if (client === null || client === undefined) {
          errors.push(`Row ${i + 1}: Product exists but Client is missing`);
        }
      }
      
      // If Product is empty but GC client or Client have values
      if ((product === null || product === undefined) && 
          ((gcClient && gcClient.toString().trim()) || (client && client.toString().trim()))) {
        errors.push(`Row ${i + 1}: Cannot have GC client or Client values without Product`);
      }
    }
    
    return errors;
  };

  const validateSegmentRenewalRatioContent = (data) => {
    const errors = [];
    
    if (data.length < 3) {
      errors.push('File must have at least header rows and one data row');
      return errors;
    }
    
    // Check the second row for actual column headers (first row has merged headers)
    const headers = data[1];
    const requiredColumns = ['Client', 'UW Sub Channel'];
    
    // Check if required columns exist
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      return errors;
    }
    
    // Get column indices
    const clientIndex = headers.indexOf('Client');
    const uwSubChannelIndex = headers.indexOf('UW Sub Channel');
    
    // Validate data rows - both Client and UW Sub Channel are mandatory
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      const client = row[clientIndex];
      const uwSubChannel = row[uwSubChannelIndex];
      
      // Skip validation if both Client and UW Sub Channel are empty (optional row)
      if ((!client || client.toString().trim() === '') && 
          (!uwSubChannel || uwSubChannel.toString().trim() === '')) {
        continue;
      }
      
      // If either field has data, both should be present
      if (!client || client.toString().trim() === '') {
        errors.push(`Row ${i + 1}: Client is required when UW Sub Channel is provided`);
      }
      if (!uwSubChannel || uwSubChannel.toString().trim() === '') {
        errors.push(`Row ${i + 1}: UW Sub Channel is required when Client is provided`);
      }
    }
    
    return errors;
  };

  const validateSegmentAvgPremiumContent = (data) => {
    const errors = [];
    
    if (data.length < 2) {
      errors.push('File must have at least header row and one data row');
      return errors;
    }
    
    const headers = data[0];
    const requiredColumns = ['UW Sub Channel', 'Time', 'Prem', 'Issued risk SI', 'Net Pol'];
    
    // Check if required columns exist
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      return errors;
    }
    
    // Get column indices
    const uwSubChannelIndex = headers.indexOf('UW Sub Channel');
    const timeIndex = headers.indexOf('Time');
    const premIndex = headers.indexOf('Prem');
    const issuedRiskSIIndex = headers.indexOf('Issued risk SI');
    const netPolIndex = headers.indexOf('Net Pol');
    
    // Validate data rows - if UW Sub Channel is empty, skip validation for that row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const uwSubChannel = row[uwSubChannelIndex];
      
      // Skip validation if UW Sub Channel is empty
      if (uwSubChannel === null || uwSubChannel === undefined || uwSubChannel.toString().trim() === '') {
        continue;
      }
      
      const time = row[timeIndex];
      const prem = row[premIndex];
      const issuedRiskSI = row[issuedRiskSIIndex];
      const netPol = row[netPolIndex];
      
      // If UW Sub Channel has value, all other fields are mandatory
      if (time === null || time === undefined || time.toString().trim() === '') {
        errors.push(`Row ${i + 1}: UW Sub Channel exists but Time is missing`);
      }
      if (prem === null || prem === undefined || prem.toString().trim() === '') {
        errors.push(`Row ${i + 1}: UW Sub Channel exists but Prem is missing`);
      }
      if (issuedRiskSI === null || issuedRiskSI === undefined || issuedRiskSI.toString().trim() === '') {
        errors.push(`Row ${i + 1}: UW Sub Channel exists but Issued risk SI is missing`);
      }
      if (netPol === null || netPol === undefined || netPol.toString().trim() === '') {
        errors.push(`Row ${i + 1}: UW Sub Channel exists but Net Pol is missing`);
      }
    }
    
    return errors;
  };

  const validatePIOccupancyContent = (data) => {
    const errors = [];
    
    if (data.length < 2) {
      errors.push('File must have at least header row and one data row');
      return errors;
    }
    
    const headers = data[0];
    const requiredColumns = ['Client', 'Industry Description', 'Prem', 'Net Pol'];
    
    // Check if required columns exist
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      return errors;
    }
    
    // Get column indices
    const clientIndex = headers.indexOf('Client');
    const industryIndex = headers.indexOf('Industry Description');
    const premIndex = headers.indexOf('Prem');
    const netPolIndex = headers.indexOf('Net Pol');
    
    // Validate data rows
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const client = row[clientIndex];
      const industry = row[industryIndex];
      const prem = row[premIndex];
      const netPol = row[netPolIndex];
      
      // If Client has value, all mandatory fields must have values
      if (client && client.toString().trim()) {
        if (industry === null || industry === undefined || industry.toString().trim() === '') {
          errors.push(`Row ${i + 1}: Client exists but Industry Description is missing`);
        }
        if (prem === null || prem === undefined || prem.toString().trim() === '') {
          errors.push(`Row ${i + 1}: Client exists but Prem is missing`);
        }
        if (netPol === null || netPol === undefined || netPol.toString().trim() === '') {
          errors.push(`Row ${i + 1}: Client exists but Net Pol is missing`);
        }
      }
      
      // If Client is empty but other mandatory fields have values
      if ((!client || client.toString().trim() === '') && 
          ((industry && industry.toString().trim()) || (prem && prem.toString().trim()) || (netPol && netPol.toString().trim()))) {
        errors.push(`Row ${i + 1}: Cannot have Industry Description, Prem, or Net Pol values without Client`);
      }
    }
    
    return errors;
  };

  /**
   * Handles file upload process including validation and API submission
   * @param {Event} e - File input change event
   * @returns {Promise<void>} No return value, handles upload process
   */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; // Get selected file
    if (file) {
      setUploadedFile(file); // Store file for error processing
      
      // Validate file before upload
      const errors = await validateFile(file);
      if (errors.length > 0) {
        setAllErrors(errors); // Store all errors for download
        setUploadErrors(errors.slice(0, 5)); // Show only first 5 errors in UI
        return; // Stop upload process if validation fails
      }
      
      try {
        // Route to appropriate upload API based on file type
        if (selectedUploadType === 'Product') {
          await uploadExcelFile(file, selectedMonth, selectedYear);
        } else if (selectedUploadType === 'CGL Occupancy') {
          await uploadGCLFile(file, selectedMonth, selectedYear);
        } else if (selectedUploadType === 'Major Clients') {
          await uploadMajClientFile(file, selectedMonth, selectedYear);
        } else if (selectedUploadType === 'PI Occupancy') {
          await uploadProfesIndFile(file, selectedMonth, selectedYear);
        } else if (selectedUploadType === 'WC Occupancy') {
          await uploadWCTop5File(file, selectedMonth, selectedYear);
        } else if(selectedUploadType === 'Segment Avg Premium') {
          await uploadAvgPreRateFile(file, selectedMonth, selectedYear);
        } else if(selectedUploadType === 'Segment Renewal Ratio'){
          await uploadsegRenewalRatioFile(file, selectedMonth, selectedYear)
        } else {
          // Default to generic Excel upload for unspecified types
          await uploadExcelFile(file, selectedMonth, selectedYear);
        }
        
        // Show success message and close modal
        alert(`${selectedUploadType} file uploaded successfully!`);
        setShowUploadModal(false);
      } catch (error) {
        // Handle upload errors
        setUploadErrors([error.message || 'Upload failed']);
      }
    }
  };

  // Array of month names for dropdown selection
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Month and Year Selectors */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: '0.5rem', fontSize: '14px', fontWeight: '500' }}>Month:</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ marginRight: '0.5rem', fontSize: '14px', fontWeight: '500' }}>Year:</label>
          <input 
            type="text" 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', width: '80px' }}
          />
        </div>
      </div>

      {/* Upload Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* General Upload Buttons */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="file" ref={productFileRef} onChange={(e) => handleFileChange(e, 'Product')} style={{ display: 'none' }} accept=".xls,.xlsx" />
          <input type="file" ref={segmentFileRef} onChange={(e) => handleFileChange(e, 'Segment')} style={{ display: 'none' }} accept=".xls,.xlsx" />
          
          <button onClick={() => handleFileClick('Product')} className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-4 rounded">
            LOB Product Wise
          </button>
          
          <button onClick={() => handleFileClick('Segment')} className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-1 px-4 rounded">
            LOB Segment Wise
          </button>
        </div>

        {/* Liability Section */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Liability</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" ref={wcOccupancyFileRef} onChange={(e) => handleFileChange(e, 'WC Occupancy')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={majorClientsFileRef} onChange={(e) => handleFileChange(e, 'Major Clients')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={cglOccupancyFileRef} onChange={(e) => handleFileChange(e, 'CGL Occupancy')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={piOccupancyFileRef} onChange={(e) => handleFileChange(e, 'PI Occupancy')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            
            <button onClick={() => handleFileClick('WC Occupancy')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-4 rounded">
              WC - Top 5 Occupancy
            </button>
            
            <button onClick={() => handleFileClick('Major Clients')} className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-1 px-4 rounded">
              Major Clients
            </button>
            
            <button onClick={() => handleFileClick('CGL Occupancy')} className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-4 rounded">
              CGL - Top 5 Occupancy
            </button>
            
            <button onClick={() => handleFileClick('PI Occupancy')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-4 rounded">
              PI - Top 5 Occupancy
            </button>
          </div>
        </div>

        {/* Marine Section */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Marine</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" ref={segmentGwpMixFileRef} onChange={(e) => handleFileChange(e, 'Segment GWP Mix')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={segmentAvgPremiumFileRef} onChange={(e) => handleFileChange(e, 'Segment Avg Premium')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={segmentRenewalRatioFileRef} onChange={(e) => handleFileChange(e, 'Segment Renewal Ratio')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={marineCpmFileRef} onChange={(e) => handleFileChange(e, 'Marine CPM')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={marineCargoFileRef} onChange={(e) => handleFileChange(e, 'Marine Cargo')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            
            <button onClick={() => handleFileClick('Segment GWP Mix')} className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-1 px-4 rounded">
              Segment wise GWP Mix
            </button>
            
            <button onClick={() => handleFileClick('Segment Avg Premium')} className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-1 px-4 rounded">
              Segment wise Average Premium & Rate
            </button>
            
            <button onClick={() => handleFileClick('Segment Renewal Ratio')} className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-1 px-4 rounded">
              Segment wise Renewal Ratio
            </button>
            
            <button onClick={() => handleFileClick('Marine CPM')} className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-4 rounded">
              Marine policies issued with CPM cover
            </button>
            
            <button onClick={() => handleFileClick('Marine Cargo')} className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-1 px-4 rounded">
              Marine Cargo wise Premium Report
            </button>
          </div>
        </div>

        {/* Engineering Section */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Engineering</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" ref={portfolioGwpMixFileRef} onChange={(e) => handleFileChange(e, 'Portfolio GWP Mix')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={cpmSegmentChannelFileRef} onChange={(e) => handleFileChange(e, 'CPM Segment Channel')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={iblCpmTop15FileRef} onChange={(e) => handleFileChange(e, 'IBL CPM Top 15')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={mbdEeiSegmentFileRef} onChange={(e) => handleFileChange(e, 'MBD EEI Segment')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={iblCpmEquipmentFileRef} onChange={(e) => handleFileChange(e, 'IBL CPM Equipment')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={earProjectFileRef} onChange={(e) => handleFileChange(e, 'EAR Project')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={carProjectFileRef} onChange={(e) => handleFileChange(e, 'CAR Project')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            
            <button onClick={() => handleFileClick('Portfolio GWP Mix')} className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-1 px-4 rounded">
              Portfolio - GWP Mix
            </button>
            
            <button onClick={() => handleFileClick('CPM Segment Channel')} className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-1 px-4 rounded">
              CPM - Segment & Channel wise Premium contribution
            </button>
            
            <button onClick={() => handleFileClick('IBL CPM Top 15')} className="bg-lime-600 hover:bg-lime-700 text-white font-medium py-1 px-4 rounded">
              IBL _ CPM - Top 15 Risk location wise Premium & Claims Report
            </button>
            
            <button onClick={() => handleFileClick('MBD EEI Segment')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1 px-4 rounded">
              MBD & EEI - Segment wise Report
            </button>
            
            <button onClick={() => handleFileClick('IBL CPM Equipment')} className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-4 rounded">
              IBL - CPM Equipment wise Report
            </button>
            
            <button onClick={() => handleFileClick('EAR Project')} className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-1 px-4 rounded">
              EAR - Project wise Report
            </button>
            
            <button onClick={() => handleFileClick('CAR Project')} className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-1 px-4 rounded">
              CAR - Project wise Report
            </button>
          </div>
        </div>

        {/* Fire Section */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Fire</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Hidden file inputs */}
            <input type="file" ref={prdMixExposureFileRef} onChange={(e) => handleFileChange(e, 'PRD Mix Exposure')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={prdMixGwpFileRef} onChange={(e) => handleFileChange(e, 'PRD Mix GWP')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={stateExposureFileRef} onChange={(e) => handleFileChange(e, 'State Exposure')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={avgRateBgrFileRef} onChange={(e) => handleFileChange(e, 'Avg Rate BGR')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={avgRateNonBgrFileRef} onChange={(e) => handleFileChange(e, 'Avg Rate Non-BGR')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={productPremiumClaimsFileRef} onChange={(e) => handleFileChange(e, 'Product Premium Claims')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={sfspLacPremiumFileRef} onChange={(e) => handleFileChange(e, 'SFSP Lac Premium')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={segmentPolicyPremiumFileRef} onChange={(e) => handleFileChange(e, 'Segment Policy Premium')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={segmentNopNocFileRef} onChange={(e) => handleFileChange(e, 'Segment NOP NOC')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={claimTicketSizeFileRef} onChange={(e) => handleFileChange(e, 'Claim Ticket Size')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={top10OccupanciesFileRef} onChange={(e) => handleFileChange(e, 'Top 10 Occupancies')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={bancaTop10FileRef} onChange={(e) => handleFileChange(e, 'Banca Top 10')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={bancaPartnerChannelFileRef} onChange={(e) => handleFileChange(e, 'Banca Partner Channel')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={bancaPsuPartnerFileRef} onChange={(e) => handleFileChange(e, 'Banca PSU Partner')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={bancaPsuDwellingFileRef} onChange={(e) => handleFileChange(e, 'Banca PSU Dwelling')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={bancaPartnerDwellingFileRef} onChange={(e) => handleFileChange(e, 'Banca Partner Dwelling')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={psuBankNopFileRef} onChange={(e) => handleFileChange(e, 'PSU Bank NOP')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={psuBankGwpFileRef} onChange={(e) => handleFileChange(e, 'PSU Bank GWP')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={occupancyGwpPsuFileRef} onChange={(e) => handleFileChange(e, 'Occupancy GWP PSU')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={psuSiBandFileRef} onChange={(e) => handleFileChange(e, 'PSU SI Band')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={psuRiskRegionFileRef} onChange={(e) => handleFileChange(e, 'PSU Risk Region')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            
            {/* Fire buttons with compact styling */}
            <button onClick={() => handleFileClick('PRD Mix Exposure')} className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded">PRD Mix Exposure wise</button>
            <button onClick={() => handleFileClick('PRD Mix GWP')} className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded">PRD Mix on GWP</button>
            <button onClick={() => handleFileClick('State Exposure')} className="bg-orange-600 hover:bg-orange-700 text-white text-xs py-1 px-2 rounded">State wise Exposure</button>
            <button onClick={() => handleFileClick('Avg Rate BGR')} className="bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 px-2 rounded">Average Rate Analysis BGR</button>
            <button onClick={() => handleFileClick('Avg Rate Non-BGR')} className="bg-amber-600 hover:bg-amber-700 text-white text-xs py-1 px-2 rounded">Average Rate Analysis Non-BGR</button>
            <button onClick={() => handleFileClick('Product Premium Claims')} className="bg-amber-500 hover:bg-amber-600 text-white text-xs py-1 px-2 rounded">Product wise Premium & Claims Report -Fire</button>
            <button onClick={() => handleFileClick('SFSP Lac Premium')} className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 px-2 rounded">SFSP, Sookshama & Laghu - Per lac Premium & Claim</button>
            <button onClick={() => handleFileClick('Segment Policy Premium')} className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 px-2 rounded">FIRE-Segment wise Per policy Premium</button>
            <button onClick={() => handleFileClick('Segment NOP NOC')} className="bg-lime-600 hover:bg-lime-700 text-white text-xs py-1 px-2 rounded">FIRE-Segment wise NOP & NOC</button>
            <button onClick={() => handleFileClick('Claim Ticket Size')} className="bg-lime-500 hover:bg-lime-600 text-white text-xs py-1 px-2 rounded">Fire-Per Claim ticket size- comparison</button>
            <button onClick={() => handleFileClick('Top 10 Occupancies')} className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded">Top 10 Occupancies ( in terms of GWP)- FIRE</button>
            <button onClick={() => handleFileClick('Banca Top 10')} className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded">Banca - Top 10 Occupancies</button>
            <button onClick={() => handleFileClick('Banca Partner Channel')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 px-2 rounded">Banca (Partner Others) - Channel wise Report</button>
            <button onClick={() => handleFileClick('Banca PSU Partner')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-1 px-2 rounded">Banca PSU Partner Report</button>
            <button onClick={() => handleFileClick('Banca PSU Dwelling')} className="bg-teal-600 hover:bg-teal-700 text-white text-xs py-1 px-2 rounded">Fire- Banca PSU - Dwelling Annual and Long Term</button>
            <button onClick={() => handleFileClick('Banca Partner Dwelling')} className="bg-teal-500 hover:bg-teal-600 text-white text-xs py-1 px-2 rounded">Fire Banca- Partner Others - Dwelling Annual and Long Term</button>
            <button onClick={() => handleFileClick('PSU Bank NOP')} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs py-1 px-2 rounded">FIRE - PSU Bank wise NOP</button>
            <button onClick={() => handleFileClick('PSU Bank GWP')} className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs py-1 px-2 rounded">FIRE - PSU Bank wise GWP</button>
            <button onClick={() => handleFileClick('Occupancy GWP PSU')} className="bg-sky-600 hover:bg-sky-700 text-white text-xs py-1 px-2 rounded">FIRE - Occupancy wise GWP (PSU Banks)</button>
            <button onClick={() => handleFileClick('PSU SI Band')} className="bg-sky-500 hover:bg-sky-600 text-white text-xs py-1 px-2 rounded">PSU Banks - SI Band wise Report</button>
            <button onClick={() => handleFileClick('PSU Risk Region')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded">PSU Banks - Risk location Region wise Report</button>
          </div>
        </div>

        {/* OverAllReview Section */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>OverAllReview</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Hidden file inputs */}
            <input type="file" ref={lobNopGwpGicFileRef} onChange={(e) => handleFileChange(e, 'LOB NOP GWP GIC')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={brokerGwpReportFileRef} onChange={(e) => handleFileChange(e, 'Broker GWP Report')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={lobSegmentReportFileRef} onChange={(e) => handleFileChange(e, 'LOB Segment Report')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={lobGrowthPercentFileRef} onChange={(e) => handleFileChange(e, 'LOB Growth Percent')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={lastFiveYearFileRef} onChange={(e) => handleFileChange(e, 'Last Five Year')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={fireBancaUnderInsuranceFileRef} onChange={(e) => handleFileChange(e, 'Fire Banca UnderInsurance')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={cordysTatReportFileRef} onChange={(e) => handleFileChange(e, 'Cordys TAT Report')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={inwardFacFileRef} onChange={(e) => handleFileChange(e, 'Inward Fac')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={newBusinessSourcedFileRef} onChange={(e) => handleFileChange(e, 'New Business Sourced')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={newInitiativesFileRef} onChange={(e) => handleFileChange(e, 'New Initiatives')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={newBusinessSourced2FileRef} onChange={(e) => handleFileChange(e, 'New Business Sourced 2')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            <input type="file" ref={largeRiskUnderwrittenFileRef} onChange={(e) => handleFileChange(e, 'Large Risk Underwritten')} style={{ display: 'none' }} accept=".xls,.xlsx" />
            
            {/* OverAllReview buttons with compact styling */}
            <button onClick={() => handleFileClick('LOB NOP GWP GIC')} className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded">LOB wise NOP GWP GIC:GEP</button>
            <button onClick={() => handleFileClick('Broker GWP Report')} className="bg-purple-500 hover:bg-purple-600 text-white text-xs py-1 px-2 rounded">Broker wise GWP Report</button>
            <button onClick={() => handleFileClick('LOB Segment Report')} className="bg-violet-600 hover:bg-violet-700 text-white text-xs py-1 px-2 rounded">LOB & Segment wise Report</button>
            <button onClick={() => handleFileClick('LOB Growth Percent')} className="bg-violet-500 hover:bg-violet-600 text-white text-xs py-1 px-2 rounded">LOB wise Growth % ( GWP )</button>
            <button onClick={() => handleFileClick('Last Five Year')} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs py-1 px-2 rounded">Last Five year comparison</button>
            <button onClick={() => handleFileClick('Fire Banca UnderInsurance')} className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white text-xs py-1 px-2 rounded">FIRE - Banca Channel wise UnderInsurance Report</button>
            <button onClick={() => handleFileClick('Cordys TAT Report')} className="bg-pink-600 hover:bg-pink-700 text-white text-xs py-1 px-2 rounded">Cordys TAT Report</button>
            <button onClick={() => handleFileClick('Inward Fac')} className="bg-pink-500 hover:bg-pink-600 text-white text-xs py-1 px-2 rounded">Inward Fac</button>
            <button onClick={() => handleFileClick('New Business Sourced')} className="bg-rose-600 hover:bg-rose-700 text-white text-xs py-1 px-2 rounded">New Business Sourced (&gt;5 lakhs)</button>
            <button onClick={() => handleFileClick('New Initiatives')} className="bg-rose-500 hover:bg-rose-600 text-white text-xs py-1 px-2 rounded">New Initiatives</button>
            <button onClick={() => handleFileClick('New Business Sourced 2')} className="bg-red-400 hover:bg-red-500 text-white text-xs py-1 px-2 rounded">New Business Sourced (&gt;5 lakhs)</button>
            <button onClick={() => handleFileClick('Large Risk Underwritten')} className="bg-red-300 hover:bg-red-400 text-white text-xs py-1 px-2 rounded">Large risk underwritten - More than 2500 Cr</button>
          </div>
        </div>
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '18px', fontWeight: '600' }}>
              Upload {selectedUploadType} File
            </h3>
            
            {uploadErrors.length > 0 && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                {uploadErrors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
                {allErrors.length > 5 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '14px' }}>
                    <div>... and {allErrors.length - 5} more errors</div>
                    <button
                      onClick={downloadErrorsExcel}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginTop: '0.25rem'
                      }}
                    >
                      Download File with Errors
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <button
                onClick={handleTemplateDownload}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Download Template
              </button>
              
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".xls,.xlsx"
                style={{ flex: 1, marginLeft: '1rem' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthYearSelector; 
