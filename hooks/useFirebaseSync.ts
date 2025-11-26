import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebaseConfig';

// Define the setter type to match React's setState behavior
type SetValue<T> = (value: T | ((prev: T) => T)) => void;

// Helper to sanitize data for Firebase (replace undefined with null)
const sanitizeForFirebase = (data: any): any => {
  if (data === undefined) return null;
  if (data === null) return null;
  if (data instanceof Date) return data.toISOString(); // Store dates as ISO strings
  if (Array.isArray(data)) {
    return data.map(sanitizeForFirebase);
  }
  if (typeof data === 'object') {
    const newObj: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const val = sanitizeForFirebase(data[key]);
        // Firebase doesn't like keys with undefined values, but null is fine or just omitting.
        // However, if we want to explicitly clear a value, null is better.
        if (val !== undefined) {
             newObj[key] = val;
        }
      }
    }
    return newObj;
  }
  return data;
};

// A generic hook that syncs a state variable with a Firebase Realtime Database path
export function useFirebaseSync<T>(path: string, initialValue: T): [T, SetValue<T>] {
  // Initialize with initialValue immediately so UI has something to show
  const [data, setData] = useState<T>(initialValue);
  
  // 1. Listen for changes from Firebase
  useEffect(() => {
    if (!database) return;

    const dbRef = ref(database, path);
    
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // Revive dates if needed (simple check for ISO strings)
        const parsed = JSON.parse(JSON.stringify(val), (k, v) => {
            if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
                return new Date(v);
            }
            return v;
        });
        setData(parsed);
      } else {
        // If no data exists in DB yet, write sanitized initial value
        set(dbRef, sanitizeForFirebase(initialValue)).catch(console.error); 
      }
    }, (error) => {
        console.error("Firebase read failed:", error);
    });

    return () => unsubscribe();
  }, [path]);

  // 2. Function to update data (writes to Firebase)
  const updateData: SetValue<T> = (newValue) => {
    let valueToSave: T;
    
    if (typeof newValue === 'function') {
        // @ts-ignore
        valueToSave = newValue(data);
    } else {
        valueToSave = newValue;
    }

    // Optimistic update
    setData(valueToSave);

    // Write to Firebase with sanitization
    if (database) {
        const dbRef = ref(database, path);
        const cleanData = sanitizeForFirebase(valueToSave);
        set(dbRef, cleanData).catch((err) => {
            console.error("Firebase write failed:", err);
        });
    }
  };

  return [data, updateData];
}