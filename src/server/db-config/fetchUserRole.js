// Import Firestore instance and methods
import { db } from "./firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';

// Function to fetch user role based on UID
async function fetchUserRole(userId) {
  try {
    // Check if user exists in the 'recruiters' collection
    const recruiterSnap = await getDoc(doc(db, "recruiters", userId));
    if (recruiterSnap.exists()) return 'recruiter';

    // Check if user exists in the 'appliers' collection
    const applierSnap = await getDoc(doc(db, "appliers", userId));
    if (applierSnap.exists()) return 'applier';

    // If user not found in either collection, throw error
    throw new Error('User not found in either collection');
  } catch (error) {
    // Log error and return fallback role
    console.error('Error fetching user role:', error);
    return 'applier'; // fallback
  }
}

export default fetchUserRole;