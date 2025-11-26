import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebaseConfig';

// A generic hook that syncs a state variable with a Firebase Realtime Database path
export function useFirebaseSync<T>(path: string, initialValue: T): [T, (value: T) => void] {
  const [data, setData] = useState<T>(initialValue);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

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
        // If no data exists in DB yet, initialize it with our initialValue
        set(dbRef, initialValue); 
      }
      setIsFirebaseReady(true);
    }, (error) => {
        console.error("Firebase read failed:", error);
    });

    return () => unsubscribe();
  }, [path]);

  // 2. Function to update data (writes to Firebase)
  const updateData = (newValue: T | ((prev: T) => T)) => {
    let valueToSave: T;
    
    if (typeof newValue === 'function') {
        // @ts-ignore
        valueToSave = newValue(data);
    } else {
        valueToSave = newValue;
    }

    // Optimistic update
    setData(valueToSave);

    // Write to Firebase
    if (database) {
        const dbRef = ref(database, path);
        set(dbRef, valueToSave).catch((err) => {
            console.error("Firebase write failed:", err);
        });
    }
  };

  return [data, updateData];
}