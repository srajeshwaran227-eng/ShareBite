// MOCK FIREBASE IMPLEMENTATION FOR LOCAL TESTING
// This uses localStorage to simulate Firestore, Auth, and Storage

// --- App ---
export const initializeApp = () => ({ name: '[DEFAULT]' });

// --- Auth ---
export const getAuth = () => ({ currentUser: null });
export class GoogleAuthProvider { constructor() {} }

let authStateListeners = [];
let currentUser = JSON.parse(localStorage.getItem('mock_user')) || null;

function notifyAuthListeners() {
  authStateListeners.forEach(listener => listener(currentUser));
}

export const signInWithPopup = async () => {
  if (!currentUser) {
    currentUser = {
      uid: 'user_' + Math.random().toString(36).substr(2, 9),
      displayName: 'Test User ' + Math.floor(Math.random() * 1000),
      email: 'test@example.com',
      photoURL: 'https://via.placeholder.com/150'
    };
    localStorage.setItem('mock_user', JSON.stringify(currentUser));
  }
  
  notifyAuthListeners();
  return { user: currentUser };
}

export const signOut = async () => {
  currentUser = null;
  localStorage.removeItem('mock_user');
  notifyAuthListeners();
}

export const onAuthStateChanged = (auth, callback) => {
  authStateListeners.push(callback);
  setTimeout(() => callback(currentUser), 0); // Call async to simulate network
  return () => {
    authStateListeners = authStateListeners.filter(cb => cb !== callback);
  };
}

// --- Firestore ---
export const getFirestore = () => ({});

const getDB = () => JSON.parse(localStorage.getItem('mock_db')) || { users: {}, foodPosts: {} };
const saveDB = (db) => localStorage.setItem('mock_db', JSON.stringify(db));

const processForDB = (data) => {
  const processed = { ...data };
  for (const key in processed) {
    if (processed[key] && processed[key].isMock) {
      processed[key] = { isMockTimestamp: true, value: processed[key].toMillis() };
    }
  }
  return processed;
};

const processFromDB = (data) => {
  if (!data) return data;
  const processed = { ...data };
  for (const key in processed) {
    if (processed[key] && typeof processed[key] === 'object' && processed[key].isMockTimestamp) {
      processed[key] = { ...processed[key], toMillis: () => processed[key].value };
    }
  }
  return processed;
};

let firestoreListeners = [];
function notifyFirestoreListeners() {
  firestoreListeners.forEach(listener => listener());
}

export const doc = (db, collectionName, id) => {
  return { collection: collectionName, id };
}

export const collection = (db, collectionName) => {
  return { collection: collectionName };
}

export const getDoc = async (docRef) => {
  const db = getDB();
  const data = db[docRef.collection]?.[docRef.id];
  return {
    exists: () => !!data,
    data: () => processFromDB(data)
  };
}

export const setDoc = async (docRef, data) => {
  const db = getDB();
  if (!db[docRef.collection]) db[docRef.collection] = {};
  db[docRef.collection][docRef.id] = processForDB(data);
  saveDB(db);
  notifyFirestoreListeners();
}

export const addDoc = async (collectionRef, data) => {
  const db = getDB();
  if (!db[collectionRef.collection]) db[collectionRef.collection] = {};
  const id = 'doc_' + Math.random().toString(36).substr(2, 9);
  db[collectionRef.collection][id] = processForDB(data);
  saveDB(db);
  notifyFirestoreListeners();
  return { id, ref: doc(null, collectionRef.collection, id) };
}

export const updateDoc = async (docRef, data) => {
  const db = getDB();
  if (db[docRef.collection]?.[docRef.id]) {
    db[docRef.collection][docRef.id] = { ...db[docRef.collection][docRef.id], ...processForDB(data) };
    saveDB(db);
    notifyFirestoreListeners();
  }
}

export const serverTimestamp = () => {
  return {
    toMillis: () => Date.now(),
    isMock: true
  };
}

export const query = (collectionRef, ...constraints) => {
  return { ...collectionRef, constraints };
}

export const where = (field, op, value) => {
  return { type: 'where', field, op, value };
}

export const orderBy = (field, dir) => {
  return { type: 'orderBy', field, dir };
}

export const onSnapshot = (queryObj, callback) => {
  const executeQuery = () => {
    const db = getDB();
    const coll = db[queryObj.collection] || {};
    let docs = Object.entries(coll).map(([id, data]) => ({ id, ...data }));
    
    if (queryObj.constraints) {
      queryObj.constraints.forEach(c => {
        if (c.type === 'where') {
          if (c.op === '==') docs = docs.filter(d => d[c.field] === c.value);
        } else if (c.type === 'orderBy') {
          docs.sort((a, b) => {
            let valA = a[c.field];
            let valB = b[c.field];
            if (valA && valA.toMillis) valA = valA.toMillis();
            if (valB && valB.toMillis) valB = valB.toMillis();
            if (c.dir === 'desc') return valB - valA;
            return valA - valB;
          });
        }
      });
    }

    callback({
      docs: docs.map(d => ({
        id: d.id,
        data: () => {
          const { id, ...rest } = d;
          return processFromDB(rest);
        }
      }))
    });
  };

  executeQuery(); // Initial call
  
  const listener = executeQuery;
  firestoreListeners.push(listener);
  return () => {
    firestoreListeners = firestoreListeners.filter(l => l !== listener);
  };
}

export const getDocs = async (queryObj) => {
  return new Promise((resolve) => {
    const unsubscribe = onSnapshot(queryObj, (snapshot) => {
      resolve(snapshot);
    });
    unsubscribe();
  });
}

// --- Storage ---
export const getStorage = () => ({});

export const ref = (storage, path) => ({ path });

export const uploadBytes = async (storageRef, file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const db = getDB();
      if (!db.storage) db.storage = {};
      db.storage[storageRef.path] = dataUrl;
      saveDB(db);
      resolve({ ref: storageRef });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const getDownloadURL = async (storageRef) => {
  const db = getDB();
  return db.storage?.[storageRef.path] || '';
}
