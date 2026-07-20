# SFCollab Chat UI - Complete Context & Technical Documentation

This document outlines the directory layouts, technical architecture, layout designs, state flow, functional implementations, and API endpoints of the Chat module in the SFCollab project.

---

## 1. Complete Directory & File Structure

The Chat UI code is fully mapped across the following files:

### Main Routing & Wrappers
* **[`src/App.jsx`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/App.jsx):** Mounts `<ChatPage />` at the `/chat` and `/chat/:category` URL paths using standard React Router components.
* **[`src/components/pages/chat/ChatPage.jsx`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/components/pages/chat/ChatPage.jsx):** Switcher that matches media query boundaries using `useIsMobile()` and resolves navigation between `<MobileChatPageSwitcher />` and `<DesktopChatPage />`.

### Category Interface Routers
Located in [`src/components/pages/chat/interfaces/`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/components/pages/chat/interfaces/):
* **`AllChat.jsx`**: Renders `<BaseChatLayout />` with category `"all"`.
* **`FriendsChat.jsx`**: Renders `<BaseChatLayout />` with category `"friends"`.
* **`GroupsChat.jsx`**: Renders `<BaseChatLayout />` with category `"groups"`.
* **`StartupsChat.jsx`**: Renders `<BaseChatLayout />` with category `"startups"`.
* **`GeneralChat.jsx`**: Renders `<BaseChatLayout />` with category `"general"`.

### Layout & Page Views
Located in [`src/components/pages/chat/views/`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/components/pages/chat/views/):
* **`BaseChatLayout.jsx`**: Main container that wraps the chat page lifecycle. Synchronizes BroadcastChannels, parses parameters, resolves user states, and manages typing indicators.
* **`DesktopChatPage.jsx`**: The main dual-pane layout designed for viewports >= 768px. Renders the collapsible left conversation sidebar, active message feed, input bar, and right details panel.
* **`MobileChatPageSwitcher.jsx`**: Coordinates mobile state and page animations. Switches viewports between the conversations feed and individual threads.
* **`MobileChatPage.jsx`**: Presentational wrapper for individual mobile threads, rendering the header, scrollable messages feed, and bottom input.

### Shared UI Components
Located in [`src/components/chat/`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/components/chat/):
* **`Avatar.jsx`**: Generates styled avatars with initial letter fallbacks, gradient backgrounds, or direct user profile images.
* **`ChatHeader.jsx`**: Top header displaying active conversation title, member counts for groups, and presence indicators. Toggles the sidebar on desktop.
* **`ChatInput.jsx`**: Input form with auto-expanding textarea, attachment handlers, emoji picker drawer, clipboard image paste interceptor, and drawing canvas annotation overlay.
* **`ConversationItem.jsx`**: Individual conversation feed row, rendering avatar, title, unread badges, draft preview indicator, presence dot, pin icons, and timestamps.
* **`DateSeparator.jsx`**: Displays day-by-day groupings (e.g. "Today", "Yesterday", or full date string) between message blocks.
* **`MessageBubble.jsx`**: Displays individual chat messages with formatted time, replies, document/image files, links, read ticks, and emoji reaction counts. Handles double-click reactions, edits, and deletions (time-gated).
* **`NewMessageModal.jsx`**: Modal overlay to start new conversations. Users search mutual connections to start direct chats or select multiple to initialize group chats.
* **`OnlineContactsSidebar.jsx`**: Drawer slide-out containing the active online contacts panel list.
* **`OnlineFriendsPanel.jsx`**: Displays list of mutual, online connections for direct quick-chat initiation.
* **`Skeletons.jsx`**: Loading placeholder animations for loading states.
* **`ChatDetailsPanel.jsx`**: Collapsible right-hand side panel showing conversation metadata, members list, and shared media files.
* **`TypingIndicator.jsx`**: Renders animated dot bubbles when other users type.

### Persistent Overlay Dock
* **[`src/components/chat-dock/ChatDock.jsx`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/components/chat-dock/ChatDock.jsx):** Collapsible panel floating at the bottom right of general site pages. Tracks active conversations in `localStorage` (`chatDock:windows`) to persist mini-chat tabs across browser reloads.
* **[`src/components/chat-dock/Flashingtabs.css`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/components/chat-dock/Flashingtabs.css):** Visual alarms and alert flashing animations for the floating dock tabs.

