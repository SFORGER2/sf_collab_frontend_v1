/**
 * ChatPage.jsx — SFCollab
 * Switcher for Mobile/Desktop Chat
 */

import React from "react";
import { useIsMobile } from "../../../utils/hooks/use-mobile";
import DesktopChatPage from "./views/DesktopChatPage";
import MobileChatPageSwitcher from "./views/MobileChatPageSwitcher";

const ChatPageSwitcher = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileChatPageSwitcher />;
  }

  return <DesktopChatPage />;
};

export default ChatPageSwitcher;
