let contentFields = [];
let currentScale = 1;
let currentDevice = 'desktop';

function togglePreferredEmail() {
    const contactInfoCheckbox = document.getElementById('contactInfo');
    const preferredEmailContainer = document.getElementById('preferredEmailContainer');
    preferredEmailContainer.style.display = contactInfoCheckbox.checked ? 'block' : 'none';
}

function setView(view) {
    document.getElementById('previewButton').classList.toggle('active', view === 'preview');
    document.getElementById('codeButton').classList.toggle('active', view === 'code');
    document.getElementById('helpButton').classList.toggle('active', view === 'help');

    document.getElementById('previewMode').style.display = view === 'preview' ? 'block' : 'none';
    document.getElementById('codeMode').style.display = view === 'code' ? 'block' : 'none';
    document.getElementById('helpMode').style.display = view === 'help' ? 'block' : 'none';
    document.getElementById('previewControls').style.display = view === 'preview' ? 'flex' : 'none';

    // Hide the iframe when not in preview mode
    const previewIframe = document.getElementById('previewIframe');
    previewIframe.style.display = view === 'preview' ? 'block' : 'none';

    if (view === 'preview') {
        requestAnimationFrame(() => {
            setDevice(currentDevice);
        });
    }

    updatePreview();
}

function updateHelpOutput() {
    const variableName = document.getElementById('helpVariableName').value;
    const format = document.querySelector('input[name="format"]:checked').value;
    const isDynamic = document.getElementById('dynamicValue').checked;

    let output = '';
    if (variableName) {
        const value = isDynamic ? `\${${variableName}}` : variableName;
        const dynamicAttr = isDynamic ? ` th:text="\${${variableName}}"` : '';

        switch (format) {
            case 'strong':
                output = `<strong${dynamicAttr}>${isDynamic ? '' : value}</strong>`;
                break;
            case 'underline':
                output = `<u${dynamicAttr}>${isDynamic ? '' : value}</u>`;
                break;
            case 'both':
                output = `<u> <strong${dynamicAttr}>${isDynamic ? '' : value}</strong> </u>`;
                break;
            default:
                output = `<span${dynamicAttr}>${isDynamic ? '' : value}</span>`;
        }
    }

    document.getElementById('outputText').textContent = output;
}

function copyHelpOutput() {
    const output = document.getElementById('outputText').textContent;
    navigator.clipboard.writeText(output);
    const copyBtn = document.querySelector('.help-copy-btn');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy';
    }, 2000);
}

const dimensions = {
    'desktop': { width: '100%', height: '100%' },
    'mobile-portrait': { width: '375px', height: '675px' },  // iPhone SE/5s size
    'mobile-landscape': { width: '568px', height: '320px' },
    'tablet-portrait': { width: '768px', height: '1024px' },
    'tablet-landscape': { width: '1024px', height: '768px' }
};

function setDevice(device) {
    currentDevice = device;
    const frame = document.getElementById('previewMode');
    const iframe = document.getElementById('previewIframe');

    // Reset styles
    frame.className = 'preview-frame';
    frame.style = '';
    iframe.style = '';

    const { width, height } = dimensions[device];
    frame.style.width = width;
    frame.style.height = height;

    if (device !== 'desktop') {
        frame.classList.add('device-frame');
        iframe.style.height = '100%';
        iframe.style.overflowY = 'auto';
        iframe.style.WebkitOverflowScrolling = 'touch';
    } else {
        iframe.style.height = '100%';
        iframe.style.overflowY = 'auto';
    }

    // Update active button
    const deviceButtons = document.querySelectorAll('.device-button');
    deviceButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-device') === device);
    });

    // Update scale with a slight delay to ensure proper rendering
    setTimeout(() => {
        updatePreviewScale();
    }, 100);

}


window.addEventListener('resize', () => {
    if (document.getElementById('previewMode').style.display !== 'none') {
        updatePreviewScale();
    }
});


function copyCode() {
    const code = document.getElementById('codePreview').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const copyBtn = document.querySelector('.copy-button');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy Code';
        }, 2000);
    });
}


