/**
 * JoinWork - CV Generator
 * Generates professional CV and exports to PDF
 */

/**
 * Generate professional CV HTML
 * @param {object} profileData - User profile data
 * @returns {string} HTML string for CV
 */
function generateCVHTML(profileData) {
    const skills = profileData.skills ? parseSkills(profileData.skills) : [];
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 40px;
                    background: #ffffff;
                    color: #1a1a1a;
                    line-height: 1.6;
                }
                .cv-header {
                    background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }
                .cv-name {
                    font-size: 36px;
                    font-weight: bold;
                    margin: 0 0 10px 0;
                }
                .cv-contact {
                    font-size: 14px;
                    margin: 5px 0;
                }
                .cv-section {
                    margin-bottom: 25px;
                    page-break-inside: avoid;
                }
                .cv-section-title {
                    font-size: 20px;
                    color: #1a1a1a;
                    background: #f0f7ff;
                    border-bottom: 3px solid #4A90E2;
                    padding: 8px 12px;
                    margin-bottom: 15px;
                    font-weight: 600;
                    border-radius: 4px;
                }
                .cv-item {
                    margin-bottom: 15px;
                    background: #ffffff;
                    padding: 10px;
                    border-left: 4px solid #e0e0e0;
                }
                .cv-item-title {
                    font-weight: 600;
                    font-size: 16px;
                    color: #1a1a1a;
                    margin-bottom: 5px;
                }
                .cv-item-subtitle {
                    color: #2d2d2d;
                    font-size: 14px;
                    margin-bottom: 3px;
                }
                .cv-item-date {
                    color: #4a4a4a;
                    font-size: 12px;
                    font-style: italic;
                }
                .cv-skills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .cv-skill-tag {
                    background: #ffffff;
                    color: #1a1a1a;
                    padding: 6px 14px;
                    border-radius: 4px;
                    font-size: 13px;
                    border: 2px solid #4A90E2;
                    font-weight: 500;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .cv-text {
                    color: #1a1a1a;
                    line-height: 1.8;
                    white-space: pre-line;
                    background: #ffffff;
                    padding: 10px;
                    border-radius: 4px;
                }
                .cv-divider {
                    border-top: 1px solid #e0e0e0;
                    margin: 20px 0;
                }
                .cv-footer {
                    text-align: center;
                    color: #6b6b6b;
                    font-size: 11px;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #d0d0d0;
                }
            </style>
        </head>
        <body>
            <!-- Header -->
            <div class="cv-header">
                <div class="cv-name">${escapeHTML((profileData.full_name && profileData.full_name !== 'User') ? profileData.full_name : 'Your Name')}</div>
                <div class="cv-contact">📧 ${escapeHTML(profileData.email || 'email@example.com')}</div>
                ${profileData.age ? `<div class="cv-contact">Age: ${profileData.age}</div>` : ''}
            </div>

            <!-- Education Section -->
            ${(profileData.university || profileData.major) ? `
            <div class="cv-section">
                <div class="cv-section-title">Education</div>
                <div class="cv-item">
                    <div class="cv-item-title">${escapeHTML(profileData.major || 'Major')}</div>
                    <div class="cv-item-subtitle">${escapeHTML(profileData.university || 'University')}</div>
                    ${profileData.GPA ? `<div class="cv-item-date">GPA: ${profileData.GPA.toFixed(2)} / 4.0</div>` : ''}
                </div>
            </div>
            ` : ''}

            <!-- Skills Section -->
            ${skills.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-title">Skills</div>
                <div class="cv-skills">
                    ${skills.map(skill => `<span class="cv-skill-tag">${escapeHTML(skill)}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Experience Section -->
            ${profileData.experience ? `
            <div class="cv-section">
                <div class="cv-section-title">Professional Experience</div>
                <div class="cv-text">${escapeHTML(profileData.experience)}</div>
            </div>
            ` : ''}

            <!-- Projects Section -->
            ${profileData.projects ? `
            <div class="cv-section">
                <div class="cv-section-title">Projects</div>
                <div class="cv-text">${escapeHTML(profileData.projects)}</div>
            </div>
            ` : ''}

            <!-- Footer -->
            <div class="cv-footer">
                Generated by JoinWork on ${currentDate}
            </div>
        </body>
        </html>
    `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Export CV to PDF using html2pdf library
 * @param {object} profileData - User profile data
 * @param {number} templateId - Template ID to use (default: 1)
 */
async function exportCVToPDF(profileData, templateId = 1) {
    try {
        // Check if html2pdf is loaded
        if (typeof html2pdf === 'undefined') {
            // Load html2pdf library dynamically
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
            // Wait for library to fully load
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const skills = profileData.skills ? parseSkills(profileData.skills) : [];
        const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        
        // Create a properly structured container
        const cvContainer = document.createElement('div');
        cvContainer.id = 'pdf-cv-container';
        cvContainer.style.cssText = `
            font-family: Arial, sans-serif;
            padding: 20mm;
            color: #1a1a1a;
            line-height: 1.6;
            background: #ffffff;
            width: 170mm;
            min-height: 250mm;
            box-sizing: border-box;
        `;
        
        // Build the CV content
        let cvContent = '';
        
        // Ensure we have a proper name (not 'User')
        let displayName = profileData.full_name || 'Your Name';
        if (displayName === 'User' || displayName.trim() === '') {
            displayName = 'Your Name';
        }
        
        // Header
        cvContent += `
            <div style="background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%); color: #ffffff; padding: 20px; border-radius: 5px; margin-bottom: 25px;">
                <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0; color: #ffffff;">${escapeHTML(displayName)}</h1>
                <p style="font-size: 14px; margin: 5px 0; color: #ffffff;">Email: ${escapeHTML(profileData.email || 'email@example.com')}</p>
                ${profileData.age ? `<p style="font-size: 14px; margin: 5px 0; color: #ffffff;">Age: ${profileData.age}</p>` : ''}
            </div>
        `;
        
        // Education
        if (profileData.university || profileData.major) {
            cvContent += `
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 18px; color: #4A90E2; border-bottom: 2px solid #4A90E2; padding-bottom: 5px; margin-bottom: 10px; font-weight: bold;">EDUCATION</h2>
                    <p style="font-size: 16px; font-weight: bold; margin: 5px 0; color: #1a1a1a;">${escapeHTML(profileData.major || 'Major')}</p>
                    <p style="font-size: 14px; margin: 5px 0; color: #4a4a4a;">${escapeHTML(profileData.university || 'University')}</p>
                    ${profileData.GPA ? `<p style="font-size: 12px; margin: 5px 0; color: #6b6b6b; font-style: italic;">GPA: ${profileData.GPA.toFixed(2)} / 4.0</p>` : ''}
                </div>
            `;
        }
        
        // Skills
        if (skills.length > 0) {
            cvContent += `
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 18px; color: #4A90E2; border-bottom: 2px solid #4A90E2; padding-bottom: 5px; margin-bottom: 10px; font-weight: bold;">SKILLS</h2>
                    <div style="display: block;">
            `;
            skills.forEach(skill => {
                cvContent += `<span style="display: inline-block; background: #f5f5f5; color: #1a1a1a; padding: 5px 10px; border-radius: 3px; font-size: 12px; margin: 3px; border-left: 3px solid #4A90E2; font-weight: 500;">${escapeHTML(skill)}</span>`;
            });
            cvContent += `</div></div>`;
        }
        
        // Experience
        if (profileData.experience) {
            cvContent += `
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 18px; color: #4A90E2; border-bottom: 2px solid #4A90E2; padding-bottom: 5px; margin-bottom: 10px; font-weight: bold;">PROFESSIONAL EXPERIENCE</h2>
                    <div style="font-size: 14px; color: #2d2d2d; line-height: 1.8; white-space: pre-wrap;">${escapeHTML(profileData.experience)}</div>
                </div>
            `;
        }
        
        // Projects
        if (profileData.projects) {
            cvContent += `
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 18px; color: #4A90E2; border-bottom: 2px solid #4A90E2; padding-bottom: 5px; margin-bottom: 10px; font-weight: bold;">PROJECTS</h2>
                    <div style="font-size: 14px; color: #2d2d2d; line-height: 1.8; white-space: pre-wrap;">${escapeHTML(profileData.projects)}</div>
                </div>
            `;
        }
        
        // Footer
        cvContent += `
            <div style="text-align: center; color: #6b6b6b; font-size: 10px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #d0d0d0;">
                Generated by JoinWork on ${currentDate}
            </div>
        `;
        
        cvContainer.innerHTML = cvContent;
        
        // Append to body with proper positioning
        cvContainer.style.position = 'fixed';
        cvContainer.style.left = '0';
        cvContainer.style.top = '0';
        cvContainer.style.zIndex = '9999';
        document.body.appendChild(cvContainer);
        
        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Configure PDF options
        const opt = {
            margin: 0,
            filename: `${(profileData.full_name || 'CV').replace(/[^a-z0-9]/gi, '_')}_Resume.pdf`,
            image: { 
                type: 'jpeg', 
                quality: 1.0 
            },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: '#ffffff',
                width: cvContainer.scrollWidth,
                height: cvContainer.scrollHeight
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait'
            }
        };
        
        // Generate PDF
        const pdf = await html2pdf().set(opt).from(cvContainer).outputPdf('blob');
        
        // Create download link
        const url = URL.createObjectURL(pdf);
        const link = document.createElement('a');
        link.href = url;
        link.download = opt.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Clean up
        document.body.removeChild(cvContainer);
        
        return true;
    } catch (error) {
        console.error('PDF export error:', error);
        // Clean up on error
        const container = document.getElementById('pdf-cv-container');
        if (container) {
            document.body.removeChild(container);
        }
        throw new Error('Failed to export PDF: ' + error.message);
    }
}

/**
 * Load external script dynamically
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Check if script already exists
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Generate and display CV preview
 * @param {object} profileData - User profile data
 * @returns {string} HTML string for preview
 */
function generateCVPreview(profileData) {
    const skills = profileData.skills ? parseSkills(profileData.skills) : [];
    
    // Ensure we have a proper name (not 'User')
    let displayName = profileData.full_name || 'Your Name';
    if (displayName === 'User' || displayName.trim() === '') {
        displayName = 'Your Name';
    }
    
    return `
        <div class="cv-section">
            <div class="cv-header" style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%); color: white; padding: var(--spacing-xl); border-radius: var(--radius-lg); margin-bottom: var(--spacing-xl);">
                <h1 class="cv-name" style="font-size: var(--font-size-3xl); margin: 0 0 var(--spacing-sm) 0;">${escapeHTML(displayName)}</h1>
                <div style="font-size: var(--font-size-base);">
                    <p style="margin: var(--spacing-xs) 0;">📧 ${escapeHTML(profileData.email || 'email@example.com')}</p>
                    ${profileData.age ? `<p style="margin: var(--spacing-xs) 0;">Age: ${profileData.age}</p>` : ''}
                </div>
            </div>

            ${(profileData.university || profileData.major) ? `
            <div class="cv-section">
                <h2 style="color: var(--color-primary); border-bottom: 2px solid var(--color-primary); padding-bottom: var(--spacing-xs); margin-bottom: var(--spacing-md);">Education</h2>
                <div style="margin-bottom: var(--spacing-md);">
                    <h3 style="color: #1a1a1a; margin-bottom: var(--spacing-xs); font-weight: 600;">${escapeHTML(profileData.major || 'Major')}</h3>
                    <p style="color: #4a4a4a; margin-bottom: var(--spacing-xs);">${escapeHTML(profileData.university || 'University')}</p>
                    ${profileData.GPA ? `<p style="color: #6b6b6b; font-style: italic;">GPA: ${profileData.GPA.toFixed(2)} / 4.0</p>` : ''}
                </div>
            </div>
            ` : ''}

            ${skills.length > 0 ? `
            <div class="cv-section">
                <h2 style="color: var(--color-primary); border-bottom: 2px solid var(--color-primary); padding-bottom: var(--spacing-xs); margin-bottom: var(--spacing-md);">Skills</h2>
                <div class="cv-skills-list" style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
                    ${skills.map(skill => `<span class="skill-tag" style="background: var(--color-bg-gray); padding: var(--spacing-xs) var(--spacing-sm); border-radius: var(--radius-sm); border-left: 3px solid var(--color-primary);">${escapeHTML(skill)}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            ${profileData.experience ? `
            <div class="cv-section">
                <h2 style="color: var(--color-primary); border-bottom: 2px solid var(--color-primary); padding-bottom: var(--spacing-xs); margin-bottom: var(--spacing-md);">Professional Experience</h2>
                <div style="color: #2d2d2d; line-height: 1.8; white-space: pre-line;">${escapeHTML(profileData.experience)}</div>
            </div>
            ` : ''}

            ${profileData.projects ? `
            <div class="cv-section">
                <h2 style="color: var(--color-primary); border-bottom: 2px solid var(--color-primary); padding-bottom: var(--spacing-xs); margin-bottom: var(--spacing-md);">Projects</h2>
                <div style="color: #2d2d2d; line-height: 1.8; white-space: pre-line;">${escapeHTML(profileData.projects)}</div>
            </div>
            ` : ''}
        </div>
    `;
}

