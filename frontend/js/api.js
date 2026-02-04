/**
 * JoinWork - Serverless Firestore API (no backend)
 * All data operations use Firebase Web SDK (getDocs, addDoc, setDoc, updateDoc, query).
 * Load firebase-config.js before this file.
 */

function getDb() {
  if (typeof window !== 'undefined' && window.db) return window.db;
  throw new Error('Firestore not initialized. Load Firebase SDK and firebase-config.js first.');
}

/** SHA-256 hash for password (match backend). */
function hashPassword(password) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
    .then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
}

function serializeDoc(docSnap, idField) {
  if (!docSnap || !docSnap.exists) return null;
  var d = docSnap.data();
  var id = docSnap.id;
  if (idField) d[idField] = id.match(/^\d+$/) ? parseInt(id, 10) : id;
  return d;
}

/** Get next numeric ID for a collection (transaction on counters/main). */
function getNextId(collectionName) {
  var db = getDb();
  var counterRef = db.collection('counters').doc('main');
  return db.runTransaction(function (transaction) {
    return transaction.get(counterRef).then(function (snap) {
      var data = snap.exists ? snap.data() : {};
      var next = (data[collectionName] || 0) + 1;
      var update = {};
      update[collectionName] = next;
      transaction.set(counterRef, update, { merge: true });
      return next;
    });
  });
}

/**
 * Ensure counters/main exists in Firestore. If not, create it with all fields set to 0.
 * Call this on Login/Signup page load so getNextId() always has a valid document.
 */
function initializeCounters() {
  var db = getDb();
  var counterRef = db.collection('counters').doc('main');
  return counterRef.get().then(function (snap) {
    if (snap.exists) return Promise.resolve();
    return counterRef.set({
      users: 0,
      graduates: 0,
      companies: 0,
      jobs: 0,
      applications: 0,
      workshops: 0
    });
  });
}

if (typeof window !== 'undefined') {
  window.initializeCounters = initializeCounters;
}

// ---------------------------------------------------------------------------
// AUTH (Login / Signup use Firestore users collection directly)
// ---------------------------------------------------------------------------

var authAPI = {
  login: function (email, password) {
    var normalizedEmail = (email || '').trim().toLowerCase();
    var db = getDb();
    return db.collection('users').where('email', '==', normalizedEmail).limit(1).get()
      .then(function (snap) {
        if (snap.empty) throw new Error('Invalid email or password');
        var doc = snap.docs[0];
        var user = doc.data();
        var userId = doc.id;
        return hashPassword(password).then(function (hash) {
          if (user.password_hash !== hash) throw new Error('Invalid email or password');
          var uid = userId.match(/^\d+$/) ? parseInt(userId, 10) : userId;
          return {
            token: 'firebase-' + userId,
            user: {
              user_id: uid,
              full_name: user.full_name || '',
              email: user.email || '',
              role: user.role || 'graduate'
            }
          };
        });
      });
  },

  signup: function (userData) {
    var db = getDb();
    var email = (userData.email || '').trim().toLowerCase();
    return db.collection('users').where('email', '==', email).limit(1).get()
      .then(function (snap) {
        if (!snap.empty) throw new Error('Email already registered');
        return hashPassword(userData.password);
      })
      .then(function (passwordHash) {
        return getNextId('users').then(function (userId) {
          var uid = String(userId);
          var userRef = db.collection('users').doc(uid);
          var created = {
            full_name: userData.full_name || '',
            email: email,
            password_hash: passwordHash,
            role: userData.role || 'graduate',
            created_at: new Date().toISOString()
          };
          return userRef.set(created).then(function () {
            var role = userData.role || 'graduate';
            if (role === 'graduate') {
              return getNextId('graduates').then(function (gid) {
                var gradRef = db.collection('graduates').doc(String(gid));
                var cardNum = (userData.unified_card_number || '').trim().replace(/\s/g, '');
                return gradRef.set({
                  user_id: userId,
                  university: userData.university || '',
                  major: userData.major || '',
                  unified_card_number: cardNum,
                  skills: userData.skills || '',
                  age: userData.age != null ? userData.age : null,
                  date_of_birth: userData.date_of_birth || '',
                  gender: userData.gender || '',
                  profile_picture: userData.profile_picture || '',
                  projects: userData.projects || '',
                  experience: userData.experience || ''
                }).then(function () { return userId; });
              });
            }
            if (role === 'company') {
              return getNextId('companies').then(function (cid) {
                var companyRef = db.collection('companies').doc(String(cid));
                return companyRef.set({
                  user_id: userId,
                  company_name: (userData.company_name || '').trim(),
                  sector: (userData.sector || '').trim(),
                  location: (userData.location || '').trim()
                }).then(function () { return userId; });
              });
            }
            return Promise.resolve(userId);
          }).then(function () {
            return {
              token: 'firebase-' + uid,
              user: {
                user_id: userId,
                full_name: created.full_name,
                email: created.email,
                role: created.role
              }
            };
          });
        });
      });
  },

  logout: function () {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    var path = window.location.pathname || '';
    if (path.indexOf('/pages/') !== -1) {
      window.location.href = path.substring(0, path.lastIndexOf('/') + 1) + 'login.html';
    } else {
      window.location.href = 'pages/login.html';
    }
  },

  getCurrentUser: function () {
    var raw = localStorage.getItem('userData');
    if (!raw) return Promise.reject(new Error('Not authenticated'));
    try {
      return Promise.resolve(JSON.parse(raw));
    } catch (e) {
      return Promise.reject(new Error('Not authenticated'));
    }
  }
};

