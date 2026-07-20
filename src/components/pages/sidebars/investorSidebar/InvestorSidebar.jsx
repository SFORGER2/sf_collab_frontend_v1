import { useEffect, useState } from 'react';
import { createInvestorLinks } from './InvestorLinks';
import SideBar from '../SideBar';
export default function InvestorSidebar({
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
    />
  );
}