### Chat Notifications & Badges
* **`ChatNotificationBadge.jsx`**: Renders unread bubble counts.
* **`Chatnotificationprovider.jsx`**: Global context listening to incoming events to notify users (via browser tab title flash, sound chime, or toaster bubble) if they are in another view.
* **`NotificationAvatar.jsx`**: Custom avatar formatter for notification views.
* **`useChatNotiffications.js`**: Hook exposing the notification context.
* **`useShowNotification.js`**: Triggers local browser notification actions.
* **`useSocket.jsx`**: Instantiates local socket connections.

### APIs & Websocket Clients
* **[`src/utils/APIs/chatApi.js`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/utils/APIs/chatApi.js):** Service layer that handles axios calls with JWT token interceptors.
* **[`src/utils/getSocketInstance.js`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/utils/getSocketInstance.js):** Direct singleton connection to the socket server.
* **[`src/context/ChatContactsProvider.jsx`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/context/ChatContactsProvider.jsx):** Context provider that loads mutual friends from backend `/connections`.
* **[`src/utils/hooks/use-mobile.js`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/utils/hooks/use-mobile.js):** Custom media query listener hook.
* **[`src/utils/hooks/useUnreadCounts.js`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/utils/hooks/useUnreadCounts.js):** Hook that polls `/api/chat/unread-count` for global badges.

---

## 2. Technical Specifications & Features

### A. Responsive Architecture
* **Desktop/Tablet Layout**: Structured as a dual-pane view with a left sidebar for conversations and a right pane for the active message thread. The left sidebar is collapsible, sliding open/closed smoothly (`transition-all duration-300 w-80` to `w-0 overflow-hidden`) to expand the chat panel to the full width of the viewport.
* **Mobile Viewport Layout**: Structured as a single-pane viewport. The user switches back and forth between the chat history feed (list view) and the individual conversation details (message thread view) via screen transitions handled by `Framer Motion`.
* **Dynamic Heights**: Utilizes dynamic viewport height units (`dvh` / `100dvh`) to prevent UI layouts from overlapping or shifting when virtual mobile keyboards slide into view.
* **Safe Areas**: Integrates device safe area bindings (`pb-[calc(env(safe-area-inset-bottom,0px)+8px)]`) on inputs to prevent overlap with hardware camera notches and OS touch home indicators.
* **Scrolling**: Features touch momentum scrolling physics (`-webkit-overflow-scrolling: touch`) across all scrolling panels on mobile viewports for smooth scrolling.

### B. Conversation Types & Categorization
Chats are partitioned using tab categories defined in a mapping structure:
* **Friends (`direct`):** Standard direct messaging.
* **Groups (`group`):** Multi-user standard rooms.
* **Startups (`team` / `startup`):** Contextual startup team chats.
* **General (`general`):** Public/general communication.
* **Archived:** Stored in a separate array in state and loaded exclusively on the archived tab.

### C. Advanced Conversation List Features
1. **Pinned Conversations:** Users can pin/unpin conversations. Pinned items float to the top of the chat list, sorted internally by recent activity.
2. **Draft Auto-Saving:** Draft messages are synced to `localStorage` per conversation ID (`chatPage:draft:<convoId>`). If a user starts typing but switches chats, a `"Draft:"` preview indicator is rendered in the list.
3. **Unread Counts:** Per-tab unread bubble counts are calculated dynamically based on raw unread items and conversation categories.

### D. Presence Tracking
The application runs an active/seen indicator system:
* **Online:** User is connected and active within the last 5 minutes.
* **Away (Idle):** User is connected but has been inactive for between 5 and 6 minutes.
* **Offline:** User is disconnected or inactive for 6+ minutes.
* Displays "last seen at [Time/Yesterday/Date]" relative to their last active/disconnected timestamp.
* Shared state between `ChatDock` and `ChatPage` is maintained through a unified `localStorage` key (`presence:lastSeenAt`).

### E. Rich Chat Input Capabilities
* **Auto-Expanding Textarea:** Adjusts height automatically as multiple lines are typed.
* **Emoji Picker:** Integrated overlay containing reaction and smile emoticons.
* **Multi-file Uploads & Image Editor:** Files (PDFs, docs, images) can be added. Image attachments display a drawing/text annotation editor (canvas markup) directly in the client before submitting.
* **Clipboard Interceptor:** Copying and pasting an image directly into the message input field inserts it as a pending upload.