// ---------------------------------------------------------------------------
// GRADUATES
// ---------------------------------------------------------------------------

var graduatesAPI = {
  getProfile: function (graduateId) {
    var db = getDb();
    return db.collection('graduates').doc(String(graduateId)).get()
      .then(function (snap) {
        if (!snap.exists) throw new Error('Graduate not found');
        var d = serializeDoc(snap, 'graduate_id');
        var uid = d.user_id;
        return db.collection('users').doc(String(uid)).get().then(function (uSnap) {
          if (uSnap.exists) {
            var u = uSnap.data();
            d.full_name = u.full_name || '';
            d.email = u.email || '';
          }
          return d;
        });
      });
  },

  getProfileByUser: function (userId) {
    var db = getDb();
    return db.collection('graduates').where('user_id', '==', parseInt(userId, 10)).limit(1).get()
      .then(function (snap) {
        if (snap.empty) throw new Error('Graduate profile not found');
        var doc = snap.docs[0];
        var d = serializeDoc(doc, 'graduate_id');
        return db.collection('users').doc(String(userId)).get().then(function (uSnap) {
          if (uSnap.exists) {
            var u = uSnap.data();
            d.full_name = u.full_name || '';
            d.email = u.email || '';
          }
          return d;
        });
      });
  },

  createProfile: function (data) {
    var db = getDb();
    var userData = JSON.parse(localStorage.getItem('userData') || '{}');
    var userId = userData.user_id;
    return db.collection('graduates').where('user_id', '==', userId).limit(1).get()
      .then(function (snap) {
        if (!snap.empty) throw new Error('Profile already exists');
        return getNextId('graduates');
      })
      .then(function (gid) {
        var ref = db.collection('graduates').doc(String(gid));
        var payload = {
          user_id: userId,
          university: data.university || '',
          major: data.major || '',
          unified_card_number: (data.unified_card_number || '').trim().replace(/\s/g, ''),
          skills: data.skills || '',
          age: data.age != null ? data.age : null,
          projects: data.projects || '',
          experience: data.experience || ''
        };
        return ref.set(payload).then(function () {
          return { graduate_id: gid, user_id: userId, ...payload };
        });
      });
  },

  updateProfile: function (graduateId, data) {
    var db = getDb();
    var ref = db.collection('graduates').doc(String(graduateId));
    var updates = {};
    ['university', 'major', 'skills', 'date_of_birth', 'gender', 'profile_picture', 'projects', 'experience'].forEach(function (k) {
      if (data[k] !== undefined) updates[k] = data[k];
    });
    if (data.unified_card_number !== undefined) updates.unified_card_number = (data.unified_card_number || '').trim().replace(/\s/g, '');
    if (data.age !== undefined) updates.age = data.age;
    return ref.update(updates).then(function () { return ref.get(); }).then(function (snap) {
      return serializeDoc(snap, 'graduate_id');
    });
  },

  search: function (filters) {
    var db = getDb();
    var q = db.collection('graduates');
    if (filters.major) q = q.where('major', '==', filters.major);
    return q.get().then(function (snap) {
      var list = [];
      snap.docs.forEach(function (d) {
        list.push(serializeDoc(d, 'graduate_id'));
      });
      return { graduates: list, total: list.length };
    });
  }
};

