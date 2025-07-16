import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Home, Bed, FlipHorizontal, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UnitType } from "@shared/schema";

export default function UnitTypeManager() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnitType, setEditingUnitType] = useState<UnitType | null>(null);
  const [name, setName] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [lockOffFlexRooms, setLockOffFlexRooms] = useState("");
  const [totalUnitsInDevelopment, setTotalUnitsInDevelopment] = useState("");

  const { data: unitTypes = [] } = useQuery<UnitType[]>({
    queryKey: ["/api/unit-types"],
  });

  const saveUnitTypeMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingUnitType) {
        return apiRequest("PUT", `/api/unit-types/${editingUnitType.id}`, data);
      } else {
        return apiRequest("POST", "/api/unit-types", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/unit-types"] });
      toast({ title: editingUnitType ? "Unit type updated successfully" : "Unit type created successfully" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Failed to save unit type", variant: "destructive" });
    },
  });

  const deleteUnitTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/unit-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/unit-types"] });
      toast({ title: "Unit type deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete unit type", variant: "destructive" });
    },
  });

  const handleDeleteUnitType = (unitType: UnitType) => {
    if (confirm(`Are you sure you want to delete "${unitType.name}"? This action cannot be undone.`)) {
      deleteUnitTypeMutation.mutate(unitType.id);
    }
  };

  const handleOpenDialog = (unitType?: UnitType) => {
    if (unitType) {
      setEditingUnitType(unitType);
      setName(unitType.name);
      setSquareFootage(unitType.squareFootage.toString());
      setBedrooms(unitType.bedrooms.toString());
      setLockOffFlexRooms(unitType.lockOffFlexRooms.toString());
      setTotalUnitsInDevelopment((unitType.totalUnitsInDevelopment || 0).toString());
    } else {
      setEditingUnitType(null);
      setName("");
      setSquareFootage("");
      setBedrooms("");
      setLockOffFlexRooms("");
      setTotalUnitsInDevelopment("");
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUnitType(null);
    setName("");
    setSquareFootage("");
    setBedrooms("");
    setLockOffFlexRooms("");
    setTotalUnitsInDevelopment("");
  };

  const handleSave = async () => {
    const data = {
      name,
      squareFootage: parseInt(squareFootage),
      bedrooms: parseInt(bedrooms) || 1,
      lockOffFlexRooms: parseInt(lockOffFlexRooms) || 0,
      totalUnitsInDevelopment: parseInt(totalUnitsInDevelopment) || 0,
    };

    await saveUnitTypeMutation.mutateAsync(data);
  };

  const getTotalBedrooms = () => {
    return unitTypes.reduce((total, unitType) => {
      return total + (unitType.bedrooms * unitType.totalUnitsInDevelopment);
    }, 0);
  };

  const getTotalLockOffRooms = () => {
    return unitTypes.reduce((total, unitType) => {
      return total + (unitType.lockOffFlexRooms * unitType.totalUnitsInDevelopment);
    }, 0);
  };

  const getTotalUnits = () => {
    return unitTypes.reduce((total, unitType) => total + unitType.totalUnitsInDevelopment, 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Unit Type Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Unit Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUnitType ? "Edit Unit Type" : "Add New Unit Type"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Unit Type Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Type A"
                  />
                </div>

                <div>
                  <Label htmlFor="squareFootage">Square Footage</Label>
                  <Input
                    id="squareFootage"
                    type="number"
                    value={squareFootage}
                    onChange={(e) => setSquareFootage(e.target.value)}
                    placeholder="e.g., 1200"
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms">Number of Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    placeholder="e.g., 2"
                  />
                </div>

                <div>
                  <Label htmlFor="lockOffFlexRooms">Lock-Off Flex Rooms</Label>
                  <Input
                    id="lockOffFlexRooms"
                    type="number"
                    value={lockOffFlexRooms}
                    onChange={(e) => setLockOffFlexRooms(e.target.value)}
                    placeholder="e.g., 1"
                  />
                </div>

                <div>
                  <Label htmlFor="totalUnitsInDevelopment">Total Units in Development</Label>
                  <Input
                    id="totalUnitsInDevelopment"
                    type="number"
                    value={totalUnitsInDevelopment}
                    onChange={(e) => setTotalUnitsInDevelopment(e.target.value)}
                    placeholder="e.g., 120"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!name || !squareFootage || saveUnitTypeMutation.isPending}
                >
                  {saveUnitTypeMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-gray-600 text-sm">
          Manage unit types, their specifications, and total quantities in the development
        </p>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Type</TableHead>
                <TableHead>Square Footage</TableHead>
                <TableHead>Bedrooms</TableHead>
                <TableHead>Lock-Off Flex Rooms</TableHead>
                <TableHead>Total Units</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unitTypes.map((unitType) => (
                <TableRow key={unitType.id}>
                  <TableCell className="font-medium">{unitType.name}</TableCell>
                  <TableCell>{unitType.squareFootage.toLocaleString()} sq ft</TableCell>
                  <TableCell>{unitType.bedrooms}</TableCell>
                  <TableCell>{unitType.lockOffFlexRooms}</TableCell>
                  <TableCell>{unitType.totalUnitsInDevelopment}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(unitType)}
                        className="hover:bg-gray-50 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUnitType(unitType)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Project Totals */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Home className="text-blue-600 h-5 w-5 mr-2" />
              <span className="text-blue-800 font-medium">Total Units</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{getTotalUnits()}</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Bed className="text-green-600 h-5 w-5 mr-2" />
              <span className="text-green-800 font-medium">Total Bedrooms</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{getTotalBedrooms()}</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FlipHorizontal className="text-purple-600 h-5 w-5 mr-2" />
              <span className="text-purple-800 font-medium">Lock-Off Flex Rooms</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{getTotalLockOffRooms()}</div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Home className="text-orange-600 h-5 w-5 mr-2" />
              <span className="text-orange-800 font-medium">Avg Size</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {getTotalUnits() > 0 
                ? Math.round(unitTypes.reduce((total, ut) => total + (ut.squareFootage * ut.totalUnitsInDevelopment), 0) / getTotalUnits()) 
                : 0
              } sq ft
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}