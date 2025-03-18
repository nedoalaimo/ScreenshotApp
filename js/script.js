// Global variables
let screenshots = [];
let isCapturing = false;
let currentScreenshot = null;
let captureMode = 'fullscreen'; // Default capture mode: fullscreen, window, tab
let currentVideoElement = null;
let currentMediaStream = null;
let sequentialMode = false;
let sequenceCounter = 1;
let sequenceName = '';
let currentMetadata = {};
let activeTemplate = null;
let appMode = 'general'; // Default app mode: general or validation

// Default templates for general mode
const defaultGeneralTemplates = {
  'login': {
    name: 'Login Validation',
    category: 'Testing',
    project: 'Web Application',
    tags: 'login,auth,ui'
  },
  'data-entry': {
    name: 'Data Entry Validation',
    category: 'Testing',
    project: 'Web Application',
    tags: 'forms,validation,data'
  },
  'report': {
    name: 'Report Generation',
    category: 'Documentation',
    project: 'Web Application',
    tags: 'reports,export,charts'
  }
};

// Default templates for validation mode
const defaultValidationTemplates = {
  'login-validation': {
    name: 'Login Validation',
    environment: 'QA',
    software: 'System v1.0',
    testId: 'TC001',
    protocol: 'SOP-QA-001'
  },
  'data-entry-validation': {
    name: 'Data Entry Validation',
    environment: 'QA',
    software: 'Data Entry Module v2.0',
    testId: 'TC045',
    protocol: 'SOP-QA-002'
  },
  'report-validation': {
    name: 'Report Generation Validation',
    environment: 'QA',
    software: 'Reporting Module v3.1',
    testId: 'TC098',
    protocol: 'SOP-QA-003'
  }
};

// Load templates from localStorage or use defaults
let savedGeneralTemplates = JSON.parse(localStorage.getItem('screenshotGeneralTemplates')) || defaultGeneralTemplates;
let savedValidationTemplates = JSON.parse(localStorage.getItem('screenshotValidationTemplates')) || defaultValidationTemplates;
let savedTemplates = savedGeneralTemplates; // Default to general templates

// Annotation variables
let isAnnotating = false;
let annotationCanvas = null;
let annotationCtx = null;
let currentTool = 'draw';
let currentColor = '#ff0000';
let currentWidth = 5;
let isDrawing = false;
let startX = 0;
let startY = 0;
let originalImage = null;

// Crop elements
let cropToggle;
let cropModal;
let cropCanvas;
let cropOverlay;
let cropCancelBtn;
let cropApplyBtn;

// Crop state variables
let isCropping = false;
let cropCtx = null;
let cropStartX = 0;
let cropStartY = 0;
let isCreatingCrop = false;
let isDraggingCrop = false;
let isResizingCrop = false;
let cropBox = { x: 0, y: 0, width: 0, height: 0 };

// DOM Elements
let captureContainer;
let fullscreenBtn;
let windowBtn;
let tabBtn;
let regionBtn;
let captureBtn;
let exportBtn;
let exportWordBtn;
let exportOptions;
let statusMessage;
let screenshotList;
let nameModal;
let screenshotNameInput;
let modalSaveBtn;
let modalCancelBtn;
let modalPreview;
let screenshotsContainer;

// Region selection elements
let regionModal;
let regionPreview;
let regionOverlay;
let regionSize;
let regionCancelBtn;
let regionCaptureBtn;

// Tab elements
let tabButtons;
let tabPanes;

// General metadata elements
let metaCategory;
let metaAuthor;
let metaProject;
let metaTags;
let metaTimestamp;

// Validation metadata elements
let metaEnvironment;
let metaTester;
let metaSoftware;
let metaTestId;
let metaProtocol;
let metaTimestampValidation;

// App mode selector
let appModeSelector;

// Template elements
let templateList;
let saveTemplateBtn;
let templateNameInput;

// Annotation elements
let annotationToggle;
let annotationModal;
let annotationTools;
let colorOptions;
let widthOptions;
let annotationDoneBtn;
let annotationCancelBtn;
let annotationClearBtn;
let textInputContainer;
let textInput;
let addTextBtn;

// Sequence elements
let sequenceToggle;
let sequenceControls;
let sequenceNameInput;
let sequenceCounterEl;

// Check browser compatibility
const checkBrowserCompatibility = () => {
  // Check if browser supports screen capture
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    alert('Your browser does not support screen capture. Please use a modern browser like Chrome, Edge, or Firefox.');
    return false;
  }
  return true;
};

// Load template list from savedTemplates
function loadTemplateList() {
  // Clear the current template list
  templateList.innerHTML = '';
  
  // Add each template to the list
  Object.keys(savedTemplates).forEach(templateId => {
    const template = savedTemplates[templateId];
    const listItem = document.createElement('li');
    const button = document.createElement('button');
    button.setAttribute('data-template', templateId);
    button.textContent = template.name;
    listItem.appendChild(button);
    templateList.appendChild(listItem);
  });
}

// Initialize the app when the window has loaded
document.addEventListener('DOMContentLoaded', () => {
  if (!checkBrowserCompatibility()) return;
  
  initializeElements();
  setupEventListeners();
  loadTemplateList();
});

