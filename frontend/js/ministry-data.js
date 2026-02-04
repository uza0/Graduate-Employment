/**
 * Ministry Portal Data Layer (frontend-only mock)
 * Stores data in localStorage to simulate CRUD until backend endpoints are added.
 */

const STORAGE_KEYS = {
  registrations: 'ministry_registrations',
  workshops: 'ministry_workshops',
  announcements: 'ministry_announcements',
  services: 'ministry_services',
  messages: 'ministry_messages'
};

function loadCollection(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`[MINISTRY] Failed to load ${key}:`, e);
    return fallback;
  }
}

function saveCollection(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[MINISTRY] Failed to save ${key}:`, e);
  }
}

function seedIfEmpty() {
  if (!localStorage.getItem(STORAGE_KEYS.workshops)) {
    saveCollection(STORAGE_KEYS.workshops, [
      { id: 1, title: 'Interview Skills 101', category: 'Career', date: '2025-01-15', trainer: 'HR Dept', status: 'active', capacity: 50, registered: 18 },
      { id: 2, title: 'Cybersecurity Basics', category: 'IT', date: '2025-02-05', trainer: 'Cyber Unit', status: 'active', capacity: 40, registered: 12 }
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.announcements)) {
    saveCollection(STORAGE_KEYS.announcements, [
      { id: 1, title: 'Graduate Employment Fair', description: 'Join the national fair for hiring graduates.', date: '2025-01-05', attachments: [] },
      { id: 2, title: 'Scholarship Applications Open', description: 'Apply for scholarships for postgraduate studies.', date: '2025-01-20', attachments: [] }
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.services)) {
    saveCollection(STORAGE_KEYS.services, [
      { id: 1, name: 'Degree Verification', category: 'Verification', description: 'Official verification of academic degrees.', documents: ['National ID', 'University Certificate'] },
      { id: 2, name: 'Job Placement Support', category: 'Employment', description: 'Connect graduates with employers.', documents: ['Updated CV'] },
      { id: 3, name: 'Workshop Enrollment', category: 'Training', description: 'Enroll in ministry-led workshops.', documents: ['National ID'] }
    ]);
  }
}

seedIfEmpty();

// Registrations (student employment interviews)
function addRegistration(payload) {
  const registrations = loadCollection(STORAGE_KEYS.registrations);
  const id = registrations.length ? Math.max(...registrations.map(r => r.id)) + 1 : 1;
  const record = { id, status: 'pending', created_at: new Date().toISOString(), ...payload };
  registrations.push(record);
  saveCollection(STORAGE_KEYS.registrations, registrations);
  return record;
}

function updateRegistrationStatus(id, status) {
  const registrations = loadCollection(STORAGE_KEYS.registrations);
  const idx = registrations.findIndex(r => r.id === id);
  if (idx >= 0) {
    registrations[idx].status = status;
    saveCollection(STORAGE_KEYS.registrations, registrations);
    return registrations[idx];
  }
  return null;
}

// Workshops
function addWorkshop(payload) {
  const workshops = loadCollection(STORAGE_KEYS.workshops);
  const id = workshops.length ? Math.max(...workshops.map(w => w.id)) + 1 : 1;
  const record = { id, status: 'active', registered: 0, ...payload };
  workshops.push(record);
  saveCollection(STORAGE_KEYS.workshops, workshops);
  return record;
}

function updateWorkshop(id, updates) {
  const workshops = loadCollection(STORAGE_KEYS.workshops);
  const idx = workshops.findIndex(w => w.id === id);
  if (idx >= 0) {
    workshops[idx] = { ...workshops[idx], ...updates };
    saveCollection(STORAGE_KEYS.workshops, workshops);
    return workshops[idx];
  }
  return null;
}

function registerForWorkshop(id, registrant) {
  const workshops = loadCollection(STORAGE_KEYS.workshops);
  const workshop = workshops.find(w => w.id === id && w.status === 'active');
  if (!workshop) return null;
  workshop.registered = (workshop.registered || 0) + 1;
  saveCollection(STORAGE_KEYS.workshops, workshops);
  // Track as message for simplicity
  addMessage({
    subject: `Workshop Registration: ${workshop.title}`,
    email: registrant.email,
    name: registrant.name,
    body: `${registrant.name} registered for ${workshop.title}`
  });
  return workshop;
}

// Announcements
function addAnnouncement(payload) {
  const announcements = loadCollection(STORAGE_KEYS.announcements);
  const id = announcements.length ? Math.max(...announcements.map(a => a.id)) + 1 : 1;
  const record = { id, attachments: [], ...payload };
  announcements.push(record);
  saveCollection(STORAGE_KEYS.announcements, announcements);
  return record;
}

function updateAnnouncement(id, updates) {
  const announcements = loadCollection(STORAGE_KEYS.announcements);
  const idx = announcements.findIndex(a => a.id === id);
  if (idx >= 0) {
    announcements[idx] = { ...announcements[idx], ...updates };
    saveCollection(STORAGE_KEYS.announcements, announcements);
    return announcements[idx];
  }
  return null;
}

// Services
function addService(payload) {
  const services = loadCollection(STORAGE_KEYS.services);
  const id = services.length ? Math.max(...services.map(s => s.id)) + 1 : 1;
  const record = { id, ...payload };
  services.push(record);
  saveCollection(STORAGE_KEYS.services, services);
  return record;
}

// Messages (contact/support)
function addMessage(payload) {
  const messages = loadCollection(STORAGE_KEYS.messages);
  const id = messages.length ? Math.max(...messages.map(m => m.id)) + 1 : 1;
  const record = { id, status: 'open', created_at: new Date().toISOString(), ...payload };
  messages.push(record);
  saveCollection(STORAGE_KEYS.messages, messages);
  return record;
}

function replyMessage(id, replyText) {
  const messages = loadCollection(STORAGE_KEYS.messages);
  const idx = messages.findIndex(m => m.id === id);
  if (idx >= 0) {
    messages[idx].reply = replyText;
    messages[idx].status = 'answered';
    saveCollection(STORAGE_KEYS.messages, messages);
    return messages[idx];
  }
  return null;
}

// Export helpers for inline script usage
window.MinistryData = {
  STORAGE_KEYS,
  loadCollection,
  saveCollection,
  addRegistration,
  updateRegistrationStatus,
  addWorkshop,
  updateWorkshop,
  registerForWorkshop,
  addAnnouncement,
  updateAnnouncement,
  addService,
  addMessage,
  replyMessage,
};

