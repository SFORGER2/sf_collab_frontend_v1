import { useEffect, useState } from 'react';
import { createInvestorLinks } from './InvestorLinks';
import SideBar from '../SideBar';

const InvestorSidebar = ({ isOpen, setIsOpen, unreadMessagesCount, isAdmin, userRoles = [], setActiveRole = () => {}, links }) => {
  const [localLinks, setLocalLinks] = useState(links || createInvestorLinks(unreadMessagesCount, userRoles, setActiveRole));

  useEffect(() => {
    if (!links) {
      setLocalLinks(createInvestorLinks(unreadMessagesCount, userRoles, setActiveRole));
    }
  }, [unreadMessagesCount, userRoles, setActiveRole, links]);

  return (
    <SideBar
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      unreadMessagesCount={unreadMessagesCount}
      links={links || localLinks}
      isAdmin={isAdmin}
    />
  );
};

export default InvestorSidebar;