### F. Message Actions & Receipts
* **Read Receipts:** Double checkmark icons represent delivered (two gray checkmarks) and read (two blue checkmarks) statuses.
* **Message Editing:** Users can edit their messages inline.
* **Message Deletion rules**:
  * **Delete for Everyone (Within 1 Hour)**: Soft-deletes the message for all participants on the backend (replaces content with `"This message was deleted"` and clears attachments).
  * **Delete for Me (Within 2 Hours)**: Hides the message from the user's local view only.
  * **After 2 Hours**: The delete menu action is completely hidden from both the desktop context menu and the mobile bottom sheet.

---

## 3. Global Context Providers

* **[`SocketProvider.jsx`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/context/SocketProvider.jsx):** Provides the active WebSockets instance, online user lists, and connection statuses. Emits `typing` / `stop_typing` events.
* **[`ChatContactsProvider.jsx`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/context/ChatContactsProvider.jsx):** Fetches connections (accepted friend requests) via `/connections` for search lists.
* **[`Chatnotificationprovider.jsx`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/components/pages/chat/Chatnotificationprovider.jsx):** Listens to incoming chat events globally, manages toast alerts, triggers flashing window titles, and manages unread count sync across other views.

---

## 4. WebSockets Connection

The socket initializer in [`src/utils/getSocketInstance.js`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/utils/getSocketInstance.js) connects directly to the production backend websocket server (`SOCKET_API_URL`) using standard `socket.io-client`. It attaches authorization tokens automatically from `localStorage`.

---

## 5. Message Sending Flow (Optimistic Updates)

Messages are sent using a **REST-first, socket-fanout** pattern to avoid race conditions:

1. User presses Enter or clicks Send.
2. An **optimistic message** with a temporary ID (`optimistic-<timestamp>`) is immediately appended to the local `messages` state — the user sees it instantly.
3. `chatAPI.sendMessage()` is called (REST POST). On success, the real server message replaces the optimistic one in state.
4. If the REST call **fails**, the optimistic message is rolled back and removed from state.

---

## 6. API Endpoints (chatAPI)