function calculatePreviewScale(containerWidth, containerHeight, frameWidth, frameHeight) {
    const horizontalPadding = 40;
    const verticalPadding = 40;
    const availableWidth = containerWidth - horizontalPadding;
    const availableHeight = containerHeight - verticalPadding;
    return Math.min(availableWidth / frameWidth, availableHeight / frameHeight, 1);
}

function updatePreviewScale() {
    const frame = document.getElementById('previewMode');
    const container = document.querySelector('.preview-container');

    if (currentDevice === 'desktop') {
        frame.style.transform = '';
        return;
    }

    const containerRect = container.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();

    const padding = 48;
    const availableWidth = containerRect.width - padding;
    const availableHeight = containerRect.height - padding;

    const scaleX = availableWidth / frameRect.width;
    const scaleY = availableHeight / frameRect.height;
    currentScale = Math.min(scaleX, scaleY, 0.95);

    frame.style.transform = '';
}

function addField() {
    const fieldType = document.getElementById('fieldType').value;
    const contentFieldsDiv = document.getElementById('contentFields');
    const fieldId = `field-${Date.now()}`;

    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'field-group';
    fieldGroup.id = fieldId;

    if (fieldType === 'text') {
        fieldGroup.innerHTML = `
            <label>Text Content:</label>
            <textarea class="contentText" oninput="validateForm(); updatePreview();" placeholder="Enter text"></textarea>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <div style="display: flex; align-items: center; gap : 20px;">
                 <select class="alignmentSelect"  onchange="updatePreview()">
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                </select>
                <select class="textColorSelect"  onchange="updatePreview()">
                    <option value="default">Default</option>
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                </select>
                </div>
                <button type="button" class="remove-btn" onclick="removeField(this)">Remove</button>
            </div>`;
    } else if (fieldType === 'button') {
        fieldGroup.innerHTML = `
            <label for="buttonText">Button Text:</label>
            <input type="text" class="buttonText" oninput="validateForm(); updatePreview();" placeholder="Enter Button Name">
            <label for="buttonLink">Button Link:</label>
            <input type="text" class="buttonLink" oninput="validateForm(); updatePreview();" placeholder="Enter Button Link">
            <div style="display: flex; justify-content: end; align-items: center; margin-top: 10px;">
                <button type="button" class="remove-btn" onclick="removeField(this)">Remove</button>
            </div>`;
    } else if (fieldType === 'simpleTable') {
        fieldGroup.innerHTML = `
            <label>Simple Table:</label>
            <div class="table-controls" style="display: flex; gap: 10px; margin-bottom: 10px;">
                <button type="button" class="control-button" onclick="addSimpleTableRow('${fieldId}', 'normal')" style="background-color: #1f3462; color: white; padding: 5px 10px;">Add Row</button>
                <button type="button" class="control-button" onclick="addSimpleTableRow('${fieldId}', 'fullwidth')" style="background-color: #4CAF50; color: white; padding: 5px 10px;">Add Full Width Row</button>
            </div>
            <div class="simple-table-rows" style="border: 1px solid #e5e7eb; border-radius: 5px; padding: 10px; max-height: 300px; overflow-y: auto;">
                <div class="no-rows-message" style="text-align: center; color: #666; padding: 20px;">No rows added yet. Click "Add Row" to start building your table.</div>
            </div>
            <div style="display: flex; justify-content: end; align-items: center; margin-top: 10px;">
                <button type="button" class="remove-btn" onclick="removeField(this)">Remove</button>
            </div>`;
    }

    contentFieldsDiv.appendChild(fieldGroup);
    contentFields.push(fieldGroup);
    validateForm();
    updatePreview();
}

function removeField(button) {
    const fieldGroup = button.closest('.field-group');
    const fieldId = fieldGroup.id;
    contentFields = contentFields.filter(field => field.id !== fieldId);
    fieldGroup.remove();
    validateForm();
    updatePreview();
}

