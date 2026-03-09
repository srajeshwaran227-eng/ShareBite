// ====== MOCK FIREBASE IMPLEMENTATION (LOCAL STORAGE) ======

export const auth = { currentUser: null };
export const db = {};
export const storage = {};
export const googleProvider = {};

// Helper for Mock DB
function getTable(path) {
  const data = localStorage.getItem(`mock_db_${path}`);
  return data ? JSON.parse(data) : {};
}
function saveTable(path, data) {
  localStorage.setItem(`mock_db_${path}`, JSON.stringify(data));
}

// -- AUTH --
export function onAuthStateChanged(authInstance, callback) {
  const userStr = localStorage.getItem('mock_user');
  const user = userStr ? JSON.parse(userStr) : null;
  authInstance.currentUser = user;
  setTimeout(() => callback(user), 500);
  return () => {};
}

export async function signInWithPopup(authInstance, provider) {
  const user = { uid: 'mock-google-123', email: 'user@gmail.com', displayName: 'Google User' };
  localStorage.setItem('mock_user', JSON.stringify(user));
  authInstance.currentUser = user;
  return { user };
}

export async function signInWithEmailAndPassword(authInstance, email, password) {
  const usersStr = localStorage.getItem('mock_all_users') || '[]';
  const users = JSON.parse(usersStr);
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    const err = new Error('User not found');
    err.code = 'auth/user-not-found';
    throw err;
  }
  
  const authUser = { uid: user.uid, email: user.email, displayName: user.name };
  localStorage.setItem('mock_user', JSON.stringify(authUser));
  authInstance.currentUser = authUser;
  return { user: authUser };
}

export async function createUserWithEmailAndPassword(authInstance, email, password) {
  const uid = 'mock-' + Date.now();
  const usersStr = localStorage.getItem('mock_all_users') || '[]';
  const users = JSON.parse(usersStr);
  if (users.find(u => u.email === email)) {
    const err = new Error('Email in use');
    err.code = 'auth/email-already-in-use';
    throw err;
  }
  
  users.push({ uid, email, password });
  localStorage.setItem('mock_all_users', JSON.stringify(users));
  
  const authUser = { uid, email, displayName: email.split('@')[0] };
  localStorage.setItem('mock_user', JSON.stringify(authUser));
  authInstance.currentUser = authUser;
  return { user: authUser };
}

export async function signOut(authInstance) {
  localStorage.removeItem('mock_user');
  authInstance.currentUser = null;
}

export async function sendPasswordResetEmail(authInstance, email) {
  console.log('Mock password reset sent to', email);
  return Promise.resolve();
}

// -- FIRESTORE --
export function collection(dbInstance, path) { return { path }; }
export function doc(dbInstance, path, id) { return { path, id }; }
export function query(col, ...filters) { return { col, filters }; }
export function where(field, op, value) { return { type: 'where', field, op, value }; }
export function orderBy(field, dir) { return { type: 'orderBy', field, dir }; }

export async function getDoc(docRef) {
  const table = getTable(docRef.path);
  const data = table[docRef.id];
  return { 
    exists: () => data !== undefined && Object.keys(data).length > 0, 
    data: () => data, 
    id: docRef.id 
  };
}

export async function setDoc(docRef, data) {
  const table = getTable(docRef.path);
  table[docRef.id] = { ...data };
  saveTable(docRef.path, table);
}

export async function updateDoc(docRef, data) {
  const table = getTable(docRef.path);
  if (table[docRef.id]) {
    table[docRef.id] = { ...table[docRef.id], ...data };
    saveTable(docRef.path, table);
  }
}

export async function addDoc(colRef, data) {
  const table = getTable(colRef.path);
  const id = 'id_' + Date.now();
  // Strip functions before saving
  const safeData = JSON.parse(JSON.stringify(data));
  if (data.createdAt && data.createdAt.toMillis) {
    safeData.createdAt = { _mockTime: data.createdAt.toMillis() };
  }
  table[id] = safeData;
  saveTable(colRef.path, table);
  return { id };
}

export async function getDocs(q) {
  const path = q.col ? q.col.path : q.path;
  const table = getTable(path);
  let result = Object.entries(table).map(([id, data]) => {
    // Restore mock time if needed
    if (data.createdAt && data.createdAt._mockTime) {
      data.createdAt = { toMillis: () => data.createdAt._mockTime };
    }
    return { id, data };
  });
  
  if (q.filters) {
    for (const f of q.filters) {
      if (f.type === 'where') {
        result = result.filter(r => r.data[f.field] === f.value);
      } else if (f.type === 'orderBy') {
        result.sort((a, b) => {
          let valA = a.data[f.field];
          let valB = b.data[f.field];
          if (valA && valA.toMillis) valA = valA.toMillis();
          if (valB && valB.toMillis) valB = valB.toMillis();
          if (f.dir === 'desc') return valB - valA;
          return valA - valB;
        });
      }
    }
  }
  
  return { docs: result.map(r => ({ id: r.id, data: () => r.data })) };
}

// Notice `onSnapshot` is heavily used
export function onSnapshot(q, callback) {
  // Fire once immediately
  getDocs(q).then(snap => callback(snap));
  // Then poll every 2 seconds
  const interval = setInterval(() => {
    getDocs(q).then(snap => callback(snap));
  }, 2000);
  return () => clearInterval(interval);
}

export function serverTimestamp() {
  return { toMillis: () => Date.now() }; 
}

// -- STORAGE --
export function ref(storageInstance, path) { return { path }; }
export async function uploadBytes(refInstance, file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      localStorage.setItem(`mock_storage_${refInstance.path}`, e.target.result);
      resolve({ ref: refInstance });
    };
    reader.readAsDataURL(file);
  });
}
export async function getDownloadURL(refInstance) {
  return localStorage.getItem(`mock_storage_${refInstance.path}`);
}

export default { auth, db, storage };
