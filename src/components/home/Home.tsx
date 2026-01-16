import { useState, useEffect, FC, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import Cookies from "universal-cookie";
import Friend from "../friend/Friend";
import { useSetIsOnline } from "../../hooks/friend/useSetIsOnline";
import { useGetPublicGroups } from "../../hooks/home/useGetPublicGroups";
import { useCreatePublicGroup } from "../../hooks/group/useCreatePublicGroup";
import { useSetOpenGroup } from "../../hooks/group/useSetOpenGroup";
import useSetGroupLastOpenByUser from "../../hooks/group/useSetGroupLastOpenByUser";
import { Group } from "../../interfaces/group/groupTypes";
import { UserIDStateContext } from "../../App";
import { useEnableOnlinePresence } from "../../hooks/useEnableOnlinePresence";
import { PublicGroupHomeTag } from "./PublicGroupHomeTag";

const cookies = new Cookies();

export const Home: FC = () => {
  const { user } = useContext(UserIDStateContext);

  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [fetchedPublicGroups, setFetchedPublicGroups] = useState(false);

  const navigate = useNavigate();
  const { setIsOnline } = useSetIsOnline();
  const { getPublicGroups } = useGetPublicGroups();
  const { createPublicGroup } = useCreatePublicGroup();
  const { setOpenGroup } = useSetOpenGroup();
  const { setGroupLastOpenByUser } = useSetGroupLastOpenByUser();
  const { enableOnlinePresence } = useEnableOnlinePresence();

  const navigateGroup = (groupID: string) => {
    if (groupID !== null) {
      setOpenGroup(user.uid, groupID);
      setGroupLastOpenByUser(user.uid, groupID);
      navigate("/group/" + groupID);
    }
  };

  useEffect(() => {
    if (user === undefined) {
      navigate("/", { replace: true });
    } else {
      const handleFetch = async () => {
        const output = await getPublicGroups(user.uid);
        setPublicGroups(output);
        setFetchedPublicGroups(true);
      };

      enableOnlinePresence(user.uid);
      handleFetch();
    }
  }, [user]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        cookies.remove("user", { path: "/" });
        navigate("/");
        setIsOnline(user.uid, false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleCreateGroupBtn = () => {
    createPublicGroup(user.uid, [], false).then((doc) => {
      navigateGroup(doc.id);
    });
  };

  return (
    <>
      {user && (
        <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
            {/* User Profile Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500 ring-offset-2 shadow-lg"
                  src={`${user.photoURL}`}
                  alt="User profile"
                />
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-gray-800">{user.displayName}</h2>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>

            {/* App Title */}
            <div className="hidden md:flex items-center">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Discourse
              </h1>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Sign Out
            </button>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Friends Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-200 shadow-sm flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Friends & Chats</h2>
                <p className="text-sm text-gray-500 mt-1">Your connections</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {fetchedPublicGroups && <Friend userID={user.uid} />}
              </div>
            </aside>

            {/* Public Groups Main Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-gray-800">Public Groups</h2>
                <p className="text-sm text-gray-500 mt-1">Join conversations and create new groups</p>
              </div>

              {/* Groups List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {publicGroups.map((group) => {
                  return <PublicGroupHomeTag key={group.id} group={group} />;
                })}

                {/* Create New Group Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleCreateGroupBtn}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create New Group</span>
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
