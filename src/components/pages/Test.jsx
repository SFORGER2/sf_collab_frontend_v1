import React, { useEffect, useState, useRef } from "react";
import LaserFlow from '../ui/LaserFlow';
import { FaUserPlus } from "react-icons/fa6";
import { IoLogIn } from "react-icons/io5";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {Button} from "../ui/button";
import StarBorder from '../ui/StarBorder'
import { TrendingUpIcon, UsersIcon, DollarSignIcon, ActivityIcon, LogIn } from "lucide-react"
import {   TrendingUp, Activity } from 'lucide-react';
import Silk from "../ui/Silk";
import { FaLaptopCode } from "react-icons/fa";
import ProfileCard from '../ui/ProfileCard'
import { Badge } from '../ui/badge';
import GradientText from '../ui/GradientText';
import { ShineButton } from '../lightswind/shine-button';

import DocViewer from "react-doc-viewer";
import { DocViewerRenderers } from "react-doc-viewer";

import { FollowerPointerCard } from "../ui/following-pointer";

const themes = [
  {
    theme: "dark",
    textColor: "#ffffff",
    background: (
      <div className="min-h-full w-full bg-black relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
              radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
              radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
            `,
          }}
        />
      </div>
    ),
  },
  {
    theme: "sunset",
    textColor: "#ffffff",
    background: (
      <div className="min-h-full w-full bg-gradient-to-br from-orange-500 via-pink-600 to-purple-800 relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255, 165, 0, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 105, 180, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 60%)
            `,
          }}
        />
      </div>
    ),
  },
  {
    theme: "ocean",
    textColor: "#ffffff",
    background: (
      <div className="min-h-full w-full bg-gradient-to-b from-cyan-900 via-blue-800 to-indigo-900 relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 10% 10%, rgba(34, 211, 238, 0.4) 0%, transparent 40%),
              radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(29, 78, 216, 0.2) 0%, transparent 50%)
            `,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-400/20 to-transparent" />
      </div>
    ),
  },
  {
    theme: "forest",
    textColor: "#ffffff",
    background: (
      <div className="min-h-full w-full bg-gradient-to-b from-emerald-900 via-green-900 to-gray-900 relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 70%, rgba(16, 185, 129, 0.4) 0%, transparent 40%),
              radial-gradient(circle at 70% 30%, rgba(5, 150, 105, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(22, 101, 52, 0.2) 0%, transparent 50%)
            `,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-emerald-600/10 to-transparent" />
      </div>
    ),
  },
];

function ThemePreference({ onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {themes.map((item, index) => (
        <div
          key={index}
          className="relative rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg hover:border-primary transition-all duration-300 cursor-pointer group"
          onClick={() => onSelect?.(item)}
        >
          {/* Background Preview Slot */}
          <div className="h-48 w-full relative">
            {/** item.background is JSX */}
            {item.background}
          </div>

          {/* Footer Info */}
          <div className="p-3 flex justify-between items-center bg-background/60 backdrop-blur-sm">
            <p
              className="text-sm font-medium"
              style={{ color: item.textColor }}
            >
              {item.theme}
            </p>

            <div
              className="w-4 h-4 rounded-full border"
              style={{ background: item.textColor }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}


// import { FollowerPointerCard } from "../ui/following-pointer";

export function FollowingPointerDemo() {
  return (
      <FollowerPointerCard
        title={
          <TitleComponent title={blogContent.author} avatar={blogContent.authorAvatar} />
        }>
        <div
          className="group relative h-full overflow-hidden rounded-2xl border border-zinc-100 bg-white transition duration-200 hover:shadow-xl">
          <div
            className="relative aspect-[16/10] w-full overflow-hidden rounded-tl-lg rounded-tr-lg bg-gray-100">
            <img
              src={blogContent.image}
              alt="thumbnail"
              className="h-full transform object-cover transition duration-200 group-hover:scale-95 group-hover:rounded-2xl" />
          </div>
          <div className="p-4">
            <h2 className="my-4 text-lg font-bold text-zinc-700">
              {blogContent.title}
            </h2>
            <h2 className="my-4 text-sm font-normal text-zinc-500">
              {blogContent.description}
            </h2>
            <div className="mt-10 flex flex-row items-center justify-between">
              <span className="text-sm text-gray-500">{blogContent.date}</span>
              <div
                className="relative z-10 block rounded-xl bg-black px-6 py-2 text-xs font-bold text-white">
                Read More
              </div>
            </div>
          </div>
        </div>
      </FollowerPointerCard>
  );
}

const blogContent = {
  slug: "amazing-tailwindcss-grid-layouts",
  author: "Manu Arora",
  date: "28th March, 2023",
  title: "Amazing Tailwindcss Grid Layout Examples",
  description:
    "Grids are cool, but Tailwindcss grids are cooler. In this article, we will learn how to create amazing Grid layouts with Tailwindcs grid and React.",
  image: "/demo/thumbnail.png",
  authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

const TitleComponent = ({
  title,
  avatar
}) => (
  <div className="flex items-center space-x-2">
    <img
      src={avatar}
      height="20"
      width="20"
      alt="thumbnail"
      className="rounded-full border-2 border-white" />
    <p>{title}</p>
  </div>
);


// function DocumentViewer() {
//   const docs = [
//     { 
//       uri: import("/CV minimal.pdf"), // Test PDF
//       fileName: "Sample PDF Document.pdf"
//     },
//     // Add your local files here
//     // { uri: "/docs/my-presentation.pptx", fileName: "My Presentation.pptx" }
//   ];

//   return (
//     <div style={{ 
//       height: "100vh", 
//       width: "100%",
//       display: "flex",
//       flexDirection: "column"
//     }}>
//       <h1 style={{ padding: "20px" }}>Document Viewer</h1>
//       <div style={{ 
//         flex: 1,
//         border: "1px solid #ddd",
//         borderRadius: "8px",
//         overflow: "hidden",
//         margin: "0 20px 20px 20px"
//       }}>
//         <DocViewer 
//           documents={docs}
//           pluginRenderers={DocViewerRenderers}
//           config={{
//             header: {
//               disableHeader: false,
//               disableFileName: false,
//               retainURLParams: false
//             }
//           }}
//           theme={{
//             primary: "#5296d8",
//             secondary: "#ffffff",
//             tertiary: "#5296d899",
//             text_primary: "#ffffff",
//             text_secondary: "#5296d8",
//             text_tertiary: "#00000099",
//             disableThemeScrollbar: false,
//           }}
//           style={{ 
//             height: "100%",
//             width: "100%" 
//           }}
//         />
//       </div>
//     </div>
//   );
// }


export default function Test() {

  return (
    <FollowingPointerDemo />
  );
}
