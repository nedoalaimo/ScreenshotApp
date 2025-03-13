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
let savedTemplates = {
  'login': {
    name: 'Login Validation',
    environment: 'QA',
    software: 'Login Module v1.2',
    testId: 'TC001'
  },
  'data-entry': {
    name: 'Data Entry Validation',
    environment: 'QA',
    software: 'Data Entry Form v2.0',
    testId: 'TC045'
  },
  'report': {
    name: 'Report Generation',
    environment: 'QA',
    software: 'Reporting Module v3.1',
    testId: 'TC098'
  }
};

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

// DOM Elements
let captureContainer;
let fullscreenBtn;
let windowBtn;
let tabBtn;
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

// Tab elements
let tabButtons;
let tabPanes;

// Metadata elements
let metaEnvironment;
let metaTester;
let metaSoftware;
let metaTestId;
let metaTimestamp;

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

// Initialize the app when the window has loaded
document.addEventListener('DOMContentLoaded', () => {
  if (!checkBrowserCompatibility()) return;
  
  initializeElements();
  setupEventListeners();
});

// Initialize DOM elements
function initializeElements() {
  captureContainer = document.getElementById('capture-container');
  fullscreenBtn = document.getElementById('fullscreen-btn');
  windowBtn = document.getElementById('window-btn');
  tabBtn = document.getElementById('tab-btn');
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
  
  // Metadata elements
  metaEnvironment = document.getElementById('meta-environment');
  metaTester = document.getElementById('meta-tester');
  metaSoftware = document.getElementById('meta-software');
  metaTestId = document.getElementById('meta-test-id');
  metaTimestamp = document.getElementById('meta-timestamp');
  
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
  
  // Capture button
  captureBtn.addEventListener('click', captureScreenshot);
  
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
    
    // Apply the template values to the form
    screenshotNameInput.value = template.name || '';
    metaEnvironment.value = template.environment || 'QA';
    metaSoftware.value = template.software || '';
    metaTestId.value = template.testId || '';
    
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
  
  // Save the template
  savedTemplates[templateId] = {
    name: name,
    environment: metaEnvironment.value,
    software: metaSoftware.value,
    testId: metaTestId.value
  };
  
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
    // Set canvas dimensions
    annotationCanvas.width = img.width;
    annotationCanvas.height = img.height;
    
    // Get the context and draw the image
    annotationCtx = annotationCanvas.getContext('2d');
    annotationCtx.drawImage(img, 0, 0, annotationCanvas.width, annotationCanvas.height);
    
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
  
  // Get canvas position
  const rect = annotationCanvas.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
  
  // For text tool, show input field at click position
  if (currentTool === 'text') {
    textInputContainer.style.display = 'flex';
    textInputContainer.style.left = (e.clientX + 10) + 'px';
    textInputContainer.style.top = (e.clientY + 10) + 'px';
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

// Draw as the mouse moves
function draw(e) {
  if (!isDrawing) return;
  
  const rect = annotationCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  if (currentTool === 'draw') {
    // Freehand drawing
    annotationCtx.lineTo(x, y);
    annotationCtx.stroke();
  }
}

// Stop drawing
function stopDrawing(e) {
  if (!isDrawing) return;
  
  const rect = annotationCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Handle different drawing tools
  switch(currentTool) {
    case 'draw':
      // Drawing is already done in the draw function
      break;
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
    // Position from the text input container
    const rect = annotationCanvas.getBoundingClientRect();
    const containerRect = textInputContainer.getBoundingClientRect();
    
    const x = containerRect.left - rect.left;
    const y = containerRect.top - rect.top;
    
    // Set text properties
    annotationCtx.font = '16px Arial';
    annotationCtx.fillStyle = currentColor;
    annotationCtx.fillText(text, x, y);
    
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
    };
  }
}

// Select capture mode (fullscreen, window, tab)
function selectCaptureMode(mode) {
  captureMode = mode;
  
  // Update UI
  fullscreenBtn.classList.remove('selected');
  windowBtn.classList.remove('selected');
  tabBtn.classList.remove('selected');
  
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
  }
}

// Capture screenshot function
async function captureScreenshot() {
  if (isCapturing) return;
  
  isCapturing = true;
  updateButtonStates(true);
  
  try {
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
  
  // Set default metadata
  const savedTester = localStorage.getItem('metaTester');
  if (savedTester) {
    metaTester.value = savedTester;
  }
  
  const savedSoftware = localStorage.getItem('metaSoftware');
  if (savedSoftware) {
    metaSoftware.value = savedSoftware;
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
  
  // Collect metadata
  const metadata = {
    environment: metaEnvironment.value,
    tester: metaTester.value,
    software: metaSoftware.value,
    testId: metaTestId.value,
    timestamp: metaTimestamp.checked ? new Date().toISOString() : null,
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
  
  // Add the screenshot to the collection
  screenshots.push({
    dataUrl: currentScreenshot,
    name: name,
    timestamp: new Date().toISOString(),
    type: captureMode,
    metadata: metadata
  });
  
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
      
      if (metadata.environment) {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = metadata.environment;
        metadataContainer.appendChild(badge);
      }
      
      if (metadata.testId) {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = metadata.testId;
        metadataContainer.appendChild(badge);
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
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteScreenshot(index));
    
    controls.appendChild(downloadBtn);
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
        // Convert data URL to array buffer
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