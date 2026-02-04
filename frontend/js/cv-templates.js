/**
 * JoinWork - CV Templates
 * Multiple professional CV templates for users to choose from
 */

/**
 * CV Template 1: Modern Gradient (Default)
 */
function generateTemplate1(profileData) {
    const skills = profileData.skills ? parseSkills(profileData.skills) : [];
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
                <h2 style="color: #1a1a1a; background: #f0f7ff; border-bottom: 3px solid var(--color-primary); padding: 8px 12px; margin-bottom: var(--spacing-md); border-radius: 4px; font-weight: 600;">Education</h2>
                <div style="margin-bottom: var(--spacing-md); background: #ffffff; padding: 10px; border-left: 4px solid #e0e0e0;">
                    <h3 style="color: #1a1a1a; margin-bottom: var(--spacing-xs); font-weight: 600;">${escapeHTML(profileData.major || 'Major')}</h3>
                    <p style="color: #2d2d2d; margin-bottom: var(--spacing-xs);">${escapeHTML(profileData.university || 'University')}</p>
                    ${profileData.GPA ? `<p style="color: #4a4a4a; font-style: italic;">GPA: ${profileData.GPA.toFixed(2)} / 4.0</p>` : ''}
                </div>
            </div>
            ` : ''}

            ${skills.length > 0 ? `
            <div class="cv-section">
                <h2 style="color: #1a1a1a; background: #f0f7ff; border-bottom: 3px solid var(--color-primary); padding: 8px 12px; margin-bottom: var(--spacing-md); border-radius: 4px; font-weight: 600;">Skills</h2>
                <div class="cv-skills-list" style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
                    ${skills.map(skill => `<span class="skill-tag" style="background: #ffffff; color: #1a1a1a; padding: 6px 14px; border-radius: 4px; border: 2px solid var(--color-primary); font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${escapeHTML(skill)}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            ${profileData.experience ? `
            <div class="cv-section">
                <h2 style="color: #1a1a1a; background: #f0f7ff; border-bottom: 3px solid var(--color-primary); padding: 8px 12px; margin-bottom: var(--spacing-md); border-radius: 4px; font-weight: 600;">Professional Experience</h2>
                <div style="color: #1a1a1a; background: #ffffff; padding: 10px; border-radius: 4px; line-height: 1.8; white-space: pre-line;">${escapeHTML(profileData.experience)}</div>
            </div>
            ` : ''}

            ${profileData.projects ? `
            <div class="cv-section">
                <h2 style="color: #1a1a1a; background: #f0f7ff; border-bottom: 3px solid var(--color-primary); padding: 8px 12px; margin-bottom: var(--spacing-md); border-radius: 4px; font-weight: 600;">Projects</h2>
                <div style="color: #1a1a1a; background: #ffffff; padding: 10px; border-radius: 4px; line-height: 1.8; white-space: pre-line;">${escapeHTML(profileData.projects)}</div>
            </div>
            ` : ''}
        </div>
    `;
}

/**
 * CV Template 2: Classic Professional
 */
function generateTemplate2(profileData) {
    const skills = profileData.skills ? parseSkills(profileData.skills) : [];
    let displayName = profileData.full_name || 'Your Name';
    if (displayName === 'User' || displayName.trim() === '') {
        displayName = 'Your Name';
    }
    
    return `
        <div class="cv-section">
            <div style="text-align: center; padding: var(--spacing-xl) 0; border-bottom: 3px solid var(--color-primary); margin-bottom: var(--spacing-xl);">
                <h1 style="font-size: var(--font-size-4xl); color: var(--color-primary); margin: 0 0 var(--spacing-sm) 0; font-weight: bold;">${escapeHTML(displayName)}</h1>
                <p style="font-size: var(--font-size-base); color: var(--color-text-medium); margin: var(--spacing-xs) 0;">📧 ${escapeHTML(profileData.email || 'email@example.com')}</p>
                ${profileData.age ? `<p style="font-size: var(--font-size-base); color: var(--color-text-medium); margin: var(--spacing-xs) 0;">Age: ${profileData.age}</p>` : ''}
            </div>

            ${(profileData.university || profileData.major) ? `
            <div class="cv-section">
                <h2 style="font-size: var(--font-size-xl); color: #1a1a1a; background: #f0f7ff; padding: var(--spacing-sm) var(--spacing-md); margin-bottom: var(--spacing-md); border-left: 4px solid var(--color-primary); font-weight: 600; border-radius: 4px;">EDUCATION</h2>
                <div style="margin-left: var(--spacing-lg); margin-bottom: var(--spacing-md); background: #ffffff; padding: 10px; border-left: 4px solid #e0e0e0;">
                    <h3 style="font-size: var(--font-size-lg); color: #1a1a1a; margin-bottom: var(--spacing-xs); font-weight: 600;">${escapeHTML(profileData.major || 'Major')}</h3>
                    <p style="color: #2d2d2d; margin-bottom: var(--spacing-xs);">${escapeHTML(profileData.university || 'University')}</p>
                    ${profileData.GPA ? `<p style="color: #4a4a4a; font-size: var(--font-size-sm);">GPA: ${profileData.GPA.toFixed(2)} / 4.0</p>` : ''}
                </div>
            </div>
            ` : ''}

            ${skills.length > 0 ? `
            <div class="cv-section">
                <h2 style="font-size: var(--font-size-xl); color: #1a1a1a; background: #f0f7ff; padding: var(--spacing-sm) var(--spacing-md); margin-bottom: var(--spacing-md); border-left: 4px solid var(--color-primary); font-weight: 600; border-radius: 4px;">SKILLS</h2>
                <div style="margin-left: var(--spacing-lg); display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
                    ${skills.map(skill => `<span style="background: #ffffff; color: #1a1a1a; padding: 6px 14px; border-radius: 4px; border: 2px solid var(--color-primary); font-size: var(--font-size-sm); font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${escapeHTML(skill)}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            ${profileData.experience ? `
            <div class="cv-section">
                <h2 style="font-size: var(--font-size-xl); color: #1a1a1a; background: #f0f7ff; padding: var(--spacing-sm) var(--spacing-md); margin-bottom: var(--spacing-md); border-left: 4px solid var(--color-primary); font-weight: 600; border-radius: 4px;">PROFESSIONAL EXPERIENCE</h2>
                <div style="margin-left: var(--spacing-lg); background: #ffffff; padding: 10px; border-radius: 4px; color: #1a1a1a; line-height: 1.8; white-space: pre-line;">${escapeHTML(profileData.experience)}</div>
            </div>
            ` : ''}

            ${profileData.projects ? `
            <div class="cv-section">
                <h2 style="font-size: var(--font-size-xl); color: #1a1a1a; background: #f0f7ff; padding: var(--spacing-sm) var(--spacing-md); margin-bottom: var(--spacing-md); border-left: 4px solid var(--color-primary); font-weight: 600; border-radius: 4px;">PROJECTS</h2>
                <div style="margin-left: var(--spacing-lg); background: #ffffff; padding: 10px; border-radius: 4px; color: #1a1a1a; line-height: 1.8; white-space: pre-line;">${escapeHTML(profileData.projects)}</div>
            </div>
            ` : ''}
        </div>
    `;
}

/**
 * CV Template 3: Minimalist Clean
 */
function generateTemplate3(profileData) {
    const skills = profileData.skills ? parseSkills(profileData.skills) : [];
    let displayName = profileData.full_name || 'Your Name';
    if (displayName === 'User' || displayName.trim() === '') {
        displayName = 'Your Name';
    }
    
    return `
        <div class="cv-section">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-xl); margin-bottom: var(--spacing-xl); padding-bottom: var(--spacing-xl); border-bottom: 2px solid var(--color-bg-gray);">
                <div>
                    <h1 style="font-size: var(--font-size-3xl); color: var(--color-text-dark); margin: 0 0 var(--spacing-sm) 0; font-weight: 300; letter-spacing: 2px;">${escapeHTML(displayName)}</h1>
                </div>
                <div style="text-align: right;">
                    <p style="font-size: var(--font-size-sm); color: var(--color-text-medium); margin: var(--spacing-xs) 0;">${escapeHTML(profileData.email || 'email@example.com')}</p>
                    ${profileData.age ? `<p style="font-size: var(--font-size-sm); color: var(--color-text-medium); margin: var(--spacing-xs) 0;">Age: ${profileData.age}</p>` : ''}
                </div>
            </div>

            ${(profileData.university || profileData.major) ? `
            <div class="cv-section" style="margin-bottom: var(--spacing-xl);">
                <h2 style="font-size: var(--font-size-lg); color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--spacing-md); font-weight: 600;">Education</h2>
                <div style="padding-left: var(--spacing-lg); border-left: 2px solid var(--color-primary);">
                    <h3 style="font-size: var(--font-size-base); color: #1a1a1a; margin-bottom: var(--spacing-xs); font-weight: 600;">${escapeHTML(profileData.major || 'Major')}</h3>
                    <p style="color: #4a4a4a; margin-bottom: var(--spacing-xs); font-size: var(--font-size-sm);">${escapeHTML(profileData.university || 'University')}</p>
                    ${profileData.GPA ? `<p style="color: #6b6b6b; font-size: var(--font-size-xs);">GPA: ${profileData.GPA.toFixed(2)} / 4.0</p>` : ''}
                </div>
            </div>
            ` : ''}

            ${skills.length > 0 ? `
            <div class="cv-section" style="margin-bottom: var(--spacing-xl);">
                <h2 style="font-size: var(--font-size-lg); color: var(--color-text-dark); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--spacing-md); font-weight: 600;">Skills</h2>
                <div style="padding-left: var(--spacing-lg); border-left: 2px solid var(--color-primary); display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
                    ${skills.map(skill => `<span style="background: transparent; color: #1a1a1a; padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--color-primary); font-size: var(--font-size-sm); font-weight: 500;">${escapeHTML(skill)}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            ${profileData.experience ? `
            <div class="cv-section" style="margin-bottom: var(--spacing-xl);">
                <h2 style="font-size: var(--font-size-lg); color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--spacing-md); font-weight: 600;">Experience</h2>
                <div style="padding-left: var(--spacing-lg); border-left: 2px solid var(--color-primary); color: #2d2d2d; line-height: 1.8; white-space: pre-line; font-size: var(--font-size-sm);">${escapeHTML(profileData.experience)}</div>
            </div>
            ` : ''}

            ${profileData.projects ? `
            <div class="cv-section" style="margin-bottom: var(--spacing-xl);">
                <h2 style="font-size: var(--font-size-lg); color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--spacing-md); font-weight: 600;">Projects</h2>
                <div style="padding-left: var(--spacing-lg); border-left: 2px solid var(--color-primary); color: #2d2d2d; line-height: 1.8; white-space: pre-line; font-size: var(--font-size-sm);">${escapeHTML(profileData.projects)}</div>
            </div>
            ` : ''}
        </div>
    `;
}

/**
 * Get template by ID
 */
function getTemplate(templateId, profileData) {
    switch(templateId) {
        case 1:
            return generateTemplate1(profileData);
        case 2:
            return generateTemplate2(profileData);
        case 3:
            return generateTemplate3(profileData);
        default:
            return generateTemplate1(profileData);
    }
}

/**
 * Template metadata
 */
const CV_TEMPLATES = [
    {
        id: 1,
        name: 'Modern Gradient',
        description: 'Contemporary design with gradient header',
        preview: '🎨'
    },
    {
        id: 2,
        name: 'Classic Professional',
        description: 'Traditional format with section headers',
        preview: '📄'
    },
    {
        id: 3,
        name: 'Minimalist Clean',
        description: 'Simple and elegant two-column layout',
        preview: '✨'
    }
];

