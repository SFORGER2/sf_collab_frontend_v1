import { CheckCircle, Save, LightbulbIcon, BookOpen, MessageSquareHeart, Rocket, Users, ClipboardList, Calculator, FileTerminal, Hammer } from 'lucide-react';

import { aiTools, dashboardLink, ideation, socialSection, toolsSection, wallet } from '../sidebarCommons';
import { FcInvite } from 'react-icons/fc';

export function createBuilderLinks(unreadMessagesCount, userRoles = [], setActiveRole) {
  return [
    dashboardLink(userRoles, setActiveRole),
    {
      id: 2,
      icon: <Rocket size={22} />,
      href: "/discover-startups",
      label: "Discover Startups",
      subItems: [
        { id: "discover-startups", href: "/discover-startups", label: "Discover Startups", icon: <Rocket size={18} /> },
        { id: "saved-startups", href: "/saved-startups", label: "Saved Startups", icon: <Save size={18} /> },
      ]

    },
    ideation(3),
    {
      id: 5,
      icon: <Hammer size={22} />,
      href: "/builder/my-startups",
      label: "My Startups",
      subItems: [
        { id: "my-startups", href: "/builder/my-startups", label: "My Startups", icon: <Hammer size={18} /> },
        { id: "my-applications", href: "/builder/my-applications", label: "My Applications", icon: <CheckCircle size={18} /> },
        { id: "my-work", href: "/builder/my-work", label: "My Work", icon: <ClipboardList size={18} /> },
        { id: "my-invitations", href: "/invitations", label: "My Invitations", icon: <FcInvite size={18} />, }
      ]
    },
    socialSection(7),
    aiTools(8),
    toolsSection(9),
    wallet(10)
  ];
};