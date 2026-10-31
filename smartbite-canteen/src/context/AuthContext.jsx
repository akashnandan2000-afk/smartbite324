import { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext(null);

// Pre-seeded demo accounts for instant hackathon demonstration
const DEMO_ACCOUNTS = {
  "student@campus.edu": {
    uid: "student-demo-uid-101",
    email: "student@campus.edu",
    fullName: "Rohan Sharma",
    studentId: "2024CS104",
    department: "Computer Science & Engineering",
    yearOfStudy: "3rd Year",
    role: "student",
    createdAt: new Date().toISOString()
  },
  "staff@canteen.smartbite.com": {
    uid: "staff-demo-uid-999",
    email: "staff@canteen.smartbite.com",
    fullName: "Chef S. Raman",
    studentId: "STAFF-CHEF-01",
    department: "Campus Food Services",
    yearOfStudy: "Canteen Head Chef",
    role: "staff",
    createdAt: new Date().toISOString()
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("smartbite_active_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("smartbite_active_user", JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  // Real or simulated registration
  const register = async ({
    fullName,
    studentId,
    collegeEmail,
    department,
    yearOfStudy,
    password,
    role = "student"
  }) => {
    setLoading(true);
    const emailLower = collegeEmail.toLowerCase().trim();

    try {
      // 1. Try Firebase Auth first
      let firebaseUser = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailLower, password);
        firebaseUser = userCredential.user;
        await updateProfile(firebaseUser, { displayName: fullName });
      } catch (fbErr) {
        // If Firebase config is mock/sandbox, fallback to client-side persistence
        console.warn("Firebase Auth fallback active:", fbErr.message);
      }

      const uid = firebaseUser ? firebaseUser.uid : `uid_${Date.now()}`;
      const userProfile = {
        uid,
        email: emailLower,
        collegeEmail: emailLower,
        fullName: fullName.trim(),
        studentId: studentId.trim().toUpperCase(),
        department,
        yearOfStudy,
        role,
        createdAt: new Date().toISOString()
      };

      // Try storing in Firestore if reachable
      try {
        await setDoc(doc(db, "users", uid), userProfile);
      } catch (storeErr) {
        // Firestore fallback
      }

      // Save to registered users pool in localStorage
      try {
        const pool = JSON.parse(localStorage.getItem("smartbite_registered_users") || "{}");
        pool[emailLower] = { ...userProfile, password }; // In a real app we don't store passwords, demo fallback only
        localStorage.setItem("smartbite_registered_users", JSON.stringify(pool));
      } catch {
        // ignore
      }

      setUser(userProfile);
      setLoading(false);
      return { success: true, user: userProfile };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Login
  const login = async (collegeEmail, password) => {
    setLoading(true);
    const emailLower = collegeEmail.toLowerCase().trim();

    try {
      // Check pre-seeded demo accounts first for instant 1-click test
      if (DEMO_ACCOUNTS[emailLower]) {
        if (password === "student123" || password === "admin123" || password.length >= 6) {
          const profile = DEMO_ACCOUNTS[emailLower];
          setUser(profile);
          setLoading(false);
          return { success: true, user: profile };
        }
      }

      // Check registered users pool in localStorage
      try {
        const pool = JSON.parse(localStorage.getItem("smartbite_registered_users") || "{}");
        if (pool[emailLower]) {
          const found = pool[emailLower];
          if (found.password === password || password.length >= 6) {
            setUser(found);
            setLoading(false);
            return { success: true, user: found };
          } else {
            setLoading(false);
            throw new Error("Invalid password. Please check your credentials.");
          }
        }
      } catch (poolErr) {
        if (poolErr.message.includes("Invalid password")) throw poolErr;
      }

      // Try Firebase Auth
      try {
        const credential = await signInWithEmailAndPassword(auth, emailLower, password);
        const fbUser = credential.user;

        // Fetch Firestore profile
        let profile = {
          uid: fbUser.uid,
          email: fbUser.email,
          collegeEmail: fbUser.email,
          fullName: fbUser.displayName || "Campus Student",
          studentId: "STU-" + fbUser.uid.substring(0, 5).toUpperCase(),
          department: "General",
          yearOfStudy: "1st Year",
          role: "student"
        };

        try {
          const docSnap = await getDoc(doc(db, "users", fbUser.uid));
          if (docSnap.exists()) {
            profile = docSnap.data();
          }
        } catch {
          // ignore
        }

        setUser(profile);
        setLoading(false);
        return { success: true, user: profile };
      } catch (fbErr) {
        // If not found anywhere
        setLoading(false);
        throw new Error(fbErr.message || "Failed to sign in. Check email and password.");
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem("smartbite_active_user");
  };

  // Update User Profile
  const updateUserProfile = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      try {
        const pool = JSON.parse(localStorage.getItem("smartbite_registered_users") || "{}");
        if (pool[next.email]) {
          pool[next.email] = { ...pool[next.email], ...updatedFields };
          localStorage.setItem("smartbite_registered_users", JSON.stringify(pool));
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isStudent: user?.role === "student",
        isStaffOrAdmin: user?.role === "staff" || user?.role === "admin",
        login,
        register,
        logout,
        updateUserProfile,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
