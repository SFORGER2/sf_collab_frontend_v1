import { useEffect, useState } from 'react';
import { createInfluencerLinks } from "./influencerLinks";
import SideBar from '../SideBar';
export default function InfluencerSidebar({ isOpen, setIsOpen, unreadMessagesCount, isAdmin, userRoles = [], setActiveRole = () => { } }) {
  const [links, setLinks] = useState(createInfluencerLinks(unreadMessagesCount, userRoles, setActiveRole));
  useEffect(() => {
    setLinks(createInfluencerLinks(unreadMessagesCount, userRoles, setActiveRole));
  }, [unreadMessagesCount, userRoles, setActiveRole]);
  return <SideBar
    isOpen={isOpen}
    setIsOpen={setIsOpen}
    unreadMessagesCount={unreadMessagesCount}
    links={links}
    isAdmin={isAdmin}
  />;
};