function addSimpleTableRow(fieldId, rowType) {
    const fieldGroup = document.getElementById(fieldId);
    const simpleTableRows = fieldGroup.querySelector('.simple-table-rows');
    const noRowsMessage = simpleTableRows.querySelector('.no-rows-message');

    if (noRowsMessage) {
        noRowsMessage.remove();
    }

    const rowId = `row-${Date.now()}`;
    const row = document.createElement('div');
    row.className = 'simple-table-row';
    row.setAttribute('data-row-type', rowType);
    row.id = rowId;

    if (rowType === 'fullwidth') {
        row.innerHTML = `
            <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 5px; padding: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: #1f3462;">Full Width Row</strong>
                    <button type="button" class="remove-row-btn" onclick="removeSimpleTableRow('${rowId}')" style="background-color: #dc3545; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer;">Remove Row</button>
                </div>
                <div class="full-width-fields">
                    <button type="button" onclick="addFullWidthField('${rowId}', 'text')" style="background-color: #007bff; color: white; border: none; padding: 5px 10px; margin-right: 5px; border-radius: 3px; cursor: pointer;">Add Text</button>
                    <button type="button" onclick="addFullWidthField('${rowId}', 'button')" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Add Button</button>
                </div>
                <div class="full-width-field-groups" style="margin-top: 10px;"></div>
            </div>`;
    } else {
        row.innerHTML = `
            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: #1f3462;">Table Row</strong>
                    <div>
                        <button type="button" onclick="addTableCell('${rowId}')" style="background-color: #007bff; color: white; border: none; padding: 3px 8px; margin-right: 5px; border-radius: 3px; cursor: pointer;">Add Cell</button>
                        <button type="button" class="remove-row-btn" onclick="removeSimpleTableRow('${rowId}')" style="background-color: #dc3545; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer;">Remove Row</button>
                    </div>
                </div>
                <div class="table-cells" style="display: flex; flex-wrap: wrap; gap: 5px;"></div>
            </div>`;

        // Add first cell by default
        setTimeout(() => addTableCell(rowId), 0);
    }

    simpleTableRows.appendChild(row);
    validateForm();
    updatePreview();
}

function removeSimpleTableRow(rowId) {
    const row = document.getElementById(rowId);
    const simpleTableRows = row.closest('.simple-table-rows');
    row.remove();

    // Show no rows message if no rows left
    if (simpleTableRows.children.length === 0) {
        const noRowsMessage = document.createElement('div');
        noRowsMessage.className = 'no-rows-message';
        noRowsMessage.style.cssText = 'text-align: center; color: #666; padding: 20px;';
        noRowsMessage.textContent = 'No rows added yet. Click "Add Row" to start building your table.';
        simpleTableRows.appendChild(noRowsMessage);
    }

    validateForm();
    updatePreview();
}

function addTableCell(rowId) {
    const row = document.getElementById(rowId);
    const tableCells = row.querySelector('.table-cells');
    const cellId = `cell-${Date.now()}`;

    const cell = document.createElement('div');
    cell.className = 'table-cell-container';
    cell.style.cssText = 'flex: 1; min-width: 150px;';
    cell.innerHTML = `
        <input type="text" class="tableCell" oninput="validateForm(); updatePreview();" placeholder="Enter cell content" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
        <button type="button" onclick="removeTableCell(this)" style="background-color: #dc3545; color: white; border: none; padding: 2px 5px; margin-top: 2px; border-radius: 3px; cursor: pointer; font-size: 10px;">Remove</button>
    `;

    tableCells.appendChild(cell);
    validateForm();
    updatePreview();
}

function removeTableCell(button) {
    const cellContainer = button.closest('.table-cell-container');
    cellContainer.remove();
    validateForm();
    updatePreview();
}

