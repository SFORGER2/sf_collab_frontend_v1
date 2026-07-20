import { useEffect, useState } from 'react';
import { createInfluencerLinks } from "./influencerLinks";
import SideBar from '../SideBar';
export default function InfluencerSidebar({
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