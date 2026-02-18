const industries = [
    "Technology", "Healthcare", "Finance", "Education", 
    "Retail", "Manufacturing", "Entertainment", "Real Estate",
    "Transportation", "Energy", "Agriculture", "Other"
  ];

const fundingRounds = [
    { value: "pre-seed", label: "Pre-Seed", description: "Idea stage, friends & family" },
    { value: "seed", label: "Seed", description: "Product development" },
    { value: "series-a", label: "Series A", description: "Scaling operations" },
    { value: "series-b", label: "Series B", description: "Market expansion" },
    { value: "series-c", label: "Series C+", description: "Growth & acquisitions" },
    { value: "bootstrapped", label: "Bootstrapped", description: "Self-funded" }
  ];

const roleTypes = [
  { value: "full-time", label: "Full Time", description: "Long-term commitment with consistent responsibilities and growth." },
  { value: "part-time", label: "Part Time", description: "Ongoing work with flexible hours." },
  { value: "contract", label: "Contract / Freelance", description: "Short-term or task-based work." },
  { value: "project-based", label: "Project-Based", description: "Fixed scope collaboration." },
  { value: "equity", label: "Equity / Revenue Share", description: "Ownership or shared revenue." },
  { value: "intern", label: "Intern", description: "Learning-focused role." },
  { value: "volunteer", label: "Volunteer", description: "Purpose-driven unpaid contribution." },
  { value: "contributor", label: "Contributor (Flexible)", description: "Open task-based participation." },
  { value: "mentor", label: "Mentor / Advisor", description: "Strategic guidance." }
];
  
const startupStages = [
    { 
      value: "idea", 
      icon: <img loading="lazy" src="/idea.jpg" className="w-14 rounded-full" alt="Concept phase"/>, 
      label: "Idea", 
      description: "Concept phase",
      tooltip: "Just an idea on paper. No product built yet. Looking for co-founders and initial validation."
    },
    { 
      value: "validation", 
      icon: <img loading="lazy" src="/seed.jpg" className="w-14 rounded-full" alt="Initial funding"/>, 
      label: "Validation", 
      description: "Initial funding",
      tooltip: "Secured initial funding. Building MVP. Small team forming. Early customer validation."
    },
    { 
      value: "early", 
      icon: <img loading="lazy" src="/rocket.jpg" className="w-14 rounded-full" alt="Product development"/>, 
      label: "Early", 
      description: "Product development",
      tooltip: "MVP launched. First customers onboarded. Product-market fit exploration. Growing team."
    },
    { 
      value: "growth", 
      icon: <img loading="lazy" src="/progress.jpg" className="w-14 rounded-full" alt="Scaling operations"/>, 
      label: "Growth", 
      description: "Scaling operations",
      tooltip: "Strong product-market fit. Rapid user growth. Scaling team and operations. Series A/B funding."
    },
    { 
      value: "scale", 
      icon: <img loading="lazy" src="/thounder.jpg" className="w-14 rounded-full" alt="Market expansion"/>, 
      label: "Scale", 
      description: "Market expansion",
      tooltip: "Established market position. Expanding to new markets. Large team. Focus on optimization and growth."
    }
  ];
  