// ---------------------------------------------------------------------------
// JOBS
// ---------------------------------------------------------------------------

var jobsAPI = {
  getAll: function (filters) {
    var db = getDb();
    var q = db.collection('jobs');
    if (filters && filters.company_id) q = q.where('company_id', '==', parseInt(filters.company_id, 10));
    if (filters && filters.status) q = q.where('status', '==', filters.status);
    return q.get().then(function (snap) {
      var jobs = [];
      return Promise.all(snap.docs.map(function (d) {
        var j = serializeDoc(d, 'job_id');
        return db.collection('companies').doc(String(j.company_id)).get().then(function (cSnap) {
          j.company_name = cSnap.exists ? cSnap.data().company_name : 'Unknown Company';
          jobs.push(j);
        });
      })).then(function () { return { jobs: jobs, total: jobs.length }; });
    });
  },

  getById: function (jobId) {
    var db = getDb();
    return db.collection('jobs').doc(String(jobId)).get()
      .then(function (snap) {
        if (!snap.exists) throw new Error('Job not found');
        var j = serializeDoc(snap, 'job_id');
        return db.collection('companies').doc(String(j.company_id)).get().then(function (cSnap) {
          j.company_name = cSnap.exists ? cSnap.data().company_name : 'Unknown Company';
          return j;
        });
      });
  },

  create: function (jobData) {
    var db = getDb();
    var userData = JSON.parse(localStorage.getItem('userData') || '{}');
    var userId = userData.user_id;
    return db.collection('companies').where('user_id', '==', userId).limit(1).get()
      .then(function (snap) {
        if (snap.empty) throw new Error('Company profile not found');
        var company = serializeDoc(snap.docs[0], 'company_id');
        return getNextId('jobs').then(function (jobId) {
          var ref = db.collection('jobs').doc(String(jobId));
          return ref.set({
            company_id: company.company_id,
            title: jobData.title,
            description: jobData.description,
            location: jobData.location,
            salary: jobData.salary != null ? jobData.salary : null,
            skills_required: jobData.skills_required || '',
            employment_type: jobData.employment_type || 'full-time',
            status: 'active',
            created_at: new Date().toISOString()
          }).then(function () { return ref.get(); }).then(function (s) { return serializeDoc(s, 'job_id'); });
        });
      });
  },

  update: function (jobId, jobData) {
    var db = getDb();
    var ref = db.collection('jobs').doc(String(jobId));
    var updates = {};
    ['title', 'description', 'location', 'salary', 'skills_required', 'employment_type', 'status'].forEach(function (k) {
      if (jobData[k] !== undefined) updates[k] = jobData[k];
    });
    return ref.update(updates).then(function () { return ref.get(); }).then(function (s) { return serializeDoc(s, 'job_id'); });
  },

  delete: function (jobId) {
    return getDb().collection('jobs').doc(String(jobId)).delete().then(function () { return { message: 'Job deleted successfully' }; });
  },

  apply: function (jobId, coverLetter) {
    var db = getDb();
    var userData = JSON.parse(localStorage.getItem('userData') || '{}');
    var userId = userData.user_id;
    if (userData.role !== 'graduate') return Promise.reject(new Error('Only graduates can apply for jobs'));
    return db.collection('graduates').where('user_id', '==', userId).limit(1).get()
      .then(function (gSnap) {
        var graduate;
        if (gSnap.empty) {
          return getNextId('graduates').then(function (gid) {
            return db.collection('graduates').doc(String(gid)).set({
              user_id: userId,
              university: '',
              major: '',
              unified_card_number: '',
              skills: '',
              age: null,
              projects: '',
              experience: ''
            }).then(function () { return gid; });
          });
        }
        return Promise.resolve(parseInt(gSnap.docs[0].id, 10));
      })
      .then(function () {
        return db.collection('applications').where('job_id', '==', parseInt(jobId, 10)).where('graduate_id', '==', graduateId).limit(1).get();
      })
      .then(function (aSnap) {
        if (!aSnap.empty) throw new Error('You have already applied for this job');
        return getNextId('applications');
      })
      .then(function (appId) {
        return db.collection('applications').doc(String(appId)).set({
          job_id: parseInt(jobId, 10),
          graduate_id: graduateId,
          status: 'pending',
          cover_letter: coverLetter || '',
          applied_date: new Date().toISOString()
        }).then(function () {
          return { application_id: appId, job_id: parseInt(jobId, 10), graduate_id: graduateId, status: 'pending', cover_letter: coverLetter || '', applied_date: new Date().toISOString() };
        });
      });
  },

  getApplications: function (jobId) {
    var db = getDb();
    return db.collection('applications').where('job_id', '==', parseInt(jobId, 10)).get()
      .then(function (snap) {
        var apps = [];
        return Promise.all(snap.docs.map(function (d) {
          var a = serializeDoc(d, 'application_id');
          return db.collection('graduates').doc(String(a.graduate_id)).get().then(function (gSnap) {
            if (gSnap.exists) {
              var g = gSnap.data();
              a.graduate_major = g.major || '';
              a.graduate_university = g.university || '';
              a.graduate_gpa = g.GPA;
              a.graduate_skills = g.skills || '';
              var uid = g.user_id;
              return db.collection('users').doc(String(uid)).get().then(function (uSnap) {
                if (uSnap.exists) {
                  var u = uSnap.data();
                  a.graduate_name = u.full_name || '';
                  a.graduate_email = u.email || '';
                }
                apps.push(a);
              });
            } else { apps.push(a); }
          });
        })).then(function () { return { applications: apps, total: apps.length }; });
      });
  },

  saveJob: function () { return Promise.resolve({}); },
  getSavedJobs: function () { return Promise.resolve({ jobs: [] }); }
};

