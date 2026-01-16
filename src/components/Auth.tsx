import { setDoc, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db, providerGoogleAuth } from "../config/firebase";
import { User, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { FC, useContext, useEffect } from "react";
import { ReactSVG } from "./ReactSVG";
import { FirebaseSVG } from "./FirebaseSVG";
import { TypeScriptSVG } from "./TypeScriptSVG";
import { UserIDStateContext } from "../App";
import { GitHubSVG } from "./GitHubSVG";
import { useEnableOnlinePresence } from "../hooks/useEnableOnlinePresence";

const cookies = new Cookies();

export const Auth: FC = () => {
  const { setUser } = useContext(UserIDStateContext);
  const navigate = useNavigate();

  const { enableOnlinePresence } = useEnableOnlinePresence();

  useEffect(() => {
    const userCookie: User = cookies.get("user");

    if (userCookie !== undefined) {
      setUser(userCookie);
      enableOnlinePresence(userCookie.uid);
      navigate("/home", { replace: true });
    }
  }, []);

  const signInGoogle = async () => {
    try {
      const info = await signInWithPopup(auth, providerGoogleAuth);
      cookies.set("user", info.user);

      setUser(info.user);

      const docRef = doc(db, "users", info.user.uid);
      const docSnap = await getDoc(docRef);

      /* 
        Two cases needed, one where user already exists and they need 
        a new attribute added, or the user is new, all attributes are 
        created fresh. 

        A seperate useEffect exists in App.jsx to add an attribute to all 
        docs in user collection 
      */
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          pendingFriends: arrayUnion(),
          displayName: info.user.displayName,
          photoURL: info.user.photoURL,
        });
      } else {
        await setDoc(docRef, {
          email: info.user.email,
          pendingFriends: [],
          friends: [],
          displayName: info.user.displayName,
          photoURL: info.user.photoURL,
        });
      }

      enableOnlinePresence(docRef.id);
      navigate("/home");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 items-center justify-center p-4">
      {/* Main Card */}
      <div className="flex flex-col w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 space-y-4 animate-fadeIn">

        {/* App Title */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              Discourse
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
          </div>

          {/* Subtitle */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-2xl md:text-3xl">
            <span className="text-gray-700 font-medium">The</span>
            <span className="px-4 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-full shadow-lg">
              Real-Time
            </span>
            <span className="text-gray-700 font-medium">Chatting App</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        {/* Tech Stack */}
        <div className="flex flex-col items-center space-y-3">
          <h2 className="text-xl text-gray-600 font-medium">Built with</h2>
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="transform transition-transform hover:scale-110 hover:rotate-3">
              <ReactSVG />
            </div>
            <span className="text-gray-400 text-2xl font-light">+</span>
            <div className="transform transition-transform hover:scale-110 hover:rotate-3">
              <TypeScriptSVG />
            </div>
            <span className="text-gray-400 text-2xl font-light">+</span>
            <div className="transform transition-transform hover:scale-110 hover:rotate-3">
              <FirebaseSVG />
            </div>
          </div>
        </div>

        {/* Credit */}
        <a
          href="https://github.com/DharmpreetAtwal"
          target="_blank"
          rel="noopener noreferrer"
          className="self-center"
        >
          <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 group">
            <span className="text-lg text-gray-700 font-medium">Dharmpreet Atwal</span>
            <div className="transform transition-transform group-hover:rotate-12">
              <GitHubSVG />
            </div>
          </div>
        </a>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        {/* Sign In Section */}
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Remember to enable cookies
          </p>

          <button
            onClick={signInGoogle}
            className="gsi-material-button transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="block"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                Sign in with Google
              </span>
              <span className="hidden">Sign in with Google</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
