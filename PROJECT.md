# SFCOLAB Frontend Project Summary

## 📱 **Project Overview**

**SFCOLAB** is a startup collaboration platform built with **React.js + Vite**, connecting entrepreneurs, developers, and professionals. Features dark theme design with **Tailwind CSS** and mobile-first responsive approach.

**Tech Stack**: React 18, React Router v6, Tailwind CSS, React Icons, Context API, JWT Auth

---

## 🎯 **Page Functions & Analysis**

### **1. Home (`/`) - Project Discovery Hub**
**File**: `src/components/pages/Home.jsx`
- **Purpose**: Main landing page showcasing available projects
- **Features**: Search & filter projects by location/stage/industry, project cards with team info
- **Data**: Project cards with progress, deadlines, team members, requirements

### **2. Ideation (`/ideation`) - Idea Sharing Platform**
**File**: `src/components/pages/Ideation.jsx`
- **Purpose**: Community platform for sharing and discussing project ideas
- **Features**: Idea posts with likes/comments, stage tracking, author profiles
- **Data**: Ideas with collaboration metrics, tags, creation dates

### **3. Projects (`/projects`) - Contributor Discovery**
**File**: `src/components/pages/Project.jsx`
- **Purpose**: Professional networking to find developers, designers, contributors
- **Features**: Profile discovery, skills filtering, availability status, ratings
- **Data**: User profiles with skills, experience, availability, project history

### **4. Knowledge (`/knowledge`) - Resource Library**
**File**: `src/components/pages/Knowledge.jsx`
- **Purpose**: Learning platform with articles, guides, tutorials
- **Features**: Resource sharing, category filtering, sorting, file types
- **Data**: Articles, tutorials, case studies with engagement metrics

### **5. Startup (`/startup`) - Company Showcase**
**File**: `src/components/pages/StartUp.jsx`
- **Purpose**: Startup discovery and company profiles
- **Features**: Company listings, industry/stage filtering, funding info
- **Data**: Startup profiles with team, funding, growth metrics

### **6. Dashboard (`/dashboard`) - Personal Hub**
**File**: `src/components/pages/dashboard.jsx`
- **Purpose**: Personal productivity dashboard
- **Features**: World clock, calendar, tasks, progress tracking
- **Layout**: 3-column desktop, mobile-optimized widgets

### **7. Authentication Pages**
- **Login** (`/login`): User authentication with OAuth
- **SignUp** (`/signup`): User registration
- **OAuth Callback** (`/auth/callback`): Google OAuth handling

### **8. Settings Pages**
- **Profile** (`/profile`): User profile management
- **Settings** (`/setting`): Account preferences and security
- **Help** (`/help`): Support and documentation

### **9. Detail Pages**
- **Home Details**: Individual project details
- **Startup Details**: Company profile details
- **Knowledge Details**: Resource detailed view
- **Project Details**: Contributor profile details
- **Ideation Details**: Idea detailed discussion

---

## 🏗️ **Architecture Components**

### **Layout System**

- **Layout.jsx**: Main wrapper with responsive navigation
- **Desktop**: Fixed sidebar navigation
- **Mobile**: Bottom navigation bar with filled/outline icons

### **Navigation Structure**

- **SideBar**: Desktop vertical navigation (Home, Dashboard, Ideation, Knowledge, Projects, Startup)
- **MobileNavBar**: Mobile bottom nav with React Icons
- **NavBar**: Top navigation with user profile and notifications

### **Authentication System**

- **AuthContext**: Global auth state management
- **ProtectedRoute**: Route guards for authenticated users
- **AuthRoute**: Prevents access to login/signup when authenticated

### **Common Patterns**

- **Search & Filter**: Every page has real-time search with multi-criteria filtering
- **State Lifting**: Search/filter states managed at page level, passed to headers
- **Responsive Cards**: Grid layouts that adapt mobile → desktop
- **ScrollToTop**: Reusable scroll-to-top button on all main pages

---

## 🎨 **Design System**

### **Color Scheme**

```css
Background: #000000 (Black)
Cards: #1A1A1A (Dark Gray)
Borders: #262626 (Subtle Gray)
Text: #FFFFFF (White)
```

### **Component Types**

- **Cards**: Project, profile, startup, knowledge resource cards
- **Headers**: Page-specific headers with search and filters
- **Sections**: Reusable widgets (Tasks, Calendar, Clock)
- **Forms**: Dark theme with validation

---

## 🔄 **State Management**

### **Authentication State** (Context API)

```javascript
{
  isAuthenticated: boolean,
  user: UserObject,
  loading: boolean
}
```

### **Page State Pattern** (All main pages)

```javascript
const [searchQuery, setSearchQuery] = useState("");
const [selectedFilters, setSelectedFilters] = useState("All");
const filteredData = useMemo(() => {
  /* filtering logic */
}, [searchQuery, filters]);
```

---

## 📊 **Key Features**

1. **Real-time Search**: Instant filtering across all content pages
2. **Responsive Design**: Mobile-first with adaptive layouts
3. **Authentication Flow**: JWT-based with OAuth integration
4. **Route Protection**: Proper auth guards and redirects
5. **Dark Theme**: Consistent dark UI across all components
6. **Mobile Navigation**: Bottom nav with icon state changes
7. **Filtering System**: Multi-criteria filtering on every page
8. **Component Reusability**: Shared headers, cards, sections

---

## 🚀 **Technical Highlights**

- **Modern React**: Hooks, Context API, functional components
- **Performance**: useMemo for filtering, optimized re-renders
- **Routing**: React Router v6 with nested routes
- **Responsive**: Tailwind CSS mobile-first breakpoints
- **Icons**: React Icons with dynamic fill states
- **State**: Lifting state up pattern for search/filters
- **Architecture**: Clean component separation and reusability

**Project Structure**: Well-organized with clear separation of pages, sections, headers, and utilities. Each page follows consistent patterns for search, filtering, and data display.