// ---------------------------------------------------------------------------
// APPLICATIONS
// ---------------------------------------------------------------------------

var applicationsAPI = {
  updateStatus: function (applicationId, status) {
    return getDb().collection('applications').doc(String(applicationId)).update({ status: status })
      .then(function () {
        return getDb().collection('applications').doc(String(applicationId)).get();
      })
      .then(function (snap) { return serializeDoc(snap, 'application_id'); });
  }
};

// ---------------------------------------------------------------------------
// COMPANIES
// ---------------------------------------------------------------------------

var companiesAPI = {
  getProfile: function (companyId) {
    return getDb().collection('companies').doc(String(companyId)).get()
      .then(function (snap) {
        if (!snap.exists) throw new Error('Company not found');
        return serializeDoc(snap, 'company_id');
      });
  },

  getProfileByUser: function (userId) {
    var db = getDb();
    return db.collection('companies').where('user_id', '==', parseInt(userId, 10)).limit(1).get()
      .then(function (snap) {
        if (snap.empty) {
          var userData = JSON.parse(localStorage.getItem('userData') || '{}');
          var name = (userData.full_name || 'Company ' + userId).trim();
          return getNextId('companies').then(function (cid) {
            return db.collection('companies').doc(String(cid)).set({
              user_id: parseInt(userId, 10),
              company_name: name,
              sector: '',
              location: ''
            }).then(function () { return db.collection('companies').doc(String(cid)).get(); });
          }).then(function (s) { return serializeDoc(s, 'company_id'); });
        }
        return serializeDoc(snap.docs[0], 'company_id');
      });
  },

  updateProfile: function (companyId, data) {
    var ref = getDb().collection('companies').doc(String(companyId));
    var updates = {};
    ['company_name', 'sector', 'location'].forEach(function (k) { if (data[k] !== undefined) updates[k] = data[k]; });
    return ref.update(updates).then(function () { return ref.get(); }).then(function (s) { return serializeDoc(s, 'company_id'); });
  },

  getJobs: function (companyId) {
    return jobsAPI.getAll({ company_id: companyId });
  }
};