const popularTechnologies = [
  // =============================
  // Programming Languages
  // =============================
  "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust",
  "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Julia",
  "Bash", "PowerShell", "Assembly",

  // =============================
  // Frontend & Web
  // =============================
  "HTML", "CSS", "SCSS", "Tailwind CSS", "Bootstrap",
  "React", "Vue", "Angular", "Svelte",
  "Next.js", "Nuxt.js", "Remix", "Astro",
  "WebAssembly", "Progressive Web Apps (PWA)",

  // =============================
  // Backend & APIs
  // =============================
  "Node.js", "Express", "NestJS",
  "Django", "Flask", "FastAPI",
  "Spring Boot", "Laravel", "Ruby on Rails",
  "ASP.NET", "Gin", "Fiber",
  "REST API", "GraphQL", "gRPC", "WebSockets",

  // =============================
  // Databases & Data Storage
  // =============================
  "PostgreSQL", "MySQL", "MariaDB", "SQLite",
  "MongoDB", "Cassandra", "DynamoDB",
  "Redis", "Memcached",
  "Elasticsearch", "OpenSearch",
  "Firebase", "Supabase",
  "Data Warehousing", "Data Lakes",

  // =============================
  // Cloud, DevOps & Infrastructure
  // =============================
  "AWS", "Google Cloud", "Microsoft Azure",
  "Docker", "Kubernetes", "Helm",
  "Terraform", "Pulumi",
  "CI/CD", "GitHub Actions", "GitLab CI",
  "Linux", "Nginx", "Apache",
  "Serverless", "Edge Computing",

  // =============================
  // Mobile & Cross-Platform
  // =============================
  "iOS Development", "Android Development",
  "SwiftUI", "UIKit",
  "Jetpack Compose",
  "React Native", "Flutter", "Expo",
  "Unity Mobile", "Xamarin",

  // =============================
  // AI, Data & Automation
  // =============================
  "Artificial Intelligence", "Machine Learning", "Deep Learning",
  "Natural Language Processing (NLP)",
  "Computer Vision",
  "Reinforcement Learning",
  "Data Science", "Data Engineering",
  "Big Data", "MLOps",
  "Prompt Engineering",
  "Robotic Process Automation (RPA)",

  // =============================
  // Blockchain & Web3
  // =============================
  "Blockchain", "Smart Contracts",
  "Ethereum", "Solana", "Polygon",
  "Bitcoin", "DeFi", "NFTs",
  "Web3", "Decentralized Applications (dApps)",
  "Cryptography",

  // =============================
  // Hardware, Electronics & Robotics
  // =============================
  "Embedded Systems", "Microcontrollers",
  "Arduino", "Raspberry Pi",
  "FPGA", "ASIC Design",
  "Electronics", "Digital Circuits", "Analog Circuits",
  "PCB Design", "IoT Devices",
  "Robotics", "Autonomous Systems",
  "Drones", "Sensors", "Actuators",

  // =============================
  // Manufacturing, Industry & Physical Tech
  // =============================
  "3D Printing", "CNC Machining",
  "Industrial Automation",
  "Mechatronics",
  "Supply Chain Technology",
  "Smart Manufacturing",
  "Industry 4.0",

  // =============================
  // Science, Health & Sustainability
  // =============================
  "Biotechnology", "Bioinformatics",
  "Medical Devices", "HealthTech",
  "Neuroscience", "Cognitive Science",
  "Chemistry", "Material Science",
  "Renewable Energy",
  "Solar Energy", "Wind Energy",
  "Climate Tech", "Carbon Capture",
  "Sustainability",

  // =============================
  // Design, Product & Creative Tech
  // =============================
  "UI/UX Design", "Product Design",
  "Interaction Design",
  "Design Systems",
  "Figma", "Adobe XD", "Sketch",
  "Motion Design", "3D Modeling",
  "Blender", "Cinema 4D",
  "Game Design", "Unity", "Unreal Engine",

  // =============================
  // Business, Growth & Operations
  // =============================
  "Startup Strategy",
  "Product Management",
  "Project Management",
  "Agile", "Scrum", "Kanban",
  "Growth Marketing",
  "SEO", "Content Marketing",
  "Sales Operations",
  "CRM Systems",
  "Customer Success",
  "Business Intelligence",
  "Analytics",

  // =============================
  // Finance, Legal & Compliance
  // =============================
  "FinTech",
  "Payments", "Stripe", "PayPal",
  "Accounting Systems",
  "Financial Modeling",
  "Fundraising",
  "Venture Capital",
  "Legal Compliance",
  "Data Privacy (GDPR)",
  "Cybersecurity",

  // =============================
  // Media, Social & Community
  // =============================
  "Social Platforms",
  "Creator Economy",
  "Community Building",
  "Video Production",
  "Streaming Technology",
  "Audio Engineering",
  "Podcasting",

  // =============================
  // Emerging & Future Tech
  // =============================
  "Quantum Computing",
  "Spatial Computing",
  "Augmented Reality (AR)",
  "Virtual Reality (VR)",
  "Mixed Reality (XR)",
  "Brain-Computer Interfaces (BCI)",
  "Human–AI Collaboration"
];

export { industries, fundingRounds, roleTypes, startupStages, popularTechnologies };