import { useEffect, useState } from 'react';
import SideBar from '../SideBar';
import { createLinks } from './links';

export default function GeneralSidebar({ isOpen, setIsOpen, unreadMessagesCount, isAdmin, userRoles = [], setActiveRole = () => {} }) {
  const [links, setLinks] = useState(createLinks(unreadMessagesCount, userRoles, setActiveRole));
  useEffect(() => {
    setLinks(createLinks(unreadMessagesCount, userRoles, setActiveRole));
  }, [unreadMessagesCount, userRoles, setActiveRole]);

  return <SideBar
    isOpen={isOpen}
    setIsOpen={setIsOpen}
    unreadMessagesCount={unreadMessagesCount}
    links={links}
    isAdmin={isAdmin}
      role="member"
  />;
};