// ---------------------------------------------------------------------------
// WORKSHOPS
// ---------------------------------------------------------------------------

var workshopsAPI = {
  getAll: function () {
    return getDb().collection('workshops').get().then(function (snap) {
      var list = [];
      snap.docs.forEach(function (d) { list.push(serializeDoc(d, 'workshop_id')); });
      return { workshops: list, total: list.length };
    });
  },

  getById: function (workshopId) {
    return getDb().collection('workshops').doc(String(workshopId)).get()
      .then(function (snap) {
        if (!snap.exists) throw new Error('Workshop not found');
        return serializeDoc(snap, 'workshop_id');
      });
  },

  create: function (data) {
    return getNextId('workshops').then(function (id) {
      return getDb().collection('workshops').doc(String(id)).set(data).then(function () { return { workshop_id: id, ...data }; });
    });
  },

  update: function (workshopId, data) {
    return getDb().collection('workshops').doc(String(workshopId)).update(data).then(function () { return data; });
  },

  delete: function (workshopId) {
    return getDb().collection('workshops').doc(String(workshopId)).delete().then(function () { return {}; });
  },

  register: function (workshopId) {
    return Promise.resolve({});
  }
};

// ---------------------------------------------------------------------------
// ANALYTICS (stub for ministry)
// ---------------------------------------------------------------------------

var analyticsAPI = {
  getGraduateStats: function () { return Promise.resolve({}); },
  getJobStats: function () { return Promise.resolve({}); },
  getSkillsGap: function () { return Promise.resolve({}); },
  getUniversityReports: function () { return Promise.resolve({}); }
};

// ---------------------------------------------------------------------------
// CV (client-side only, no backend)
// ---------------------------------------------------------------------------

var cvAPI = {
  generate: function (graduateId) { return Promise.reject(new Error('Use profile page to generate CV')); },
  exportPDF: function (graduateId) { return Promise.reject(new Error('Use profile page to export PDF')); }
};

