import { useEffect, useState } from 'react';

import SideBar from '../SideBar';
import { createBuilderLinks } from './BuilderLinks';
export default function BuilderSidebar({
  isOpen,
  setIsOpen,
  unreadMessagesCount,
  isAdmin,
  userRoles = [],
  setActiveRole = () => {},
  links, // accept links
}) {
  return (
    <SideBar
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      unreadMessagesCount={unreadMessagesCount}
      links={links}
      isAdmin={isAdmin}
      role="builder"
    />
  );
}