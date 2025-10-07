import { Outlet, useLocation, NavLink } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaUser,
  FaUsers,
  FaShieldAlt,
  FaLock,
  FaSearch,
  FaCog,
  FaCalendar,
  FaEnvelope,
  FaUserFriends,
  FaChevronUp,
  FaChevronDown,
  FaList,
  FaRuler,
  FaUserTie,
  FaBox,
  FaPaw,
  FaEnvelopeOpenText,
  FaDollarSign,
  FaPercentage,
  FaHammer,
  FaPeopleCarry,
  FaDoorOpen,
} from "react-icons/fa";
import logo from "../../assets/images/logo.webp";
import apiClient from "../../api/apiClient";
import Loading from "../Loading";
import Topbar from "./Topbar";

const Sidebar = ({ toggleSidebar }) => {
  const location = useLocation();
  const [isUserRolesOpen, setIsUserRolesOpen] = useState(false);
  const [isadditional_settingsOpen, setIsadditional_settingsOpen] = useState(false);
  const [isSurveyDetailOpen, setIsSurveyDetailOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surveyId, setSurveyId] = useState(
    localStorage.getItem("selectedSurveyId") || null
  );
  const [goodsType, setGoodsType] = useState(
    localStorage.getItem("goodsType") || "article"
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/auth/profile/");
        const user = response.data;
        setIsSuperadmin(user.is_superuser || user.role?.name === "Superadmin");
        const roleId = user.role?.id;
        if (roleId) {
          const res = await apiClient.get(`/auth/roles/${roleId}/`);
          setPermissions(res.data.permissions || []);
        } else {
          setPermissions([]);
          setError("No role assigned to user");
        }
      } catch (error) {
        console.error("Unable to fetch user profile:", error);
        setPermissions([]);
        setIsSuperadmin(false);
        setError("Failed to fetch profile or role permissions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();

    const handleStorageChange = () => {
      const newGoodsType = localStorage.getItem("goodsType") || "article";
      setGoodsType(newGoodsType);
      
      const newSurveyId = localStorage.getItem("selectedSurveyId") || null;
      setSurveyId(newSurveyId);
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    window.addEventListener("goodsTypeChanged", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("goodsTypeChanged", handleStorageChange);
    };
  }, []);

  const hasPermission = (page, action) => {
    if (isSuperadmin) return true;
    const perm = permissions.find((p) => p.page === page);
    const hasPerm = perm && perm[`can_${action}`];
    if (!hasPerm) {
      console.log(`No permission for page: ${page}, action: ${action}`);
    }
    return hasPerm;
  };

  const toggleUserRoles = () => setIsUserRolesOpen(!isUserRolesOpen);
  const toggleadditional_settings = () =>
    setIsadditional_settingsOpen(!isadditional_settingsOpen);
  const toggleSurveyDetail = () => setIsSurveyDetailOpen(!isSurveyDetailOpen);

  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

  const menuItems = [
    {
      id: "dashboard",
      to: "/",
      label: "Dashboard",
      icon: <FaHome className="w-4 h-4 mr-3" />,
      page: "Dashboard",
      action: "view",
    },
    {
      id: "enquiries",
      to: "/enquiries",
      label: "Enquiries",
      icon: <FaSearch className="w-4 h-4 mr-3" />,
      page: "enquiries",
      action: "view",
    },
    {
      id: "new-enquiries",
      to: "/new-enquiries",
      label: "New Assigned Enquiries",
      icon: <FaEnvelope className="w-4 h-4 mr-3" />,
      page: "new_enquiries",
      action: "view",
    },
    {
      id: "scheduled-surveys",
      to: "/scheduled-surveys",
      label: "Scheduled Surveys",
      icon: <FaCalendar className="w-4 h-4 mr-3" />,
      page: "scheduled_surveys",
      action: "view",
    },
    ...(surveyId
      ? [
          {
            id: "survey-detail",
            label: `Survey Detail ( ${surveyId} )`,
            icon: <FaEnvelopeOpenText className="w-4 h-4 mr-3" />,
            page: "survey_detail",
            action: "view",
            subItems: [
              {
                id: "customer",
                to: `/survey/${surveyId}/customer`,
                label: "Customer",
                icon: <FaUserTie className="w-4 h-4 mr-3" />,
                page: "survey_customer",
                action: "view",
              },
              ...(goodsType === "article"
                ? [
                    {
                      id: "article",
                      to: `/survey/${surveyId}/article`,
                      label: "Article",
                      icon: <FaBox className="w-4 h-4 mr-3" />,
                      page: "survey_article",
                      action: "view",
                    },
                  ]
                : [
                    {
                      id: "pet",
                      to: `/survey/${surveyId}/pet`,
                      label: "Pet",
                      icon: <FaPaw className="w-4 h-4 mr-3" />,
                      page: "survey_pet",
                      action: "view",
                    },
                  ]),
              {
                id: "service",
                to: `/survey/${surveyId}/service`,
                label: "Service",
                icon: <FaCog className="w-4 h-4 mr-3" />,
                page: "survey_service",
                action: "view",
              },
            ],
          },
        ]
      : []),
    {
      id: "additional-settings",
      label: "Additional Settings",
      icon: <FaList className="w-4 h-4 mr-3" />,
      page: "additional_settings",
      action: "view",
      subItems: [
        {
          id: "types",
          to: "/additional-settings/types",
          label: "Types",
          icon: <FaList className="w-4 h-4 mr-3" />,
          page: "types",
          action: "view",
        },
        {
          id: "units",
          to: "/additional-settings/units",
          label: "Units",
          icon: <FaRuler className="w-4 h-4 mr-3" />,
          page: "units",
          action: "view",
        },
        {
          id: "currency",
          to: "/additional-settings/currency",
          label: "Currency",
          icon: <FaDollarSign className="w-4 h-4 mr-3" />,
          page: "currency",
          action: "view",
        },
        {
          id: "tax",
          to: "/additional-settings/tax",
          label: "Tax",
          icon: <FaPercentage className="w-4 h-4 mr-3" />,
          page: "tax",
          action: "view",
        },
        {
          id: "handyman",
          to: "/additional-settings/handyman",
          label: "Handyman",
          icon: <FaHammer className="w-4 h-4 mr-3" />,
          page: "handyman",
          action: "view",
        },
        {
          id: "manpower",
          to: "/additional-settings/manpower",
          label: "Manpower",
          icon: <FaPeopleCarry className="w-4 h-4 mr-3" />,
          page: "manpower",
          action: "view",
        },
        {
          id: "room",
          to: "/additional-settings/room",
          label: "Room",
          icon: <FaDoorOpen className="w-4 h-4 mr-3" />,
          page: "room",
          action: "view",
        },
      ],
    },
    {
      id: "user-roles",
      label: "User Roles",
      icon: <FaUsers className="w-4 h-4 mr-3" />,
      page: "users",
      action: "view",
      subItems: [
        {
          id: "roles",
          to: "/user-roles/roles",
          label: "Roles",
          icon: <FaShieldAlt className="w-4 h-4 mr-3" />,
          page: "roles",
          action: "view",
        },
        {
          id: "users",
          to: "/user-roles/users",
          label: "Users",
          icon: <FaUserFriends className="w-4 h-4 mr-3" />,
          page: "users",
          action: "view",
        },
        {
          id: "permissions",
          to: "/user-roles/permissions",
          label: "Permissions",
          icon: <FaLock className="w-4 h-4 mr-3" />,
          page: "permissions",
          action: "view",
        },
      ],
    },
    {
      id: "profile",
      to: "/profile",
      label: "Profile",
      icon: <FaUser className="w-4 h-4 mr-3" />,
      page: "Profile",
      action: "view",
    },
  ];

  const renderMenuItem = (item) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-between w-full bg-gray-200 text-gray-800 text-sm py-3 px-3 rounded">
          {item.icon}
          {item.label}
        </div>
      );
    }

    if (item.subItems) {
      const filteredSubItems = item.subItems.filter((subItem) =>
        hasPermission(subItem.page, subItem.action)
      );

      if (filteredSubItems.length === 0) return null;

      const isActiveSubmenu = filteredSubItems.some(
        (subItem) => location.pathname === subItem.to
      );

      let toggleFunction, isOpen;
      switch (item.id) {
        case "survey-detail":
          toggleFunction = toggleSurveyDetail;
          isOpen = isSurveyDetailOpen;
          break;
        case "user-roles":
          toggleFunction = toggleUserRoles;
          isOpen = isUserRolesOpen;
          break;
        case "additional-settings":
          toggleFunction = toggleadditional_settings;
          isOpen = isadditional_settingsOpen;
          break;
        default:
          return null;
      }

      return (
        <>
          <button
            onClick={toggleFunction}
            className={`flex items-center justify-between w-full text-sm py-3 px-3 rounded rounded-bl-xl transition-colors duration-200 ${
              isOpen || isActiveSubmenu
                ? "bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <span className="flex items-center">
              {item.icon}
              {item.label}
            </span>
            {isOpen ? (
              <FaChevronUp className="w-3 h-3" />
            ) : (
              <FaChevronDown className="w-3 h-3" />
            )}
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.ul
                className="ml-2 mt-1 space-y-1"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {filteredSubItems.map((subItem) => (
                  <li key={subItem.id}>
                    <NavLink
                      to={subItem.to}
                      className={({ isActive }) =>
                        `flex items-center justify-between w-full text-sm py-3 px-3 rounded rounded-bl-xl transition-colors duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`
                      }
                      onClick={() => isMobile() && toggleSidebar()}
                    >
                      <span className="flex items-center">
                        {subItem.icon}
                        {subItem.label}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </>
      );
    } else {
      if (!hasPermission(item.page, item.action)) return null;

      return (
        <NavLink
          to={item.to}
          className={({ isActive }) =>
            `flex items-center justify-between w-full text-sm py-3 px-3 rounded rounded-bl-xl transition-colors duration-200 ${
              isActive
                ? "bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`
          }
          onClick={() => isMobile() && toggleSidebar()}
        >
          <span className="flex items-center">
            {item.icon}
            {item.label}
          </span>
        </NavLink>
      );
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      className="fixed top-0 left-0 w-72 h-screen bg-white shadow-lg flex flex-col z-50"
      initial={{ opacity: 0, x: "-100%" }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="p-4 flex items-center justify-center border-b border-gray-200">
        <img src={logo} className="w-full" alt="Prime Logo" />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>{renderMenuItem(item)}</li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};

const routeNames = {
  "/": "Dashboard",
  "/enquiries": "Enquiries",
  "/new-enquiries": "New Assigned Enquiries",
  "/scheduled-surveys": "Scheduled Surveys",
  "/processing-enquiries": "Processing Enquiries",
  "/follow-ups": "Follow Ups",

  // Survey Detail Dynamic Routes
  "/survey/:surveyId/customer": "Customer Details",
  "/survey/:surveyId/article": "Article Details",
  "/survey/:surveyId/article/view-article": "View Articles",
  "/survey/:surveyId/pet": "Pet Details",
  "/survey/:surveyId/service": "Service Details",

  // Additional Settings
  "/additional-settings/types": "Types",
  "/additional-settings/units": "Units",
  "/additional-settings/currency": "Currency",
  "/additional-settings/tax": "Tax",
  "/additional-settings/handyman": "Handyman",
  "/additional-settings/manpower": "Manpower",
  "/additional-settings/room": "Room",

  // User Roles
  "/user-roles/roles": "Roles",
  "/user-roles/users": "Users",
  "/user-roles/permissions": "Permissions",

  // Profile
  "/profile": "Profile",
};

const Layout = ({ isAuthenticated, setIsAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  const getActivePage = () => {
    const path = location.pathname;
    for (const [route, name] of Object.entries(routeNames)) {
      if (route.includes(":surveyId")) {
        const regex = new RegExp(`^${route.replace(":surveyId", "\\d+")}$`);
        if (regex.test(path)) return name;
      } else if (path === route) {
        return name;
      }
    }
    return "Dashboard";
  };
  
  const activePage = getActivePage();

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      apiClient
        .get("/auth/profile/")
        .then((response) => {
          setUser({
            username: response.data.username,
            image: response.data.image,
          });
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <motion.div
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
        initial={{ opacity: 0, x: "-100%" }}
        animate={{ opacity: 1, x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.1 }}
      >
        <Sidebar toggleSidebar={toggleSidebar} />
      </motion.div>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
          isOpen ? "md:ml-72" : "md:ml-0"
        }`}
      >
        <Topbar
          toggleSidebar={toggleSidebar}
          isOpen={isOpen}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          user={user}
          activePage={activePage}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center min-h-screen">
              <Loading />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;