// Initialize DOM elements
function initializeElements() {
  captureContainer = document.getElementById('capture-container');
  fullscreenBtn = document.getElementById('fullscreen-btn');
  windowBtn = document.getElementById('window-btn');
  tabBtn = document.getElementById('tab-btn');
  regionBtn = document.getElementById('region-btn');
  captureBtn = document.getElementById('capture-btn');
  exportBtn = document.getElementById('export-btn');
  exportWordBtn = document.getElementById('export-word-btn');
  exportOptions = document.getElementById('export-options');
  statusMessage = document.getElementById('status-message');
  screenshotList = document.getElementById('screenshot-list');
  nameModal = document.getElementById('name-modal');
  screenshotNameInput = document.getElementById('screenshot-name');
  modalSaveBtn = document.getElementById('modal-save');
  modalCancelBtn = document.getElementById('modal-cancel');
  modalPreview = document.getElementById('modal-preview');
  screenshotsContainer = document.getElementById('screenshots-container');
  
  // Tab elements
  tabButtons = document.querySelectorAll('.tab-button');
  tabPanes = document.querySelectorAll('.tab-pane');
  
  // General metadata elements
  metaCategory = document.getElementById('meta-category');
  metaAuthor = document.getElementById('meta-author');
  metaProject = document.getElementById('meta-project');
  metaTags = document.getElementById('meta-tags');
  metaTimestamp = document.getElementById('meta-timestamp');
  
  // Validation metadata elements
  metaEnvironment = document.getElementById('meta-environment');
  metaTester = document.getElementById('meta-tester');
  metaSoftware = document.getElementById('meta-software');
  metaTestId = document.getElementById('meta-test-id');
  metaProtocol = document.getElementById('meta-protocol');
  metaTimestampValidation = document.getElementById('meta-timestamp-validation');
  
  // App mode selector
  appModeSelector = document.getElementById('app-mode');
  
  // Template elements
  templateList = document.getElementById('template-list');
  saveTemplateBtn = document.getElementById('save-template');
  templateNameInput = document.getElementById('template-name');
  
  // Annotation elements
  annotationToggle = document.getElementById('annotation-toggle');
  annotationModal = document.getElementById('annotation-modal');
  annotationTools = document.querySelectorAll('.annotation-tool');
  colorOptions = document.querySelectorAll('.color-option');
  widthOptions = document.querySelectorAll('.width-option');
  annotationDoneBtn = document.getElementById('annotation-done');
  annotationCancelBtn = document.getElementById('annotation-cancel');
  annotationClearBtn = document.getElementById('annotation-clear');
  annotationCanvas = document.getElementById('annotation-canvas');
  textInputContainer = document.getElementById('text-input-container');
  textInput = document.getElementById('annotation-text-input');
  addTextBtn = document.getElementById('add-text-btn');
  
  // Crop elements
  cropToggle = document.getElementById('crop-toggle');
  cropModal = document.getElementById('crop-modal');
  cropCanvas = document.getElementById('crop-canvas');
  cropOverlay = document.getElementById('crop-overlay');
  cropCancelBtn = document.getElementById('crop-cancel');
  cropApplyBtn = document.getElementById('crop-apply');
  
  // Region selection elements
  regionModal = document.getElementById('region-modal');
  regionPreview = document.getElementById('region-preview');
  regionOverlay = document.getElementById('region-overlay');
  regionSize = document.getElementById('region-size');
  regionCancelBtn = document.getElementById('region-cancel');
  regionCaptureBtn = document.getElementById('region-capture');
  
  // Sequence elements
  sequenceToggle = document.getElementById('sequence-toggle');
  sequenceControls = document.getElementById('sequence-controls');
  sequenceNameInput = document.getElementById('sequence-name');
  sequenceCounterEl = document.getElementById('sequence-counter');
}

// Set up event listeners
function setupEventListeners() {
  // Capture type selection
  fullscreenBtn.addEventListener('click', () => selectCaptureMode('fullscreen'));
  windowBtn.addEventListener('click', () => selectCaptureMode('window'));
  tabBtn.addEventListener('click', () => selectCaptureMode('tab'));
  regionBtn.addEventListener('click', () => selectCaptureMode('region'));
  
  // Capture button
  captureBtn.addEventListener('click', captureScreenshot);
  
  // Region selection events
  regionCancelBtn.addEventListener('click', cancelRegionSelection);
  regionCaptureBtn.addEventListener('click', captureSelectedRegion);
  
  // Export buttons
  exportBtn.addEventListener('click', exportScreenshots);
  exportWordBtn.addEventListener('click', exportToWord);
  
  // Modal buttons
  modalSaveBtn.addEventListener('click', saveScreenshot);
  modalCancelBtn.addEventListener('click', cancelScreenshot);
  
  // Handle Enter key in the name input
  screenshotNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveScreenshot();
    }
  });
  
  // Tab navigation
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      openTab(tabName);
    });
  });
  
  // Template handling
  templateList.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const templateId = e.target.getAttribute('data-template');
      applyTemplate(templateId);
    }
  });
  
  saveTemplateBtn.addEventListener('click', saveTemplate);
  
  // Annotation events
  annotationToggle.addEventListener('click', openAnnotationModal);
  annotationDoneBtn.addEventListener('click', saveAnnotation);
  annotationCancelBtn.addEventListener('click', cancelAnnotation);
  annotationClearBtn.addEventListener('click', clearAnnotation);
  
  // Crop events
  cropToggle.addEventListener('click', openCropModal);
  cropCancelBtn.addEventListener('click', cancelCrop);
  cropApplyBtn.addEventListener('click', applyCrop);
  
  // Annotation tools
  annotationTools.forEach(tool => {
    tool.addEventListener('click', () => {
      setActiveTool(tool.getAttribute('data-tool'));
    });
  });
  
  // Color selection
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      setActiveColor(option.getAttribute('data-color'));
    });
  });
  
  // Line width selection
  widthOptions.forEach(option => {
    option.addEventListener('click', () => {
      setActiveWidth(option.getAttribute('data-width'));
    });
  });
  
  // Canvas drawing events
  if (annotationCanvas) {
    annotationCanvas.addEventListener('mousedown', startDrawing);
    annotationCanvas.addEventListener('mousemove', draw);
    annotationCanvas.addEventListener('mouseup', stopDrawing);
    annotationCanvas.addEventListener('mouseout', stopDrawing);
  }
  
  // Text addition
  addTextBtn.addEventListener('click', addTextToCanvas);
  
  // Sequential capture
  sequenceToggle.addEventListener('change', toggleSequentialMode);
  sequenceNameInput.addEventListener('input', updateSequenceName);
  
  // App mode
  appModeSelector.addEventListener('change', switchAppMode);
}

// Switch app mode between general and validation
function switchAppMode() {
  appMode = appModeSelector.value;
  
  // Update UI based on mode
  if (appMode === 'general') {
    document.getElementById('general-metadata').style.display = 'block';
    document.getElementById('validation-metadata').style.display = 'none';
    savedTemplates = savedGeneralTemplates;
  } else {
    document.getElementById('general-metadata').style.display = 'none';
    document.getElementById('validation-metadata').style.display = 'block';
    savedTemplates = savedValidationTemplates;
  }
  
  // Reload template list
  loadTemplateList();
  
  // Show status
  showStatus(`Switched to ${appMode === 'general' ? 'General Purpose' : 'GMP Validation'} mode`, 'success');
}

