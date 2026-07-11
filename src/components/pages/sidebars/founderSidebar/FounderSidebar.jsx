import { useEffect, useState } from 'react';

import SideBar from '../SideBar';
import { createFounderLinks } from './FounderLinks';
export default function FounderSidebar({
  isOpen,
  setIsOpen,
  unreadMessagesCount,
  isAdmin,
  userRoles = [],
  setActiveRole = () => {},
  links, // new
}) {
  return (
    <SideBar
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      unreadMessagesCount={unreadMessagesCount}
      links={links}
      isAdmin={isAdmin}
    />
  );
}