function addFullWidthField(rowId, fieldType) {
    const row = document.getElementById(rowId);
    const fullWidthFieldGroups = row.querySelector('.full-width-field-groups');
    const fieldId = `fullwidth-${Date.now()}`;

    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'full-width-field-group';
    fieldGroup.style.cssText = 'border: 1px solid #ccc; border-radius: 3px; padding: 10px; margin-bottom: 10px; background-color: white;';

    if (fieldType === 'text') {
        fieldGroup.innerHTML = `
            <label>Text Content:</label>
            <textarea class="fullWidthText" oninput="validateForm(); updatePreview();" placeholder="Enter text" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px; min-height: 60px;"></textarea>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                <select class="fullWidthAlignment" onchange="updatePreview()" style="padding: 3px;">
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                </select>
                <button type="button" onclick="removeFullWidthField(this)" style="background-color: #dc3545; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer;">Remove</button>
            </div>`;
    } else if (fieldType === 'button') {
        fieldGroup.innerHTML = `
            <label>Button Text:</label>
            <input type="text" class="fullWidthButtonText" oninput="validateForm(); updatePreview();" placeholder="Enter button text" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px; margin-bottom: 5px;">
            <label>Button Link:</label>
            <input type="text" class="fullWidthButtonLink" oninput="validateForm(); updatePreview();" placeholder="Enter button link" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
            <div style="display: flex; justify-content: end; align-items: center; margin-top: 5px;">
                <button type="button" onclick="removeFullWidthField(this)" style="background-color: #dc3545; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer;">Remove</button>
            </div>`;
    }

    fullWidthFieldGroups.appendChild(fieldGroup);
    validateForm();
    updatePreview();
}

function removeFullWidthField(button) {
    const fieldGroup = button.closest('.full-width-field-group');
    fieldGroup.remove();
    validateForm();
    updatePreview();
}

