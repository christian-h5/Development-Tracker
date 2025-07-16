
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, InsertProject } from "@shared/schema";

interface ProjectSelectorProps {
  onSelectProject: (projectId: number) => void;
}

export default function ProjectSelector({ onSelectProject }: ProjectSelectorProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const { toast } = useToast();

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      return await apiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateModalOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
      onSelectProject(newProject.id);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    createProjectMutation.mutate({
      name: newProjectName,
      description: newProjectDescription || undefined,
      totalPhases: 12,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">DevTracker Pro</h1>
        <p className="text-lg text-gray-600">Select a project to manage or create a new one</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {projects.map((project: Project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  {project.name}
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{project.description || "No description"}</p>
              <Button 
                onClick={() => onSelectProject(project.id)}
                className="w-full"
              >
                Open Project
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Plus className="h-5 w-5 mr-2" />
              Create New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="projectDescription">Description (Optional)</Label>
                <Input
                  id="projectDescription"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                  className="flex-1"
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
