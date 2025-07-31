"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface Company {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: Date;
  ownerId: string;
  members: string[]; // Array of user IDs
  settings: {
    allowedDomains?: string[];
    maxUsers: number;
    features: string[];
  };
  billing: {
    customerId?: string;
    subscriptionId?: string;
    currentPeriodEnd?: Date;
    usage: {
      compute: number;
      storage: number;
      requests: number;
    };
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  companyId?: string;
  role: "owner" | "admin" | "developer" | "viewer";
  permissions: string[];
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  company: Company | null;
  companies: Company[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  createCompany: (name: string, slug: string) => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
  getUserCompanies: () => Promise<Company[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For development, create a mock user if Firebase is not configured
    const checkAuth = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUser(user);
            await loadUserProfile(user.uid);
          } else {
            // For development, create a mock user if no Firebase user
            if (process.env.NODE_ENV === 'development') {
              const mockUser = {
                uid: 'demo-user-id',
                email: 'demo@example.com',
                displayName: 'Demo User',
              } as User;
              setUser(mockUser);
              
              // Create mock user profile
              const mockProfile: UserProfile = {
                uid: 'demo-user-id',
                email: 'demo@example.com',
                displayName: 'Demo User',
                role: 'owner',
                permissions: ['*'],
                createdAt: new Date(),
                lastLogin: new Date(),
              };
              setUserProfile(mockProfile);
              
              // Create mock company
              const mockCompany: Company = {
                id: 'demo-company',
                name: 'Demo Company',
                slug: 'demo-company',
                plan: 'free',
                createdAt: new Date(),
                ownerId: 'demo-user-id',
                members: ['demo-user-id'],
                settings: {
                  maxUsers: 5,
                  features: ['compute', 'storage', 'monitoring'],
                },
                billing: {
                  usage: {
                    compute: 0,
                    storage: 0,
                    requests: 0,
                  },
                },
              };
              setCompany(mockCompany);
              setCompanies([mockCompany]);
            } else {
              setUser(null);
              setUserProfile(null);
              setCompany(null);
            }
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        setUserProfile(profile);

        // Load user companies (pass uid directly)
        await getUserCompaniesForUser(uid);

        // Load company if user has one
        if (profile.companyId) {
          await loadCompany(profile.companyId);
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const loadCompany = async (companyId: string) => {
    try {
      const companyDoc = await getDoc(doc(db, "companies", companyId));
      if (companyDoc.exists()) {
        const companyData = companyDoc.data() as Company;
        setCompany(companyData);
      }
    } catch (error) {
      console.error("Error loading company:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // For development, allow demo credentials
      if (process.env.NODE_ENV === 'development' && 
          (email === 'admin' || email === 'demo@example.com') && 
          password === 'admin123') {
        // Create mock user for demo
        const mockUser = {
          uid: 'demo-user-id',
          email: 'demo@example.com',
          displayName: 'Demo User',
        } as User;
        setUser(mockUser);
        
        // Create mock user profile
        const mockProfile: UserProfile = {
          uid: 'demo-user-id',
          email: 'demo@example.com',
          displayName: 'Demo User',
          role: 'owner',
          permissions: ['*'],
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        setUserProfile(mockProfile);
        
        // Create mock company
        const mockCompany: Company = {
          id: 'demo-company',
          name: 'Demo Company',
          slug: 'demo-company',
          plan: 'free',
          createdAt: new Date(),
          ownerId: 'demo-user-id',
          members: ['demo-user-id'],
          settings: {
            maxUsers: 5,
            features: ['compute', 'storage', 'monitoring'],
          },
          billing: {
            usage: {
              compute: 0,
              storage: 0,
              requests: 0,
            },
          },
        };
        setCompany(mockCompany);
        setCompanies([mockCompany]);
        return;
      }
      
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(result.user, { displayName });

      // Create user profile
      const userProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName,
        role: "owner", // First user becomes owner
        permissions: ["*"], // Full permissions for owner
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      await setDoc(doc(db, "users", result.user.uid), userProfile);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || result.user.email!,
          photoURL: result.user.photoURL || undefined,
          role: "owner",
          permissions: ["*"],
          createdAt: new Date(),
          lastLogin: new Date(),
        };

        await setDoc(doc(db, "users", result.user.uid), userProfile);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const createCompany = async (name: string, slug: string) => {
    if (!user) throw new Error("User must be authenticated");

    try {
      // Check if slug is available
      const existingCompany = query(
        collection(db, "companies"),
        where("slug", "==", slug)
      );
      const existingDocs = await getDocs(existingCompany);

      if (!existingDocs.empty) {
        throw new Error("Company slug already exists");
      }

      const companyId = `company_${Date.now()}`;
      const newCompany: Company = {
        id: companyId,
        name,
        slug,
        plan: "free",
        createdAt: new Date(),
        ownerId: user.uid,
        members: [user.uid], // Owner is first member
        settings: {
          maxUsers: 5, // Free plan limit
          features: ["compute", "storage", "monitoring"],
        },
        billing: {
          usage: {
            compute: 0,
            storage: 0,
            requests: 0,
          },
        },
      };

      // Create company
      await setDoc(doc(db, "companies", companyId), newCompany);

      // Update user profile with company
      if (userProfile) {
        const updatedProfile = { ...userProfile, companyId };
        await setDoc(doc(db, "users", user.uid), updatedProfile);
        setUserProfile(updatedProfile);
      }

      setCompany(newCompany);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const switchCompany = async (companyId: string) => {
    if (!user || !userProfile) throw new Error("User must be authenticated");

    try {
      // Update user profile
      const updatedProfile = { ...userProfile, companyId };
      await setDoc(doc(db, "users", user.uid), updatedProfile);
      setUserProfile(updatedProfile);

      // Load new company
      await loadCompany(companyId);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const getUserCompaniesForUser = async (uid: string): Promise<Company[]> => {
    try {
      // Query companies where user is a member
      const q = query(
        collection(db, "companies"),
        where("members", "array-contains", uid)
      );
      const querySnapshot = await getDocs(q);

      const userCompanies: Company[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userCompanies.push({
          id: doc.id,
          name: data.name,
          slug: data.slug,
          plan: data.plan || "free",
          ownerId: data.ownerId,
          members: data.members || [],
          createdAt: data.createdAt.toDate(),
          settings: data.settings || {
            maxUsers: 5,
            features: ["compute", "storage", "monitoring"],
          },
          billing: data.billing || {
            usage: {
              compute: 0,
              storage: 0,
              requests: 0,
            },
          },
        });
      });

      setCompanies(userCompanies);
      return userCompanies;
    } catch (error: any) {
      console.error("Error loading user companies:", error);
      setCompanies([]);
      return [];
    }
  };

  const getUserCompanies = async (): Promise<Company[]> => {
    if (!user) {
      console.warn("User not authenticated, cannot get companies");
      return [];
    }

    return getUserCompaniesForUser(user.uid);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    company,
    companies,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    createCompany,
    switchCompany,
    getUserCompanies,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