// Toggle sequential mode
function toggleSequentialMode() {
  sequentialMode = sequenceToggle.checked;
  sequenceControls.style.display = sequentialMode ? 'block' : 'none';
  
  if (sequentialMode && !sequenceName) {
    const date = new Date();
    const defaultName = `Test_Sequence_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    sequenceNameInput.value = defaultName;
    sequenceName = defaultName;
  }
}

// Update sequence name
function updateSequenceName() {
  sequenceName = sequenceNameInput.value.trim();
}

// Open a specific tab
function openTab(tabName) {
  // Hide all tabs
  tabPanes.forEach(pane => {
    pane.classList.remove('active');
  });
  
  tabButtons.forEach(button => {
    button.classList.remove('active');
  });
  
  // Show the selected tab
  document.getElementById(`${tabName}-tab`).classList.add('active');
  document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');
}

// Apply a template
function applyTemplate(templateId) {
  if (savedTemplates[templateId]) {
    const template = savedTemplates[templateId];
    
    // Apply the template values to the form based on app mode
    screenshotNameInput.value = template.name || '';
    
    if (appMode === 'general') {
      metaCategory.value = template.category || 'General';
      metaProject.value = template.project || '';
      metaTags.value = template.tags || '';
    } else {
      metaEnvironment.value = template.environment || 'QA';
      metaSoftware.value = template.software || '';
      metaTestId.value = template.testId || '';
      metaProtocol.value = template.protocol || '';
    }
    
    activeTemplate = templateId;
    showStatus(`Applied template: ${template.name}`, 'success');
    
    // Switch back to details tab
    openTab('details');
  }
}

// Save the current settings as a template
function saveTemplate() {
  const name = templateNameInput.value.trim();
  
  if (!name) {
    showStatus('Please enter a template name', 'error');
    return;
  }
  
  // Create a template ID from the name (lowercase, no spaces)
  const templateId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  if (appMode === 'general') {
    // Save general template
    savedTemplates[templateId] = {
      name: name,
      category: metaCategory.value,
      project: metaProject.value,
      tags: metaTags.value
    };
    
    // Save to localStorage
    localStorage.setItem('screenshotGeneralTemplates', JSON.stringify(savedGeneralTemplates));
  } else {
    // Save validation template
    savedTemplates[templateId] = {
      name: name,
      environment: metaEnvironment.value,
      software: metaSoftware.value,
      testId: metaTestId.value,
      protocol: metaProtocol.value
    };
    
    // Save to localStorage
    localStorage.setItem('screenshotValidationTemplates', JSON.stringify(savedValidationTemplates));
  }
  
  // Add to the template list
  const listItem = document.createElement('li');
  const button = document.createElement('button');
  button.setAttribute('data-template', templateId);
  button.textContent = name;
  listItem.appendChild(button);
  templateList.appendChild(listItem);
  
  // Clear the input
  templateNameInput.value = '';
  
  showStatus('Template saved', 'success');
}

// Open the annotation modal
function openAnnotationModal() {
  isAnnotating = true;
  annotationModal.style.display = 'flex';
  
  // Set up the canvas
  const img = new Image();
  img.src = modalPreview.src;
  originalImage = modalPreview.src;
  
  img.onload = function() {
    // Cache the image object for better performance during shape drawing
    originalImageObj = img;
    
    // Set canvas dimensions to match the image exactly
    annotationCanvas.width = img.width;
    annotationCanvas.height = img.height;
    
    // Get the context and draw the image
    annotationCtx = annotationCanvas.getContext('2d', { willReadFrequently: true });
    annotationCtx.drawImage(img, 0, 0, annotationCanvas.width, annotationCanvas.height);
    
    // Initialize the current image data to preserve annotations
    currentImageData = annotationCtx.getImageData(0, 0, annotationCanvas.width, annotationCanvas.height);
    
    // Initialize drawing settings
    setActiveTool(currentTool);
    setActiveColor(currentColor);
    setActiveWidth(currentWidth);
  };
}

// Set the active drawing tool
function setActiveTool(tool) {
  currentTool = tool;
  
  // Update UI
  annotationTools.forEach(t => {
    t.classList.remove('active');
  });
  
  document.querySelector(`.annotation-tool[data-tool="${tool}"]`).classList.add('active');
}

// Set the active color
function setActiveColor(color) {
  currentColor = color;
  
  // Update UI
  colorOptions.forEach(option => {
    option.classList.remove('active');
  });
  
  document.querySelector(`.color-option[data-color="${color}"]`).classList.add('active');
  
  if (annotationCtx) {
    annotationCtx.strokeStyle = color;
    annotationCtx.fillStyle = color;
  }
}

// Set the active line width
function setActiveWidth(width) {
  currentWidth = parseInt(width);
  
  // Update UI
  widthOptions.forEach(option => {
    option.classList.remove('active');
  });
  
  document.querySelector(`.width-option[data-width="${width}"]`).classList.add('active');
  
  if (annotationCtx) {
    annotationCtx.lineWidth = currentWidth;
  }
}

// Start drawing
function startDrawing(e) {
  isDrawing = true;
  
  // Save the current state of the canvas with all annotations
  if (annotationCanvas) {
    currentImageData = annotationCtx.getImageData(0, 0, annotationCanvas.width, annotationCanvas.height);
  }
  
  // Get exact canvas coordinates relative to the viewport
  const rect = annotationCanvas.getBoundingClientRect();
  const scaleX = annotationCanvas.width / rect.width;    // Relationship bitmap vs. element for X
  const scaleY = annotationCanvas.height / rect.height;  // Relationship bitmap vs. element for Y
  
  startX = (e.clientX - rect.left) * scaleX;   // Scale mouse coordinates to canvas coordinates
  startY = (e.clientY - rect.top) * scaleY;
  
  // For text tool, show input field at click position
  if (currentTool === 'text') {
    textInputContainer.style.display = 'flex';
    
    // Store the exact position within the canvas where text should be added
    textInputContainer.dataset.canvasX = startX;
    textInputContainer.dataset.canvasY = startY;
    
    // Position the input box near the cursor but not directly under it
    textInputContainer.style.left = (e.clientX + 5) + 'px';
    textInputContainer.style.top = (e.clientY + 5) + 'px';
    textInput.focus();
    isDrawing = false;
    return;
  }
  
  // Begin path for freehand drawing
  if (currentTool === 'draw') {
    annotationCtx.beginPath();
    annotationCtx.moveTo(startX, startY);
  }
}

// For shape preview
let originalImageObj = null;  // Cached original image 
let currentImageData = null;  // Current state of the canvas with all annotations

// Draw as the mouse moves
function draw(e) {
  if (!isDrawing) return;
  
  // Get exact canvas coordinates relative to the viewport
  const rect = annotationCanvas.getBoundingClientRect();
  const scaleX = annotationCanvas.width / rect.width;    // Relationship bitmap vs. element for X
  const scaleY = annotationCanvas.height / rect.height;  // Relationship bitmap vs. element for Y
  
  const x = (e.clientX - rect.left) * scaleX;   // Scale mouse coordinates to canvas coordinates
  const y = (e.clientY - rect.top) * scaleY;
  
  if (currentTool === 'draw') {
    // Freehand drawing
    annotationCtx.lineTo(x, y);
    annotationCtx.stroke();
  } else {
    // For other tools, create a live preview while dragging
    if (currentImageData) {
      // Restore the canvas with all previous annotations
      annotationCtx.putImageData(currentImageData, 0, 0);
      
      // Now draw the current shape based on start and current positions
      switch(currentTool) {
        case 'arrow':
          drawArrow(startX, startY, x, y);
          break;
        case 'rectangle':
          drawRectangle(startX, startY, x, y);
          break;
        case 'circle':
          drawCircle(startX, startY, x, y);
          break;
      }
    }
  }
}

// Stop drawing
function stopDrawing(e) {
  if (!isDrawing) return;
  
  // Get exact canvas coordinates relative to the viewport
  const rect = annotationCanvas.getBoundingClientRect();
  const scaleX = annotationCanvas.width / rect.width;    // Relationship bitmap vs. element for X
  const scaleY = annotationCanvas.height / rect.height;  // Relationship bitmap vs. element for Y
  
  const x = (e.clientX - rect.left) * scaleX;   // Scale mouse coordinates to canvas coordinates
  const y = (e.clientY - rect.top) * scaleY;
  
  // For the final shape, draw one more time to ensure it's correctly placed
  if (currentTool !== 'draw') {
    // Final drawing with correct coordinates
    switch(currentTool) {
      case 'arrow':
        // Restore last state and draw final arrow
        if (currentImageData) {
          annotationCtx.putImageData(currentImageData, 0, 0);
          drawArrow(startX, startY, x, y);
        }
        break;
      case 'rectangle':
        // Restore last state and draw final rectangle
        if (currentImageData) {
          annotationCtx.putImageData(currentImageData, 0, 0);
          drawRectangle(startX, startY, x, y);
        }
        break;
      case 'circle':
        // Restore last state and draw final circle
        if (currentImageData) {
          annotationCtx.putImageData(currentImageData, 0, 0);
          drawCircle(startX, startY, x, y);
        }
        break;
    }
  }
  
  // After finishing, update the current image data to include this annotation
  currentImageData = annotationCtx.getImageData(0, 0, annotationCanvas.width, annotationCanvas.height);
  
  isDrawing = false;
}

// Draw an arrow
function drawArrow(fromX, fromY, toX, toY) {
  const headLength = 15; // length of arrow head in pixels
  const angle = Math.atan2(toY - fromY, toX - fromX);
  
  // Draw the line
  annotationCtx.beginPath();
  annotationCtx.moveTo(fromX, fromY);
  annotationCtx.lineTo(toX, toY);
  annotationCtx.stroke();
  
  // Draw the arrow head
  annotationCtx.beginPath();
  annotationCtx.moveTo(toX, toY);
  annotationCtx.lineTo(toX - headLength * Math.cos(angle - Math.PI/6), toY - headLength * Math.sin(angle - Math.PI/6));
  annotationCtx.lineTo(toX - headLength * Math.cos(angle + Math.PI/6), toY - headLength * Math.sin(angle + Math.PI/6));
  annotationCtx.lineTo(toX, toY);
  annotationCtx.fill();
}

// Draw a rectangle
function drawRectangle(startX, startY, endX, endY) {
  const width = endX - startX;
  const height = endY - startY;
  
  annotationCtx.beginPath();
  annotationCtx.rect(startX, startY, width, height);
  annotationCtx.stroke();
}

// Draw a circle
function drawCircle(startX, startY, endX, endY) {
  const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  
  annotationCtx.beginPath();
  annotationCtx.arc(startX, startY, radius, 0, 2 * Math.PI);
  annotationCtx.stroke();
}

// Add text to canvas
function addTextToCanvas() {
  const text = textInput.value.trim();
  
  if (text && annotationCtx) {
    // Use the stored canvas coordinates for exact placement
    const x = parseInt(textInputContainer.dataset.canvasX) || 0;
    const y = parseInt(textInputContainer.dataset.canvasY) || 0;
    
    // Set text properties
    annotationCtx.font = '16px Arial';
    annotationCtx.fillStyle = currentColor;
    annotationCtx.fillText(text, x, y);
    
    // Save the canvas state after adding text
    currentImageData = annotationCtx.getImageData(0, 0, annotationCanvas.width, annotationCanvas.height);
    
    // Clear and hide the input
    textInput.value = '';
    textInputContainer.style.display = 'none';
  }
}

// Save the annotation
function saveAnnotation() {
  if (annotationCanvas) {
    // Get the annotated image
    const annotatedImage = annotationCanvas.toDataURL('image/png');
    
    // Update the preview
    modalPreview.src = annotatedImage;
    
    // Close the modal
    annotationModal.style.display = 'none';
    isAnnotating = false;
    
    showStatus('Annotation saved', 'success');
  }
}

// Cancel the annotation
function cancelAnnotation() {
  // Restore the original image
  if (originalImage) {
    modalPreview.src = originalImage;
  }
  
  annotationModal.style.display = 'none';
  isAnnotating = false;
}

// Clear all annotations
function clearAnnotation() {
  if (annotationCanvas && originalImage) {
    const img = new Image();
    img.src = originalImage;
    
    img.onload = function() {
      annotationCtx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
      annotationCtx.drawImage(img, 0, 0, annotationCanvas.width, annotationCanvas.height);
      
      // Reset the currentImageData to the original image
      currentImageData = annotationCtx.getImageData(0, 0, annotationCanvas.width, annotationCanvas.height);
    };
  }
}

// Open the crop modal
function openCropModal() {
  isCropping = true;
  cropModal.style.display = 'flex';
  
  // Set up the canvas
  const img = new Image();
  img.src = modalPreview.src;
  
  img.onload = function() {
    // Set canvas dimensions
    cropCanvas.width = img.width;
    cropCanvas.height = img.height;
    
    // Get the context and draw the image
    cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
    cropCtx.drawImage(img, 0, 0, cropCanvas.width, cropCanvas.height);
    
    // Initialize crop area selection
    setupCropEvents();
  };
}

// Setup crop events
function setupCropEvents() {
  const canvasContainer = cropCanvas.parentElement;
  
  // Reset crop overlay
  cropOverlay.style.display = 'none';
  isCreatingCrop = false;
  isDraggingCrop = false;
  isResizingCrop = false;
  
  // Mouse down - start creating crop area
  cropCanvas.addEventListener('mousedown', startCropSelection);
  
  // Mouse move - update crop area
  cropCanvas.addEventListener('mousemove', updateCropSelection);
  
  // Mouse up - finish creating crop area
  document.addEventListener('mouseup', endCropSelection);
  
  // Prevent default actions
  cropCanvas.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
}

// Start crop selection
function startCropSelection(e) {
  // Get exact canvas coordinates
  const rect = cropCanvas.getBoundingClientRect();
  const scaleX = cropCanvas.width / rect.width;
  const scaleY = cropCanvas.height / rect.height;
  
  // Calculate cursor position relative to the canvas
  cropStartX = (e.clientX - rect.left) * scaleX;
  cropStartY = (e.clientY - rect.top) * scaleY;
  
  // Initialize crop box at cursor position
  cropBox.x = cropStartX;
  cropBox.y = cropStartY;
  cropBox.width = 0;
  cropBox.height = 0;
  
  isCreatingCrop = true;
}

// Update crop selection
function updateCropSelection(e) {
  if (!isCreatingCrop) return;
  
  const rect = cropCanvas.getBoundingClientRect();
  const scaleX = cropCanvas.width / rect.width;
  const scaleY = cropCanvas.height / rect.height;
  
  // Calculate cursor position relative to the canvas
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;
  
  // Calculate width and height
  const width = mouseX - cropStartX;
  const height = mouseY - cropStartY;
  
  // Update crop box
  cropBox.width = width;
  cropBox.height = height;
  
  // Update crop overlay
  updateCropOverlay();
}

// End crop selection
function endCropSelection() {
  if (isCreatingCrop) {
    isCreatingCrop = false;
    
    // Normalize crop box (in case of negative width/height from user dragging)
    if (cropBox.width < 0) {
      cropBox.x += cropBox.width;
      cropBox.width = Math.abs(cropBox.width);
    }
    
    if (cropBox.height < 0) {
      cropBox.y += cropBox.height;
      cropBox.height = Math.abs(cropBox.height);
    }
    
    // Ensure crop box is fully within canvas bounds
    cropBox.x = Math.max(0, cropBox.x);
    cropBox.y = Math.max(0, cropBox.y);
    cropBox.width = Math.min(cropBox.width, cropCanvas.width - cropBox.x);
    cropBox.height = Math.min(cropBox.height, cropCanvas.height - cropBox.y);
    
    // Update crop overlay
    updateCropOverlay();
  }
}

// Update crop overlay
function updateCropOverlay() {
  // Convert canvas coordinates to screen coordinates
  const rect = cropCanvas.getBoundingClientRect();
  const scaleX = rect.width / cropCanvas.width;
  const scaleY = rect.height / cropCanvas.height;
  
  const screenX = cropBox.x * scaleX + rect.left;
  const screenY = cropBox.y * scaleY + rect.top;
  const screenWidth = cropBox.width * scaleX;
  const screenHeight = cropBox.height * scaleY;
  
  // Update overlay position and size
  cropOverlay.style.left = screenX + 'px';
  cropOverlay.style.top = screenY + 'px';
  cropOverlay.style.width = screenWidth + 'px';
  cropOverlay.style.height = screenHeight + 'px';
  cropOverlay.style.display = 'block';
}

// Apply crop
function applyCrop() {
  if (cropBox.width > 0 && cropBox.height > 0) {
    // Create a temporary canvas for the cropped image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropBox.width;
    tempCanvas.height = cropBox.height;
    
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw the cropped portion of the image
    tempCtx.drawImage(
      cropCanvas, 
      cropBox.x, cropBox.y, cropBox.width, cropBox.height, 
      0, 0, cropBox.width, cropBox.height
    );
    
    // Get the cropped image data
    const croppedImage = tempCanvas.toDataURL('image/png');
    
    // Update the preview
    modalPreview.src = croppedImage;
    
    // Close the modal
    cropModal.style.display = 'none';
    isCropping = false;
    
    showStatus('Image cropped successfully', 'success');
  } else {
    showStatus('Please select an area to crop', 'error');
  }
}

// Cancel the crop
function cancelCrop() {
  cropModal.style.display = 'none';
  isCropping = false;
}

// Select capture mode (fullscreen, window, tab, region)
function selectCaptureMode(mode) {
  captureMode = mode;
  
  // Update UI
  fullscreenBtn.classList.remove('selected');
  windowBtn.classList.remove('selected');
  tabBtn.classList.remove('selected');
  regionBtn.classList.remove('selected');
  
  switch(mode) {
    case 'fullscreen':
      fullscreenBtn.classList.add('selected');
      break;
    case 'window':
      windowBtn.classList.add('selected');
      break;
    case 'tab':
      tabBtn.classList.add('selected');
      break;
    case 'region':
      regionBtn.classList.add('selected');
      break;
  }
}

// Variables for region selection
let regionMediaStream = null;
let regionSelectionActive = false;
let regionStartX = 0;
let regionStartY = 0;
let regionBox = { x: 0, y: 0, width: 0, height: 0 };

// Capture screenshot function
async function captureScreenshot() {
  if (isCapturing) return;
  
  isCapturing = true;
  updateButtonStates(true);
  
  try {
    // For region selection, open the region modal
    if (captureMode === 'region') {
      startRegionSelection();
      return;
    }
    
    // Configure options based on the selected mode
    const displayMediaOptions = {
      video: {
        cursor: 'always'
      },
      audio: false
    };
    
    // Add specific constraints based on capture mode
    switch(captureMode) {
      case 'fullscreen':
        displayMediaOptions.video.displaySurface = 'monitor';
        // Remove toolbar flag to avoid the sharing indicator
        displayMediaOptions.video.selfBrowserSurface = 'exclude';
        break;
      case 'window':
        displayMediaOptions.video.displaySurface = 'window';
        break;
      case 'tab':
        displayMediaOptions.video.displaySurface = 'browser';
        break;
    }
    
    // Show instructions to the user
    const instructions = captureMode === 'window' 
      ? 'Select the window to capture. TIP: Keep this browser window visible to avoid focus issues.' 
      : `Please select the ${captureMode === 'fullscreen' ? 'screen' : 'browser tab'} you want to capture`;
    
    showStatus(instructions, 'success');
    
    // Request screen capture permissions
    const mediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    
    // Create video element to capture a frame
    const video = document.createElement('video');
    video.srcObject = mediaStream;
    
    // Wait for video to be loaded
    await new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });
    
    // Capture immediately
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const screenshot = canvas.toDataURL('image/png');
    
    // Stop the screen capture
    mediaStream.getTracks().forEach(track => track.stop());
    
    // Save the screenshot
    currentScreenshot = screenshot;
    showNameModal(screenshot);
    
    showStatus('Screenshot captured successfully', 'success');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    
    if (error.name === 'NotAllowedError') {
      showStatus('Permission denied. Please allow screen capture access.', 'error');
    } else {
      showStatus('Failed to capture screenshot', 'error');
    }
  } finally {
    isCapturing = false;
    updateButtonStates(false);
  }
}

// Start the region selection process
async function startRegionSelection() {
  try {
    // Configure display media options for region selection
    const displayMediaOptions = {
      video: {
        cursor: 'always',
        displaySurface: 'monitor'
      },
      audio: false
    };
    
    // Show the region selection modal
    regionModal.style.display = 'flex';
    
    // Request screen capture permissions
    regionMediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    
    // Set the video source
    regionPreview.srcObject = regionMediaStream;
    
    // Setup region selection events when video is loaded
    regionPreview.onloadedmetadata = () => {
      regionPreview.play();
      setupRegionSelectionEvents();
    };
    
  } catch (error) {
    console.error('Error starting region selection:', error);
    
    if (error.name === 'NotAllowedError') {
      showStatus('Permission denied. Please allow screen capture access.', 'error');
    } else {
      showStatus('Failed to start region selection', 'error');
    }
    
    cancelRegionSelection();
  }
}

// Setup region selection events
function setupRegionSelectionEvents() {
  regionSelectionActive = false;
  
  // Reset region overlay
  regionOverlay.style.display = 'none';
  
  // Mouse down - start creating region selection
  regionPreview.addEventListener('mousedown', startRegionDrag);
  
  // Mouse move - update region selection
  regionPreview.addEventListener('mousemove', updateRegionDrag);
  
  // Mouse up - finish creating region selection
  document.addEventListener('mouseup', endRegionDrag);
  
  // Prevent default actions
  regionPreview.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
}

// Start region drag
function startRegionDrag(e) {
  regionSelectionActive = true;
  
  const rect = regionPreview.getBoundingClientRect();
  regionStartX = e.clientX - rect.left;
  regionStartY = e.clientY - rect.top;
  
  // Initialize region box
  regionBox.x = regionStartX;
  regionBox.y = regionStartY;
  regionBox.width = 0;
  regionBox.height = 0;
  
  updateRegionOverlay();
}

// Update region drag
function updateRegionDrag(e) {
  if (!regionSelectionActive) return;
  
  const rect = regionPreview.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // Calculate width and height
  regionBox.width = mouseX - regionStartX;
  regionBox.height = mouseY - regionStartY;
  
  // Update size display
  regionSize.textContent = `${Math.abs(Math.round(regionBox.width))} x ${Math.abs(Math.round(regionBox.height))}`;
  
  // Update region overlay
  updateRegionOverlay();
}

// End region drag
function endRegionDrag() {
  if (regionSelectionActive) {
    regionSelectionActive = false;
    
    // Normalize region box
    if (regionBox.width < 0) {
      regionBox.x += regionBox.width;
      regionBox.width = Math.abs(regionBox.width);
    }
    
    if (regionBox.height < 0) {
      regionBox.y += regionBox.height;
      regionBox.height = Math.abs(regionBox.height);
    }
    
    updateRegionOverlay();
  }
}

// Update region overlay
function updateRegionOverlay() {
  regionOverlay.style.left = regionBox.x + 'px';
  regionOverlay.style.top = regionBox.y + 'px';
  regionOverlay.style.width = Math.abs(regionBox.width) + 'px';
  regionOverlay.style.height = Math.abs(regionBox.height) + 'px';
  regionOverlay.style.display = 'block';
}

// Capture the selected region
function captureSelectedRegion() {
  if (regionBox.width <= 0 || regionBox.height <= 0) {
    showStatus('Please select a region to capture', 'error');
    return;
  }
  
  try {
    // Calculate the scale factor between the video element and the actual video dimensions
    const videoRect = regionPreview.getBoundingClientRect();
    const scaleX = regionPreview.videoWidth / videoRect.width;
    const scaleY = regionPreview.videoHeight / videoRect.height;
    
    // Calculate the actual coordinates in the video
    const sourceX = regionBox.x * scaleX;
    const sourceY = regionBox.y * scaleY;
    const sourceWidth = regionBox.width * scaleX;
    const sourceHeight = regionBox.height * scaleY;
    
    // Create a canvas to draw the region
    const canvas = document.createElement('canvas');
    canvas.width = Math.abs(sourceWidth);
    canvas.height = Math.abs(sourceHeight);
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      regionPreview, 
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, canvas.width, canvas.height
    );
    
    // Get the screenshot data
    const screenshot = canvas.toDataURL('image/png');
    
    // Close the region selection modal
    regionModal.style.display = 'none';
    
    // Stop the screen capture
    if (regionMediaStream) {
      regionMediaStream.getTracks().forEach(track => track.stop());
      regionMediaStream = null;
    }
    
    // Remove event listeners
    regionPreview.removeEventListener('mousedown', startRegionDrag);
    regionPreview.removeEventListener('mousemove', updateRegionDrag);
    document.removeEventListener('mouseup', endRegionDrag);
    
    // Save the screenshot
    currentScreenshot = screenshot;
    showNameModal(screenshot);
    
    showStatus('Region captured successfully', 'success');
    
  } catch (error) {
    console.error('Error capturing region:', error);
    showStatus('Failed to capture region', 'error');
    cancelRegionSelection();
  } finally {
    isCapturing = false;
    updateButtonStates(false);
  }
}

// Cancel region selection
function cancelRegionSelection() {
  regionModal.style.display = 'none';
  
  // Stop the screen capture
  if (regionMediaStream) {
    regionMediaStream.getTracks().forEach(track => track.stop());
    regionMediaStream = null;
  }
  
  // Remove event listeners
  regionPreview.removeEventListener('mousedown', startRegionDrag);
  regionPreview.removeEventListener('mousemove', updateRegionDrag);
  document.removeEventListener('mouseup', endRegionDrag);
  
  isCapturing = false;
  updateButtonStates(false);
}

// Show the name modal with screenshot preview
function showNameModal(screenshot) {
  // Reset the active tab
  openTab('details');
  
  // Set the preview image
  modalPreview.src = screenshot;
  nameModal.style.display = 'flex';
  
  // Set default name based on capture mode and time
  const date = new Date();
  const timeString = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
  
  let defaultName;
  if (sequentialMode) {
    defaultName = `${sequenceName}_Step${sequenceCounter}`;
  } else {
    defaultName = `${captureMode === 'fullscreen' ? 'Screen' : captureMode === 'window' ? 'Window' : 'Tab'} ${timeString}`;
  }
  
  screenshotNameInput.value = defaultName;
  
  // Set default metadata based on app mode
  if (appMode === 'general') {
    const savedAuthor = localStorage.getItem('metaAuthor');
    if (savedAuthor) {
      metaAuthor.value = savedAuthor;
    }
    
    const savedProject = localStorage.getItem('metaProject');
    if (savedProject) {
      metaProject.value = savedProject;
    }
  } else {
    const savedTester = localStorage.getItem('metaTester');
    if (savedTester) {
      metaTester.value = savedTester;
    }
    
    const savedSoftware = localStorage.getItem('metaSoftware');
    if (savedSoftware) {
      metaSoftware.value = savedSoftware;
    }
  }
  
  screenshotNameInput.focus();
  screenshotNameInput.select(); // Select the text for easy editing
}

// Save the current screenshot with name
function saveScreenshot() {
  const name = screenshotNameInput.value.trim();
  
  if (!currentScreenshot || !name) {
    showStatus('Screenshot name is required', 'error');
    return;
  }
  
  // Check if we're editing an existing screenshot
  const isEditing = typeof currentScreenshot === 'object' && currentScreenshot.index !== undefined;
  
  // If the screenshot has been annotated, use the annotated image
  if (!isEditing && modalPreview.src !== currentScreenshot) {
    // Save the annotated version instead
    currentScreenshot = modalPreview.src;
  }
  
  // Collect metadata based on current app mode
  let metadata;
  
  if (appMode === 'general') {
    metadata = {
      mode: 'general',
      category: metaCategory.value,
      author: metaAuthor.value,
      project: metaProject.value,
      tags: metaTags.value,
      timestamp: metaTimestamp.checked ? new Date().toISOString() : null,
      sequentialInfo: sequentialMode ? {
        sequenceName: sequenceName,
        stepNumber: sequenceCounter
      } : null
    };
    
    // Save author and project in local storage for convenience
    if (metaAuthor.value) {
      localStorage.setItem('metaAuthor', metaAuthor.value);
    }
    
    if (metaProject.value) {
      localStorage.setItem('metaProject', metaProject.value);
    }
  } else {
    metadata = {
      mode: 'validation',
      environment: metaEnvironment.value,
      tester: metaTester.value,
      software: metaSoftware.value,
      testId: metaTestId.value,
      protocol: metaProtocol.value,
      timestamp: metaTimestampValidation.checked ? new Date().toISOString() : null,
      sequentialInfo: sequentialMode ? {
        sequenceName: sequenceName,
        stepNumber: sequenceCounter
      } : null
    };
    
    // Save tester and software in local storage for convenience
    if (metaTester.value) {
      localStorage.setItem('metaTester', metaTester.value);
    }
    
    if (metaSoftware.value) {
      localStorage.setItem('metaSoftware', metaSoftware.value);
    }
  }
  
  if (isEditing) {
    // Update the existing screenshot
    const index = currentScreenshot.index;
    screenshots[index].name = name;
    screenshots[index].metadata = metadata;
    
    // If the image was annotated, update the data URL
    if (modalPreview.src !== currentScreenshot.dataUrl) {
      screenshots[index].dataUrl = modalPreview.src;
    }
    
    showStatus('Screenshot updated', 'success');
  } else {
    // Add a new screenshot to the collection
    screenshots.push({
      dataUrl: typeof currentScreenshot === 'object' ? currentScreenshot.dataUrl : currentScreenshot,
      name: name,
      timestamp: new Date().toISOString(),
      type: captureMode,
      metadata: metadata
    });
  }
  
  // Hide the modal
  nameModal.style.display = 'none';
  currentScreenshot = null;
  
  // Update sequence counter if in sequential mode
  if (sequentialMode) {
    sequenceCounter++;
    sequenceCounterEl.textContent = sequenceCounter;
  }
  
  // Update the UI
  updateScreenshotList();
  showStatus('Screenshot added', 'success');
  
  // Show the export button if we have screenshots
  if (screenshots.length > 0) {
    exportBtn.style.display = 'block';
  }
}

// Cancel the current screenshot
function cancelScreenshot() {
  nameModal.style.display = 'none';
  currentScreenshot = null;
}

// Update the screenshot list display
function updateScreenshotList() {
  if (screenshots.length === 0) {
    screenshotList.style.display = 'none';
    exportOptions.style.display = 'none';
    return;
  }
  
  screenshotList.style.display = 'block';
  exportOptions.style.display = 'flex';
  screenshotsContainer.innerHTML = '';
  
  screenshots.forEach((screenshot, index) => {
    const item = document.createElement('div');
    item.className = 'screenshot-item';
    
    const title = document.createElement('h3');
    title.textContent = screenshot.name;
    
    const typeInfo = document.createElement('p');
    typeInfo.className = 'screenshot-type';
    typeInfo.textContent = getTypeText(screenshot.type);
    
    const img = document.createElement('img');
    img.src = screenshot.dataUrl;
    img.alt = screenshot.name;
    
    // Add metadata badges if available
    const metadataContainer = document.createElement('div');
    metadataContainer.className = 'metadata-badges';
    
    if (screenshot.metadata) {
      const metadata = screenshot.metadata;
      
      // Add mode badge
      const modeBadge = document.createElement('span');
      modeBadge.className = 'badge mode';
      modeBadge.textContent = metadata.mode === 'validation' ? 'GMP' : 'General';
      metadataContainer.appendChild(modeBadge);
      
      if (metadata.mode === 'general') {
        // General metadata badges
        if (metadata.category) {
          const badge = document.createElement('span');
          badge.className = 'badge';
          badge.textContent = metadata.category;
          metadataContainer.appendChild(badge);
        }
        
        if (metadata.tags) {
          const tagList = metadata.tags.split(',');
          tagList.slice(0, 3).forEach(tag => {
            if (tag.trim()) {
              const badge = document.createElement('span');
              badge.className = 'badge tag';
              badge.textContent = tag.trim();
              metadataContainer.appendChild(badge);
            }
          });
          
          if (tagList.length > 3) {
            const badge = document.createElement('span');
            badge.className = 'badge tag-more';
            badge.textContent = `+${tagList.length - 3}`;
            metadataContainer.appendChild(badge);
          }
        }
      } else {
        // Validation metadata badges
        if (metadata.environment) {
          const badge = document.createElement('span');
          badge.className = 'badge environment';
          badge.textContent = metadata.environment;
          metadataContainer.appendChild(badge);
        }
        
        if (metadata.testId) {
          const badge = document.createElement('span');
          badge.className = 'badge test-id';
          badge.textContent = metadata.testId;
          metadataContainer.appendChild(badge);
        }
      }
      
      if (metadata.sequentialInfo) {
        const badge = document.createElement('span');
        badge.className = 'badge sequence';
        badge.textContent = `Step ${metadata.sequentialInfo.stepNumber}`;
        metadataContainer.appendChild(badge);
      }
    }
    
    // Add buttons for interacting with each screenshot
    const controls = document.createElement('div');
    controls.className = 'screenshot-controls';
    
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', () => downloadScreenshot(screenshot, index));
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editScreenshot(index));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteScreenshot(index));
    
    controls.appendChild(downloadBtn);
    controls.appendChild(editBtn);
    controls.appendChild(deleteBtn);
    
    item.appendChild(title);
    item.appendChild(typeInfo);
    if (metadataContainer.children.length > 0) {
      item.appendChild(metadataContainer);
    }
    item.appendChild(img);
    item.appendChild(controls);
    
    screenshotsContainer.appendChild(item);
  });
}

// Get descriptive text for a screenshot type
function getTypeText(type) {
  switch(type) {
    case 'fullscreen': return 'Full Screen';
    case 'window': return 'Window/Application';
    case 'tab': return 'Browser Tab';
    default: return 'Screenshot';
  }
}

// Download a single screenshot
function downloadScreenshot(screenshot, index) {
  const link = document.createElement('a');
  link.href = screenshot.dataUrl;
  
  // Create a safe filename
  const name = screenshot.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.download = `${name}_${index}.png`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showStatus('Screenshot downloaded', 'success');
}

// Edit a screenshot
function editScreenshot(index) {
  const screenshot = screenshots[index];
  
  // Set the preview image
  modalPreview.src = screenshot.dataUrl;
  nameModal.style.display = 'flex';
  
  // Set form values from the screenshot
  screenshotNameInput.value = screenshot.name;
  
  // Set metadata values if available
  if (screenshot.metadata) {
    const metadata = screenshot.metadata;
    
    // Switch app mode to match the metadata mode if necessary
    if (metadata.mode && metadata.mode !== appMode) {
      appModeSelector.value = metadata.mode;
      switchAppMode();
    }
    
    if (appMode === 'general') {
      metaCategory.value = metadata.category || 'General';
      metaAuthor.value = metadata.author || '';
      metaProject.value = metadata.project || '';
      metaTags.value = metadata.tags || '';
      metaTimestamp.checked = !!metadata.timestamp;
    } else {
      metaEnvironment.value = metadata.environment || 'QA';
      metaTester.value = metadata.tester || '';
      metaSoftware.value = metadata.software || '';
      metaTestId.value = metadata.testId || '';
      metaProtocol.value = metadata.protocol || '';
      metaTimestampValidation.checked = !!metadata.timestamp;
    }
  }
  
  // Focus on the name input
  screenshotNameInput.focus();
  
  // Store the index to know which screenshot to update
  currentScreenshot = { dataUrl: screenshot.dataUrl, index: index };
  
  showStatus('Editing screenshot metadata', 'success');
}

// Delete a screenshot
function deleteScreenshot(index) {
  if (confirm('Are you sure you want to delete this screenshot?')) {
    screenshots.splice(index, 1);
    updateScreenshotList();
    
    if (screenshots.length === 0) {
      exportBtn.style.display = 'none';
    }
    
    showStatus('Screenshot deleted', 'success');
  }
}

// Export all screenshots
function exportScreenshots() {
  if (screenshots.length === 0) {
    showStatus('No screenshots to export', 'error');
    return;
  }
  
  // Create a zip file with JSZip (in a production app)
  // For now, just download them individually
  screenshots.forEach((screenshot, index) => {
    setTimeout(() => {
      downloadScreenshot(screenshot, index);
    }, index * 500); // Slight delay between downloads
  });
  
  showStatus(`Exporting ${screenshots.length} screenshots`, 'success');
}

// Convert data URL to array buffer
async function dataURLToArrayBuffer(dataURL) {
  const response = await fetch(dataURL);
  const blob = await response.blob();
  return await blob.arrayBuffer();
}

// Get formatted metadata text for Word document
function getMetadataText(metadata) {
  if (!metadata) return '';
  
  let text = '';
  
  if (metadata.mode === 'general' || !metadata.mode) {
    if (metadata.category) {
      text += `Category: ${metadata.category} | `;
    }
    
    if (metadata.tags) {
      text += `Tags: ${metadata.tags} | `;
    }
    
    if (metadata.project) {
      text += `Project: ${metadata.project} | `;
    }
    
    if (metadata.author) {
      text += `Author: ${metadata.author} | `;
    }
  } else {
    if (metadata.environment) {
      text += `Environment: ${metadata.environment} | `;
    }
    
    if (metadata.testId) {
      text += `Test ID: ${metadata.testId} | `;
    }
    
    if (metadata.software) {
      text += `Software: ${metadata.software} | `;
    }
    
    if (metadata.tester) {
      text += `Tester: ${metadata.tester} | `;
    }
    
    if (metadata.protocol) {
      text += `Protocol: ${metadata.protocol} | `;
    }
  }
  
  if (metadata.timestamp) {
    const date = new Date(metadata.timestamp);
    text += `Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()} | `;
  }
  
  if (metadata.sequentialInfo) {
    text += `Sequence: ${metadata.sequentialInfo.sequenceName} (Step ${metadata.sequentialInfo.stepNumber}) | `;
  }
  
  // Remove the trailing separator
  if (text.endsWith(' | ')) {
    text = text.slice(0, -3);
  }
  
  return text;
}

// Export to Word document
async function exportToWord() {
  if (screenshots.length === 0) {
    showStatus('No screenshots to export', 'error');
    return;
  }

  try {
    showStatus('Creating Word document...', 'success');

    // Create an array of promises for processing each screenshot
    const documentElements = await Promise.all(
      screenshots.map(async (screenshot) => {
        // Convert data URL to array buffer - this already includes annotations since we store the final image
        const imageBuffer = await dataURLToArrayBuffer(screenshot.dataUrl);
        
        // Get metadata text
        const metadataText = getMetadataText(screenshot.metadata);
        
        const elements = [
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: screenshot.name,
                bold: true,
                size: 24,
              }),
            ],
          })
        ];
        
        // Add metadata paragraph if there is metadata
        if (metadataText) {
          elements.push(
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: metadataText,
                  size: 20,
                  color: "666666",
                  italics: true
                }),
              ],
            })
          );
        }
        
        // Add type information
        elements.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `Type: ${getTypeText(screenshot.type)}`,
                size: 20,
                color: "666666",
              }),
            ],
          })
        );
        
        // Add the image
        elements.push(
          new docx.Paragraph({
            children: [
              new docx.ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 600,
                  height: 361,
                },
              }),
            ],
          })
        );
        
        // Add page break
        elements.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: "",
                break: 1,
              }),
            ],
          })
        );
        
        return elements;
      })
    );

    // Flatten the array of arrays into a single array
    const flattenedElements = documentElements.flat();

    // Create document title
    const docTitle = sequentialMode ? 
      `Test Sequence: ${sequenceName}` : 
      `Screenshot Collection (${new Date().toLocaleString()})`;
    
    // Create header with title and date
    const header = new docx.Header({
      children: [
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: docTitle,
              bold: true,
              size: 24,
            }),
          ],
          alignment: docx.AlignmentType.CENTER
        }),
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `Generated: ${new Date().toLocaleString()}`,
              size: 20,
              color: "666666",
            }),
          ],
          alignment: docx.AlignmentType.CENTER
        })
      ]
    });

    const doc = new docx.Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          }
        },
        headers: {
          default: header
        },
        children: flattenedElements,
      }],
    });

    // Generate and download the document
    const buffer = await docx.Packer.toBlob(doc);
    
    // Create a filename
    let filename;
    if (sequentialMode) {
      filename = `${sequenceName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().replace(/[:.]/g, '-')}.docx`;
    } else {
      filename = `screenshots_${new Date().toISOString().replace(/[:.]/g, '-')}.docx`;
    }
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(buffer);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showStatus('Word document created successfully', 'success');
  } catch (error) {
    console.error('Error creating Word document:', error);
    showStatus('Failed to create Word document', 'error');
  }
}

// Update button states based on capture status
function updateButtonStates(disabled) {
  fullscreenBtn.disabled = disabled;
  windowBtn.disabled = disabled;
  tabBtn.disabled = disabled;
  captureBtn.disabled = disabled;
  exportBtn.disabled = disabled;
  exportWordBtn.disabled = disabled;
}

// Show a status message
function showStatus(message, type = 'success') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';
  
  // Hide the message after 3 seconds
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 3000);
} 