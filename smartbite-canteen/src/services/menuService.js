import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { SAMPLE_MENU_ITEMS } from "../utils/menuData";

/**
 * Loads menu items from Cloud Firestore when configured,
 * or gracefully returns the rich sample data in local demo mode.
 */
export const getMenuItems = async () => {
  try {
    const menuColRef = collection(db, "menu");
    const snapshot = await getDocs(menuColRef);

    if (!snapshot.empty) {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      return { source: "firestore", items };
    }
  } catch (error) {
    console.warn("Firestore menu query bypassed (using local demo mode):", error.message);
  }

  // Fallback to local sample menu items
  return { source: "local", items: SAMPLE_MENU_ITEMS };
};

/**
 * Seeds the sample food items into Cloud Firestore collection 'menu'
 */
export const seedSampleMenuToFirestore = async () => {
  try {
    for (const item of SAMPLE_MENU_ITEMS) {
      const docRef = doc(db, "menu", item.id);
      await setDoc(docRef, item, { merge: true });
    }
    return { success: true, count: SAMPLE_MENU_ITEMS.length };
  } catch (error) {
    console.error("Failed to seed Firestore menu:", error);
    throw error;
  }
};