/** Development: get all collections for database viewer (same shape as old /api/admin/database). */
function getDatabaseSnapshot() {
  var db = getDb();
  function all(collectionName, idField) {
    return db.collection(collectionName).get().then(function (snap) {
      var list = [];
      snap.docs.forEach(function (d) {
        var o = d.data();
        o[idField] = d.id.match(/^\d+$/) ? parseInt(d.id, 10) : d.id;
        list.push(o);
      });
      return list;
    });
  }
  return Promise.all([
    all('users', 'user_id'),
    all('graduates', 'graduate_id'),
    all('companies', 'company_id'),
    all('jobs', 'job_id'),
    all('applications', 'application_id'),
    all('workshops', 'workshop_id')
  ]).then(function (arr) {
    var users = arr[0], graduates = arr[1], companies = arr[2], jobs = arr[3], applications = arr[4], workshops = arr[5];
    return {
      data: {
        users: users,
        graduates: graduates,
        companies: companies,
        jobs: jobs,
        applications: applications,
        workshops: workshops,
        stats: {
          total_users: users.length,
          total_graduates: graduates.length,
          total_companies: companies.length,
          total_jobs: jobs.length,
          total_applications: applications.length,
          total_workshops: workshops.length
        }
      }
    };
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { authAPI, graduatesAPI, jobsAPI, companiesAPI, applicationsAPI, workshopsAPI, analyticsAPI, cvAPI, getDatabaseSnapshot };
}

// graduateId was used in apply() - need to fix: the variable graduateId in the apply flow. Let me re-read. In the apply flow we have .then(function (graduateId) { ... return db.collection('applications')... where graduate_id == graduateId. So graduateId must be the numeric id. In the first then we return either a new graduate id (from getNextId) or the existing doc id (parseInt(gSnap.docs[0].id, 10)). So we're good. But wait - in the second then we have "return Promise.resolve(parseInt(gSnap.docs[0].id, 10))" but at that point we might have created a new graduate - so we need to pass the graduateId to the next then. Let me fix the apply flow: we need a single variable that holds the graduate_id (number) after the first block. So: .then(function (gSnap) { if empty create and return new id; else return existing id; }).then(function (graduateId) { check application exists; then create application with graduateId; }). I had a bug: in the empty branch we return getNextId and then set the doc and return gid. So we get graduateId = gid. In the non-empty branch we return parseInt(gSnap.docs[0].id, 10). So graduateId is set. But in the create branch we have "return ref.set(...).then(function () { return gid; });" so we return gid. Good. But then the next .then(function (graduateId) - we're using graduateId but in the create branch we also need to pass it to the applications where clause. So we need to fix the variable - in the second then we have "graduate_id: graduateId" but graduateId might not be defined in the inner then of getNextId. Let me look again... Actually in the flow: .then(function (gSnap) { if empty return getNextId('graduates').then(function(gid) { return db...set(...).then(() => gid); }); return Promise.resolve(parseInt(gSnap.docs[0].id, 10)); }). So we get a single value (graduateId number). Then .then(function (graduateId) { return db.collection('applications').where(...).get(); }) - but we need graduateId in the next then for the set. So the chain is correct. But in the last .then we have "graduate_id: graduateId" - and graduateId is from the previous then. So we need to pass graduateId along. Currently: .then(function (appId) { return db...set({ job_id, graduate_id: graduateId, ... }). So graduateId is in scope from the previous .then(function (graduateId) { return db...get()... }). So we have two thens that use graduateId - the one that does get() and the one that does set(). So the middle then returns a promise that resolves to appId, but we lost graduateId. So we need to carry graduateId. Fix: .then(function (graduateId) { return db.collection('applications').where(...).get().then(function(aSnap) { if (!aSnap.empty) throw...; return { graduateId, needNewApp: true }; }); }).then(function (obj) { return getNextId('applications').then(function(appId) { return [appId, obj.graduateId]; }); }).then(function ([appId, graduateId]) { return db.collection('applications').doc(String(appId)).set({ job_id: ..., graduate_id: graduateId, ... }); }). Let me simplify: keep graduateId in scope by not nesting. So: .then(function (gSnap) { ... return gradIdPromise; }).then(function (graduateId) { return db.collection('applications').where('job_id','==',parseInt(jobId,10)).where('graduate_id','==',graduateId).get().then(function(aSnap) { if (!aSnap.empty) throw new Error('...'); return graduateId; }); }).then(function (graduateId) { return getNextId('applications').then(function(appId) { return db.collection('applications').doc(String(appId)).set({ job_id: parseInt(jobId,10), graduate_id: graduateId, status: 'pending', cover_letter: coverLetter || '', applied_date: new Date().toISOString() }).then(function() { return { application_id: appId, job_id: parseInt(jobId,10), graduate_id: graduateId, status: 'pending', ... }; }); }); }). So we need to fix the apply function - the variable graduateId must be passed through. Let me update the apply section.
</think>
إصلاح تدفق `apply` لتمرير `graduateId` بشكل صحيح.
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace