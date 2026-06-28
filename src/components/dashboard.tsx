import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw, AlertCircle, Search, FolderOpen } from "lucide-react";
import { useProjects } from "../hooks/use-projects";
import { ProjectCard } from "./project-card";
import { EmptyState } from "./empty-state";
import { Button } from "./ui/button";
import { CreateWebsiteModal } from "./create-website-modal";
import { DeleteWebsiteDialog } from "./delete-website-dialog";
import type { Project } from "../types";	export function Dashboard() {
		const { projects, isLoading, error, refetch, addProject, removeProject } = useProjects();
		const [searchQuery, setSearchQuery] = useState("");
		const [showCreateModal, setShowCreateModal] = useState(false);
		const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

		const allProjects = projects;

	const filteredProjects = searchQuery
		? allProjects.filter((p) =>
				p.name.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: allProjects;

	const handleCreateProject = (project: Project) => {
		addProject(project);
	};

	const handleDeleteProject = (project: Project) => {
		setProjectToDelete(project);
	};

	const handleConfirmDelete = (project: Project) => {
		removeProject(project.id);
	};

	return (
		<>
			<DeleteWebsiteDialog
				open={projectToDelete !== null}
				onClose={() => setProjectToDelete(null)}
				project={projectToDelete}
				onConfirmDelete={handleConfirmDelete}
			/>
			<CreateWebsiteModal
				open={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onCreateProject={handleCreateProject}
			/>
			<div className="min-h-screen">
			{/* Navbar */}
			<motion.header
				initial={{ opacity: 0, y: -12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				className="sticky top-0 z-10 border-b border-nav-border bg-nav shadow-sm"
			>
				{/* Accent line */}
				<motion.div
					initial={{ scaleX: 0 }}
					animate={{ scaleX: 1 }}
					transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
					className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/40 via-primary to-primary/40 origin-left"
				/>

				<div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
					{/* Left: Brand + Count */}
					<motion.div
						initial={{ opacity: 0, x: -8 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
						className="flex items-center gap-3"
					>
						<div className="flex items-center gap-3">
							<motion.img
								src="/sfcollab-logo.png"
								alt="SFCollab"
								className="h-6 w-auto"
								initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
								animate={{ opacity: 1, rotate: 0, scale: 1 }}
								transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
							/>
							<div className="flex items-baseline gap-2">
								<motion.h1
									initial={{ opacity: 0, x: -4 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3, delay: 0.2 }}
									className="text-sm font-heading tracking-tight text-foreground"
								>
									SFCollab
								</motion.h1>
							</div>
						</div>
						<motion.div
							initial={{ opacity: 0, scaleX: 0 }}
							animate={{ opacity: 1, scaleX: 1 }}
							transition={{ duration: 0.3, delay: 0.25 }}
							className="h-4 w-px bg-border/60 origin-left"
						/>
						<motion.div
							initial={{ opacity: 0, x: -4 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: 0.3 }}
							className="flex items-center gap-2"
						>
							<motion.span
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3, delay: 0.35 }}
								className="text-xs text-muted-foreground/50"
							>
								Website Generator
							</motion.span>
							{!isLoading && (
								<motion.span
									initial={{ opacity: 0, scale: 0.5 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.4 }}
									className="text-[11px] font-medium text-muted-foreground/60 bg-secondary/60 px-2 py-0.5 rounded-full tabular-nums leading-none"
								>
									{allProjects.length}
								</motion.span>
							)}
						</motion.div>
					</motion.div>

					{/* Right: Actions */}
					<motion.div
						initial={{ opacity: 0, x: 8 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: 0.3 }}
						className="flex items-center gap-1.5"
					>
						{/* Refresh */}
						<Button
							variant="ghost"
							size="icon"
							onClick={refetch}
							disabled={isLoading}
							className="h-8 w-8"
							title="Refresh">
							<RefreshCw
								className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : ""}`}
							/>
						</Button>						{/* New Website */}
						<Button
							onClick={() => setShowCreateModal(true)}
							size="sm"
							className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90 !p-0 h-8 w-8 sm:h-auto sm:w-auto sm:!px-3 sm:!py-1.5">
							<Plus className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">New Website</span>
						</Button>
					</motion.div>
				</div>
			</motion.header>

			<main className="max-w-5xl mx-auto px-6 py-6">
				{/* Search */}
				{allProjects.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						className="relative mb-5">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
						<input
							type="text"
							placeholder="Search websites..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition-all duration-200"
						/>
					</motion.div>
				)}

				{/* Loading */}
				{isLoading && (
					<div className="flex flex-col items-center justify-center py-36 gap-3">
						<div className="relative">
							<div className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center">
								<div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
							</div>
						</div>
						<p className="text-xs text-muted-foreground/60">
							Loading websites...
						</p>
					</div>
				)}

				{/* Error */}
				{!isLoading && error && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="flex flex-col items-center justify-center py-28 gap-5">
						<div className="h-12 w-12 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center justify-center">
							<AlertCircle
								className="h-6 w-6 text-destructive/60"
								strokeWidth={1.5}
							/>
						</div>
						<div className="text-center">
							<h2 className="text-sm font-medium mb-1">
								Failed to load projects
							</h2>
							<p className="text-xs text-muted-foreground/70 max-w-xs">
								{error}
							</p>
						</div>
						<Button
							onClick={refetch}
							variant="outline"
							size="sm"
							className="gap-1.5">
							<RefreshCw className="h-3.5 w-3.5" />
							Try again
						</Button>
					</motion.div>
				)}

				{/* Empty */}
				{!isLoading && !error && allProjects.length === 0 && (
					<EmptyState onCreateNew={() => setShowCreateModal(true)} />
				)}

				{/* Projects */}
				{!isLoading && !error && allProjects.length > 0 && (
					<>
						{/* No results */}
						{filteredProjects.length === 0 && searchQuery && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex flex-col items-center justify-center py-28 gap-5">
								<div className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center">
									<FolderOpen
										className="h-6 w-6 text-muted-foreground/40"
										strokeWidth={1.2}
									/>
								</div>
								<div className="text-center">
									<h2 className="text-sm font-medium mb-1">
										No results found
									</h2>
									<p className="text-xs text-muted-foreground/70">
										No websites match{" "}
										<span className="font-medium text-foreground/60">
											&ldquo;{searchQuery}&rdquo;
										</span>
									</p>
								</div>
								<Button
									onClick={() => setSearchQuery("")}
									variant="outline"
									size="sm">
									Clear search
								</Button>
							</motion.div>
						)}

						{/* Grid */}
						{filteredProjects.length > 0 && (
							<motion.div
								layout
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
								{filteredProjects.map((project, index) => (
									<ProjectCard
										key={project.id}
										project={project}
										index={index}
										onDelete={handleDeleteProject}
									/>
								))}

								{/* Add new card */}
								<motion.div
									initial={{ opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.35,
										delay: filteredProjects.length * 0.06,
										ease: [0.25, 0.1, 0.25, 1],
									}}>
									<button
										onClick={() => setShowCreateModal(true)}
										className="w-full h-full min-h-[140px] rounded-xl border border-dashed border-border hover:border-primary/30 bg-transparent hover:bg-accent transition-all duration-200 flex flex-col items-center justify-center gap-2.5 cursor-pointer group">
										<div className="h-8 w-8 rounded-lg border border-border/60 group-hover:border-primary/20 flex items-center justify-center transition-all duration-200">
											<Plus className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors duration-200" />
										</div>
										<span className="text-xs font-medium text-muted-foreground/60 group-hover:text-primary transition-colors duration-200">
											New Website
										</span>
									</button>
								</motion.div>
							</motion.div>
						)}
					</>
				)}
			</main>
			</div>
		</>
	);
}