All chat API calls go through [`src/utils/APIs/chatApi.js`](file:///c:/Users/kotas/Desktop/sf_collab_frontend_v1-sf-reputation-system/src/utils/APIs/chatApi.js) using an Axios instance with JWT token interceptors.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/chat/conversations` | Fetch all conversations for the current user |
| GET | `/chat/conversations/:id` | Fetch a single conversation by ID |
| POST | `/chat/conversations` | Create a generic conversation |
| POST | `/chat/conversations/direct` | Create a direct (1-on-1) conversation |
| POST | `/chat/conversations/group` | Create a group conversation |
| DELETE | `/chat/conversations/:id` | Delete a conversation |
| POST | `/chat/conversations/:id/read` | Mark all messages in a conversation as read |
| GET | `/chat/conversations/:id/messages` | Fetch paginated messages (limit/offset) |
| POST | `/chat/conversations/:id/messages` | Send a text message |
| PUT | `/chat/conversations/:id/messages/:msgId` | Edit a message |
| DELETE | `/chat/conversations/:id/messages/:msgId` | Delete a message (`deleteType: 'everyone'` or `'me'`) |
| POST | `/chat/conversations/:id/files` | Upload a file attachment |
| GET | `/chat/conversations/:id/files` | Fetch conversation files |
| POST | `/chat/conversations/:id/participants` | Add a participant to a group |
| DELETE | `/chat/conversations/:id/participants/:userId` | Remove a participant from a group |
| GET | `/chat/conversations/general` | Get the general chat conversation |
| POST | `/chat/conversations/general/setup` | Setup general chat defaults |
| POST | `/chat/conversations/:id/leave` | Leave a group conversation |
| POST | `/chat/conversations/:id/archive` | Archive a conversation |
| POST | `/chat/conversations/:id/unarchive` | Unarchive a conversation |
| GET | `/chat/conversations/archived` | Get archived conversations |
| POST | `/chat/conversations/:id/pin` | Pin a conversation |
| POST | `/chat/conversations/:id/unpin` | Unpin a conversation |
| POST | `/chat/conversations/:id/messages/:msgId/react` | React to a message with an emoji |
| POST | `/chat/conversations/:id/messages/:msgId/star` | Star a message |
| POST | `/chat/conversations/:id/messages/:msgId/unstar` | Unstar a message |
| POST | `/chat/conversations/:id/messages/:msgId/pin` | Pin a message |
| POST | `/chat/conversations/:id/messages/:msgId/unpin` | Unpin a message |
| POST | `/chat/conversations/:id/messages/:msgId/task` | Save message as a task |
| DELETE | `/chat/conversations/:id/messages/:msgId/task` | Remove message task |
| GET | `/connections` | Get friends (connections) list |
| GET | `/chat/available-targets` | Get available users and groups for new messages |

---

## 7. Layout Breakdown (Desktop – 3-Panel)

The desktop view is a **3-column flex layout** at height `calc(100vh - 64px)` (subtracting the top nav bar):

```
┌─────────────────────────────────────────────────────────┐
│                    Top Navbar (64px)                    │
├──────────────────┬──────────────────────┬───────────────┤
│  LEFT SIDEBAR    │   CENTER (Chat Area) │ RIGHT SIDEBAR │
│  w-80 (320px)    │      flex-1          │  w-60 (240px) │
│                  │                      │               │
│ • Search bar     │ • ChatHeader         │ • Friends list│
│ • Tab filters    │ • Messages list      │   by presence │
│ • Conversation   │   (scrollable)       │ • Click to DM │
│   list           │ • TypingIndicator    │               │
│ • Archive toggle │ • ChatInput          │ (hidden < lg) │
│                  │                      │               │
└──────────────────┴──────────────────────┴───────────────┘
```

* **Left Sidebar:** Collapsible. Toggled via the menu button inside `ChatHeader.jsx`. Background: `bg-zinc-900`, border: `border-zinc-800`.
* **Center Panel:** `bg-zinc-950`. Scrollable messages list. Auto-scrolls to bottom on new messages.
* **Right Sidebar:** Hidden on screens below `lg` (1024px). Shows online friends with presence badges.
* **Color scheme:** Dark theme. Core colors: `zinc-950` (deepest bg), `zinc-900` (sidebar bg), `zinc-800` (hover states), `indigo-500` (primary action), `amber-500` (active tab), `emerald-500` (online indicator), `red-500` (unread badge).

---

## 8. New Message Modal (`NewMessageModal`)

* Triggered by the ✏️ (Edit3) pencil button in the sidebar header or the "Send message" CTA in the empty state.
* Allows the user to:
  1. **Search** users by name (fetches from backend `/users` search endpoint).
  2. **Select a single friend** → calls `chatAPI.createDirectConversation()` (creates or resumes a DM).
  3. **Select multiple friends + enter a group name** → calls `chatAPI.createGroupConversation()`.
* After creation, the new conversation is fetched and immediately selected as the active conversation.

---

## 9. Cross-Tab & Cross-Component Synchronization

The chat uses **three mechanisms** to keep multiple browser tabs and the `ChatDock` widget synchronized:

1. **BroadcastChannel (`sfcollab:chat_tab`):** Syncs the active tab (`all`, `friends`, `groups`, etc.) across open browser tabs in real time.
2. **localStorage `storage` event fallback:** Used for browsers that do not support BroadcastChannel. Listens for `storage` events on tab keys.
3. **Custom DOM Events:** `ChatDock` and `ChatPage` communicate via `window.dispatchEvent` / `window.addEventListener`:
   - `chat:conversationDeleted` — conversation was deleted from the Dock.
   - `chat:newMessage` — a new message arrived (updates the last preview in the list).
4. **Shared localStorage keys for presence:** Both `ChatDock` and `ChatPage` read/write from the same keys:
   - `presence:lastActiveAt` — map of `{userId: timestamp}`
   - `presence:lastSeenAt` — map of `{userId: timestamp}`

---

## 10. Group Membership Management

* **Member list Dropdown**: Clicking the members count in the header for group/general/startup chats toggles an absolute dropdown overlay right below the header.
* **Member Options Modal**: Clicking any member (except "You") in the member dropdown toggles a styled popup modal with actions:
  * `Message Individually`: Instantiates and opens a direct message conversation with that member, focuses that DM, and transitions the active view tab to **Friends** or **All**.
  * `View Profile`: Routes the app to `/user-profile?userId=...` to display the selected user's profile card.
  * `Cancel`: Closes the options modal.
* **Leave Group**: Available in the `ChatHeader` options menu. Calls `chatAPI.leaveConversation()`, dispatches a synchronization event, and redirects the viewport to `/chat`.