function updatePreview() {
    validateForm();
    const imageName = document.getElementById('imageName').value;
    const imageWidth = document.getElementById('imageWidth').value;
    const imageHeight = document.getElementById('imageHeight').value;
    const contactInfo = document.getElementById('contactInfo').checked;
    const scheduleMeeting = document.getElementById('scheduleMeeting').checked;
    const includeFooter = document.getElementById('includeFooter').checked;
    const squirrelType = document.getElementById('squirrelType').value;
    const preferredEmail = document.getElementById('preferredEmail').value;

    // Organization type configuration
    const ORG_CONFIG = {
        ai: {
            name: 'AI Squirrels',
            supportEmail: 'support@aisquirrels.com',
            website: 'https://aisquirrels.com',
            footerLogo: 'https://globalmedsquirrels.s3.ap-south-1.amazonaws.com/notification-config/images/aisquirrels/ai_image_0048.png'
        },
        med: {
            name: 'MedSquirrels',
            supportEmail: 'support@medsquirrels.com',
            hiringEmail: 'hiring@medsquirrels.com',
            website: 'https://medsquirrels.com',
            footerLogo: 'https://globalmedsquirrels.s3.ap-south-1.amazonaws.com/notification-config/images/medsquirrels/ms_image_0048.png'
        },
        global: {
            name: 'Global Squirrels',
            supportEmail: 'support@globalsquirrels.com',
            hiringEmail: 'hiring@globalsquirrels.com',
            website: 'https://globalsquirrels.com',
            footerLogo: 'https://globalmedsquirrels.s3.ap-south-1.amazonaws.com/notification-config/images/globalsquirrels/gs_image_0044.png'
        }
    };

    // Get organization configuration
    const orgConfig = ORG_CONFIG[squirrelType] || ORG_CONFIG.global;

    // Update hiring email visibility
    const hasHiringEmail = orgConfig.hiringEmail !== undefined;
    document.getElementById('preferredEmailContainer').style.display = hasHiringEmail ? 'block' : 'none';
    if (!hasHiringEmail) {
        document.getElementById('preferredEmail').value = 'support';
    }

    // Get all organization settings
    const orgName = orgConfig.name;
    const supportEmail = orgConfig.supportEmail;
    const hiringEmail = hasHiringEmail ? orgConfig.hiringEmail : supportEmail;
    const orgEmail = preferredEmail === 'support' ? supportEmail : hiringEmail;
    const orgWebsite = orgConfig.website;
    const footerLogo = orgConfig.footerLogo;

    let contentHTML = '';

    // Generate content from dynamic fields
    contentFields.forEach(fieldGroup => {
        if (fieldGroup.querySelector('.contentText')) {
            const text = fieldGroup.querySelector('.contentText').value;
            const alignmentSelect = fieldGroup.querySelector('.alignmentSelect');
            const alignment = alignmentSelect ? alignmentSelect.value : 'center';
            const textColorSelect = fieldGroup.querySelector('.textColorSelect');
            const textColor = textColorSelect ? textColorSelect.value : 'default';
            const colorStyle = textColor === 'default' ? '' : `color: ${textColor};`;
            const textContent = text.includes('${') ? text : text.replace(/\${([^}]+)}/g, '${$1}');
            contentHTML += `<tr><td style="font-size: 16px; line-height: 1.4; padding-bottom: 15px; text-align: ${alignment}; ${colorStyle}">${textContent}</td></tr>`;
        } else if (fieldGroup.querySelector('.buttonText')) {
            const buttonText = fieldGroup.querySelector('.buttonText').value;
            const buttonLink = fieldGroup.querySelector('.buttonLink').value;
            contentHTML += `
                <tr>
                    <td align="center" style="padding-bottom: 15px;">
                        <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" style="border-radius: 20px; background-color: #1f3462;">
                                    <a th:href="\${${buttonLink}}" target="_blank" style="display: inline-block; background-color: #1f3462; color: #ffffff; padding: 10px 30px; text-decoration: none; border-radius: 20px; font-size: 16px;">${buttonText}</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>`;
        } else if (fieldGroup.querySelector('.simple-table-rows')) {
            // Handle simple table
            const simpleTableRows = fieldGroup.querySelector('.simple-table-rows');
            const rows = simpleTableRows.querySelectorAll('.simple-table-row');

            if (rows.length > 0) {
                contentHTML += `
                    <tr>
                        <td style="padding-bottom: 15px;">
                            <table border="0" cellspacing="0" cellpadding="5" width="100%" style="border-collapse: collapse; table-layout: fixed;">`;

                rows.forEach(row => {
                    const rowType = row.getAttribute('data-row-type');

                    if (rowType === 'fullwidth') {
                        const fullWidthFields = row.querySelectorAll('.full-width-field-group');
                        fullWidthFields.forEach(fieldGroup => {
                            const textField = fieldGroup.querySelector('.fullWidthText');
                            const buttonTextField = fieldGroup.querySelector('.fullWidthButtonText');
                            const buttonLinkField = fieldGroup.querySelector('.fullWidthButtonLink');

                            if (textField && textField.value.trim()) {
                                const alignment = fieldGroup.querySelector('.fullWidthAlignment')?.value || 'center';
                                contentHTML += `
                                    <tr>
                                        <td colspan="100%" style="padding: 8px; text-align: ${alignment}; border: 1px solid #dee2e6; background-color: #ffffff;">
                                            ${textField.value}
                                        </td>
                                    </tr>`;
                            }

                            if (buttonTextField && buttonLinkField && buttonTextField.value.trim() && buttonLinkField.value.trim()) {
                                contentHTML += `
                                    <tr>
                                        <td colspan="100%" align="center" style="padding:12px 8px; border: 1px solid #dee2e6; background-color: #ffffff;">
                                            <table border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td align="center" style="border-radius: 20px; background-color: #1f3462;">
                                                        <a th:href="\${${buttonLinkField.value}}" target="_blank" style="display: inline-block; background-color: #1f3462; color: #ffffff; padding: 8px 20px; text-decoration: none; border-radius: 20px; font-size: 14px;">${buttonTextField.value}</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>`;
                            }
                        });
                    } else {
                        const cells = row.querySelectorAll('.tableCell');
                        if (cells.length > 0) {
                            const validCells = Array.from(cells).filter(cell => cell.value.trim());
                            if (validCells.length > 0) {
                                const cellWidth = Math.floor(100 / validCells.length);
                                contentHTML += '<tr>';
                                validCells.forEach((cell, index) => {
                                    const isLastCell = index === validCells.length - 1;
                                    const width = isLastCell ? 100 - (cellWidth * (validCells.length - 1)) : cellWidth;
                                    contentHTML += `<td style="padding:12px 8px; border: 1px solid #dee2e6; text-align: left; width: ${width}%; word-wrap: break-word; line-height: 1.4;">${cell.value}</td>`;
                                });
                                contentHTML += '</tr>';
                            }
                        }
                    }
                });

                contentHTML += `
                            </table>
                        </td>
                    </tr>`;
            }
        }
    });

    const template = `
<!DOCTYPE html>
<html>

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${orgName}</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
            }
            @media only screen and (max-width: 600px) {
                .container {
                    width: 100% !important;
                }
            }
        </style>
    </head>

    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
            <tr>
                <td align="center" style="padding: 15px;" bgcolor="#ffffff">
                    <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="border-radius: 20px; border: 1px solid #1f3462; overflow: hidden;">
                        <tr>
                            <td align="center" bgcolor="#e5f3ff" style="padding-top: 20px; border-radius: 20px 20px 0 0; overflow: hidden;">
                                <a href="javascript:void(0);" style="text-decoration: none; cursor: default !important;" onclick="return false;">
                                    <div style="background-image: url('${imageName}'); background-size: contain; background-repeat: no-repeat; background-position: center; width: ${imageWidth}px; height: ${imageHeight}px;"></div>
                                </a>
                            </td>
                        </tr>
                        <tr>
                        <td style="padding: 20px 5% 5px; text-align: center; color: #1f3462; background-color: #ffffff; overflow: hidden; ">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                ${contentHTML}
                            </table>
                        </td>
                    </tr>
                    ${(contactInfo || scheduleMeeting) ? `
                    <tr>
                        <td style="padding: 15px 5% 15px; text-align: center; color: #1f3462; border-top: 0.5px solid #BDBDBD; background-color: #F9F8FC; border-radius: 0 0 20px 20px; overflow: hidden; ">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                ${contactInfo ? `<tr><td style="font-size: 16px; line-height: 1.4; text-align: center;">If you have any questions or need assistance, please don't hesitate to contact us at <a href="mailto:${orgEmail}" target="_blank" style="color:rgb(22, 83, 214); text-decoration: none; cursor: pointer;">${orgEmail}</a></td></tr>` : ''}
                                ${(contactInfo && scheduleMeeting) ? ` <tr>
                            <td style="font-size: 16px; line-height: 1.4; padding-bottom: 15px; padding-top: 15px; text-align: center;">
                                or
                            </td>
                        </tr>` : ''}
                        ${scheduleMeeting ? `
                        <tr>
                            <td align="center"><table border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="border-radius: 20px; background-color: #1f3462;">
                                <a th:href="\${demoLink}" target="_blank" style="display: inline-block; background-color: #1f3462; color: #ffffff; padding: 10px 30px; text-decoration: none; border-radius: 20px; font-size: 16px; cursor: pointer;">Schedule a Meeting</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>` : ''}
        </table>
        </td>
                    </tr>
                    ` : ''}
                </table>
                ${includeFooter ? `<table border="0" cellpadding="0" cellspacing="0" width="600" class="container">
                    <tr>
                        <td bgcolor="#ffffff" align="center" style="padding: 20px; color: #1f3462;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" style="font-size: 14px; line-height: 1.4;">
                                        Best Regards
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="font-size: 14px; line-height: 1.4;">
                                        ${orgName} Support Team
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 15px;">
                                        <a href="${orgWebsite}" target="_blank" style="cursor: pointer;">
                                            <img src="${footerLogo}"
                                                 alt="${orgName} Logo" width="116"
                                        style="height: 50px; max-width: 116px;" />
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>` : ''}
            </td>
        </tr>
    </table>   
</body>

</html>`;

    // Update the preview iframe
    const previewIframe = document.getElementById('previewIframe');
    previewIframe.srcdoc = template;

    // Update the code preview
    const codePreview = document.getElementById('codePreview');
    codePreview.textContent = template;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('helpVariableName').addEventListener('input', updateHelpOutput);
    document.getElementById('dynamicValue').addEventListener('change', updateHelpOutput);
    document.querySelectorAll('input[name="format"]').forEach(radio => {
        radio.addEventListener('change', updateHelpOutput);
    });

    const requiredFields = ['fileName', 'imageName', 'imageWidth', 'imageHeight'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('input', () => {
            validateForm();
            updatePreview();
        });
    });

    setView('preview');
    setDevice('desktop');
    updatePreview();
    validateForm();
});

