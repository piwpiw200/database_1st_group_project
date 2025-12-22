import {  createContext, useContext, useEffect, useState } from "react";
import { auth, firebaseInitializedFlag } from "../firebase/firebase.config";
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";

const AuthContext =  createContext();

export const useAuth = () => {
    return useContext(AuthContext)
}

const googleProvider = new GoogleAuthProvider();

// authProvider
export const AuthProvide = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // register a user
    const registerUser = async (email,password) => {
        if (!firebaseInitializedFlag) return Promise.reject({code: 'auth/not-initialized', message: 'Firebase not initialized'});
        return await createUserWithEmailAndPassword(auth, email, password);
    }

    // login the user
    const loginUser = async (email, password) => {
        if (!firebaseInitializedFlag) return Promise.reject({code: 'auth/not-initialized', message: 'Firebase not initialized'});
        return await signInWithEmailAndPassword(auth, email, password)
    }

    // sing up with google
    const signInWithGoogle = async () => {
        if (!firebaseInitializedFlag) return Promise.reject({code: 'auth/not-initialized', message: 'Firebase not initialized'});
        return await signInWithPopup(auth, googleProvider)
    }

    // logout the user
    const logout = () => {
        if (!firebaseInitializedFlag) return Promise.reject({code: 'auth/not-initialized', message: 'Firebase not initialized'});
        return signOut(auth)
    }

    // manage user
    useEffect(() => {
        if (!firebaseInitializedFlag) {
            // No firebase: mark as not loading and leave currentUser null
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);

            if (user) {
                const { email, displayName, photoURL } = user;
                const userData = {
                    email, username: displayName, photo: photoURL
                }
            }
        })

        return () => unsubscribe();
    }, [])


    const value = {
        currentUser,
        loading,
        registerUser,
        loginUser,
        signInWithGoogle,
        logout
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
