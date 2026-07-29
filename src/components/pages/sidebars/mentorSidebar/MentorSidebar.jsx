import SideBar from '../SideBar';

export default function MentorSidebar({
  isOpen,
  setIsOpen,
  unreadMessagesCount,
  isAdmin,
  links,
}) {
  return (
    <SideBar
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      unreadMessagesCount={unreadMessagesCount}
      links={links}
      isAdmin={isAdmin}
      role="mentor"
    />
  );
}
