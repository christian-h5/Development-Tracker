import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CalculatorUnitType, InsertCalculatorUnitType } from "@shared/schema";

export default function CalculatorUnitTypeManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnitType, setEditingUnitType] = useState<CalculatorUnitType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    squareFootage: "",
    bedrooms: "",
    description: ""
  });

  const { toast } = useToast();

  // Query for calculator unit types
  const { data: calculatorUnitTypes = [], isLoading } = useQuery({
    queryKey: ["/api/calculator-unit-types"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertCalculatorUnitType) => {
      return apiRequest("POST", "/api/calculator-unit-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculator-unit-types"] });
      handleCloseDialog();
      toast({ title: "Calculator unit type created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create calculator unit type", variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCalculatorUnitType> }) => {
      return apiRequest("PUT", `/api/calculator-unit-types/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculator-unit-types"] });
      handleCloseDialog();
      toast({ title: "Calculator unit type updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update calculator unit type", variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/calculator-unit-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculator-unit-types"] });
      toast({ title: "Calculator unit type deleted successfully" });
    },
    onError: (error: any) => {
      const message = error.message?.includes("Cannot delete unit type that has saved scenarios") 
        ? "Cannot delete unit type that has saved scenarios"
        : "Failed to delete calculator unit type";
      toast({ title: message, variant: "destructive" });
    },
  });

  const handleOpenDialog = (unitType?: CalculatorUnitType) => {
    if (unitType) {
      setEditingUnitType(unitType);
      setFormData({
        name: unitType.name,
        squareFootage: unitType.squareFootage.toString(),
        bedrooms: unitType.bedrooms.toString(),
        description: unitType.description || ""
      });
    } else {
      setEditingUnitType(null);
      setFormData({
        name: "",
        squareFootage: "",
        bedrooms: "",
        lockOffFlexRooms: "",
        description: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUnitType(null);
    setFormData({
      name: "",
      squareFootage: "",
      bedrooms: "",
      description: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      squareFootage: parseInt(formData.squareFootage),
      bedrooms: parseInt(formData.bedrooms) || 1,
      lockOffFlexRooms: 0, // Always set to 0 for calculator unit types
      description: formData.description || undefined
    };

    if (editingUnitType) {
      await updateMutation.mutateAsync({ id: editingUnitType.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this calculator unit type?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Calculator Unit Types</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Manage unit types for the calculator (independent from project tracking)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Unit Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUnitType ? "Edit Calculator Unit Type" : "Add New Calculator Unit Type"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Studio Apartment"
                  />
                </div>
                <div>
                  <Label htmlFor="squareFootage">Square Footage</Label>
                  <Input
                    id="squareFootage"
                    type="number"
                    value={formData.squareFootage}
                    onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                    required
                    placeholder="e.g., 750"
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    placeholder="e.g., 1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Compact studio unit for urban development"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading calculator unit types...</div>
        ) : calculatorUnitTypes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No calculator unit types found. Add one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Square Footage</TableHead>
                <TableHead>Bedrooms</TableHead>

                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculatorUnitTypes.map((unitType: CalculatorUnitType) => (
                <TableRow key={unitType.id}>
                  <TableCell className="font-medium">{unitType.name}</TableCell>
                  <TableCell>{unitType.squareFootage.toLocaleString()} sq ft</TableCell>
                  <TableCell>{unitType.bedrooms}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {unitType.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(unitType)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(unitType.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}