function downloadTemplate() {
    if (!validateForm()) {
        return;
    }

    const fileName = document.getElementById('fileName').value;
    const template = document.getElementById('previewIframe').srcdoc;

    const blob = new Blob([template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Animation: show checkmark
    const btn = document.getElementById('downloadBtn');
    btn.classList.add('downloaded');
    setTimeout(() => {
        btn.classList.remove('downloaded');
    }, 1500);
}

function markInvalidFields(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (value === '') {
        field.style.borderColor = '#ef4444';
    } else {
        field.style.borderColor = '#e5e7eb';
        field.style.backgroundColor = '#ffffff';
    }
}

// Add this function to validate the form
function validateForm() {
    const fileName = document.getElementById('fileName').value.trim();
    const imageName = document.getElementById('imageName').value.trim();
    const imageWidth = document.getElementById('imageWidth').value.trim();
    const imageHeight = document.getElementById('imageHeight').value.trim();

    const downloadButton = document.querySelector('button[onclick="downloadTemplate()"]');

    let isValid = fileName !== '' &&
        imageName !== '' &&
        imageWidth !== '' &&
        imageHeight !== '';

    markInvalidFields('fileName', fileName);
    markInvalidFields('imageName', imageName);
    markInvalidFields('imageWidth', imageWidth);
    markInvalidFields('imageHeight', imageHeight);

    const contentFieldsDiv = document.getElementById('contentFields');
    const fieldGroups = contentFieldsDiv.getElementsByClassName('field-group');

    Array.from(fieldGroups).forEach(fieldGroup => {
        const textArea = fieldGroup.querySelector('.contentText');
        if (textArea) {
            const isTextValid = textArea.value.trim() !== '';
            markDynamicField(textArea, isTextValid);
            isValid = isValid && isTextValid;
        }

        const buttonText = fieldGroup.querySelector('.buttonText');
        const buttonLink = fieldGroup.querySelector('.buttonLink');
        if (buttonText && buttonLink) {
            const isButtonTextValid = buttonText.value.trim() !== '';
            const isButtonLinkValid = buttonLink.value.trim() !== '';
            markDynamicField(buttonText, isButtonTextValid);
            markDynamicField(buttonLink, isButtonLinkValid);
            isValid = isValid && isButtonTextValid && isButtonLinkValid;
        }

        // Validate th:each dynamic table fields
        const dynamicTableRows = fieldGroup.querySelector('.dynamic-table-rows');
        if (dynamicTableRows) {
            // Validate collection and item names
            const collectionNameField = fieldGroup.querySelector('.tableCollectionName');
            const itemNameField = fieldGroup.querySelector('.tableItemName');

            if (collectionNameField) {
                const isCollectionValid = collectionNameField.value.trim() !== '';
                markDynamicField(collectionNameField, isCollectionValid);
                isValid = isValid && isCollectionValid;
            }

            if (itemNameField) {
                const isItemValid = itemNameField.value.trim() !== '';
                markDynamicField(itemNameField, isItemValid);
                isValid = isValid && isItemValid;
            }

            // Validate dynamic table rows
            const rows = dynamicTableRows.querySelectorAll('.dynamic-table-row');
            let hasValidRow = false;

            rows.forEach(row => {
                const rowType = row.getAttribute('data-row-type');

                if (rowType === 'fullwidth') {
                    const fullWidthFields = row.querySelectorAll('.dynamic-full-width-field-group');
                    let fullWidthHasContent = false;

                    fullWidthFields.forEach(fieldGroup => {
                        const textField = fieldGroup.querySelector('.dynamicFullWidthText');
                        const buttonTextField = fieldGroup.querySelector('.dynamicFullWidthButtonText');
                        const buttonLinkField = fieldGroup.querySelector('.dynamicFullWidthButtonLink');

                        if (textField) {
                            const isValid = textField.value.trim() !== '';
                            markDynamicField(textField, isValid);
                            if (isValid) fullWidthHasContent = true;
                        }

                        if (buttonTextField && buttonLinkField) {
                            const isTextValid = buttonTextField.value.trim() !== '';
                            const isLinkValid = buttonLinkField.value.trim() !== '';
                            markDynamicField(buttonTextField, isTextValid);
                            markDynamicField(buttonLinkField, isLinkValid);
                            if (isTextValid && isLinkValid) fullWidthHasContent = true;
                        }
                    });

                    if (fullWidthHasContent) hasValidRow = true;
                } else {
                    // Normal row validation
                    const labelInputs = row.querySelectorAll('.dynamicTableLabel');
                    const propertyInputs = row.querySelectorAll('.dynamicTableProperty');
                    let rowHasContent = false;

                    labelInputs.forEach((labelInput, index) => {
                        const propertyInput = propertyInputs[index];
                        const isLabelValid = labelInput.value.trim() !== '';
                        const isPropertyValid = propertyInput ? propertyInput.value.trim() !== '' : false;

                        markDynamicField(labelInput, isLabelValid);
                        if (propertyInput) markDynamicField(propertyInput, isPropertyValid);

                        if (isLabelValid && isPropertyValid) rowHasContent = true;
                    });

                    if (rowHasContent) hasValidRow = true;
                }
            });

            isValid = isValid && hasValidRow;
        }

        // Validate simple table fields
        const simpleTableRows = fieldGroup.querySelector('.simple-table-rows');
        if (simpleTableRows) {
            const rows = simpleTableRows.querySelectorAll('.simple-table-row');
            let hasValidRow = false;

            rows.forEach(row => {
                const rowType = row.getAttribute('data-row-type');

                if (rowType === 'fullwidth') {
                    const fullWidthFields = row.querySelectorAll('.full-width-field-group');
                    let fullWidthHasContent = false;

                    fullWidthFields.forEach(fieldGroup => {
                        const textField = fieldGroup.querySelector('.fullWidthText');
                        const buttonTextField = fieldGroup.querySelector('.fullWidthButtonText');
                        const buttonLinkField = fieldGroup.querySelector('.fullWidthButtonLink');

                        if (textField) {
                            const isValid = textField.value.trim() !== '';
                            markDynamicField(textField, isValid);
                            if (isValid) fullWidthHasContent = true;
                        }

                        if (buttonTextField && buttonLinkField) {
                            const isTextValid = buttonTextField.value.trim() !== '';
                            const isLinkValid = buttonLinkField.value.trim() !== '';
                            markDynamicField(buttonTextField, isTextValid);
                            markDynamicField(buttonLinkField, isLinkValid);
                            if (isTextValid && isLinkValid) fullWidthHasContent = true;
                        }
                    });

                    if (fullWidthHasContent) hasValidRow = true;
                } else {
                    // Normal row validation
                    const cells = row.querySelectorAll('.tableCell');
                    let rowHasContent = false;

                    cells.forEach(cell => {
                        const isCellValid = cell.value.trim() !== '';
                        markDynamicField(cell, isCellValid);
                        if (isCellValid) rowHasContent = true;
                    });

                    if (rowHasContent) hasValidRow = true;
                }
            });

            isValid = isValid && hasValidRow;
        }
    });

    downloadButton.disabled = !isValid;
    downloadButton.style.opacity = isValid ? '1' : '0.5';
    downloadButton.style.cursor = isValid ? 'pointer' : 'not-allowed';

    return isValid;
}

function markDynamicField(field, isValid) {
    if (!isValid) {
        field.style.borderColor = '#ef4444';
        field.style.backgroundColor = '#fef2f2';
    } else {
        field.style.borderColor = '#e5e7eb';
        field.style.backgroundColor = '#ffffff';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setView('preview');
    setDevice('desktop');
    updatePreview();
});
