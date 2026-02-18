import { Building2, LightbulbIcon, Save } from 'lucide-react';
import { Rocket, PlusSquare, BookOpen, MessageSquareHeart, Users } from 'lucide-react';
import { Lightbulb } from 'lucide-react';
import { aiTools, dashboardLink, socialSection, toolsSection } from '../sidebarCommons';

/**
 * Creates navigation links for the Founder sidebar
 * @param {number} unreadMessagesCount - Number of unread messages to display in badge
 * @returns {Array} Array of link objects for sidebar navigation
 */
// eslint-disable-next-line no-unused-vars
export function createFounderLinks(unreadMessagesCount = 0, userRoles = [], setActiveRole = () => {}) {
  return [
    dashboardLink(userRoles, setActiveRole),
    {
      id: 2,
      icon: <Rocket size={22} />,
      href: "/discover-startups",
      label: "Startups",
      subItems: [
        { id: "discover-startups", href: "/discover-startups", label: "Discover", icon: <Rocket size={18} /> },
        { id: "register-startup", href: "/register-startup", label: "Register", icon: <PlusSquare size={18} /> },
        { id: "my-startups", href: "/my-startups", label: "My Startups", icon: <Building2 size={18} /> },
        { id: "saved-startups", href: "/saved-startups", label: "Saved Startups", icon: <Save size={18} /> },

      ]
    },
    {
      id: 3,
      icon: <LightbulbIcon size={22} />,
      href: "/ideation",
      label: "Ideation",
      subItems: [
        { id: "Ideation-Board", href: "/ideation", label: "Ideation Board", icon: <LightbulbIcon size={18} /> },
        { id: "knowledge-resources", href: "/knowledge", label: "Knowledge Resources", icon: <BookOpen size={18} /> },
      ]
    },
    socialSection(4),
    
    aiTools(5),
    toolsSection(6)
  ];
}
