import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FilterPanel = ({ filters, setFilters }) => {
  return (
    <aside className="w-64 border-r bg-card p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="platform" className="text-sm font-medium mb-2 block">
              Platform
            </Label>
            <Select
              value={filters.platform}
              onValueChange={(value) => setFilters({ ...filters, platform: value })}
            >
              <SelectTrigger id="platform" className="bg-background">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="myntra">Myntra</SelectItem>
                <SelectItem value="nykaa">Nykaa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category" className="text-sm font-medium mb-2 block">
              Category
            </Label>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger id="category" className="bg-background">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="dress">Dress</SelectItem>
                <SelectItem value="kurta">Kurta</SelectItem>
                <SelectItem value="coord">Co-ord</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="top">Top</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="season" className="text-sm font-medium mb-2 block">
              Season
            </Label>
            <Select
              value={filters.season}
              onValueChange={(value) => setFilters({ ...filters, season: value })}
            >
              <SelectTrigger id="season" className="bg-background">
                <SelectValue placeholder="All Seasons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                <SelectItem value="ss25">SS25</SelectItem>
                <SelectItem value="aw25">AW25</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Active Alerts
          </h3>
          <Badge variant="destructive" className="rounded-full">
            12
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          View all critical and warning alerts
        </p>
      </div>
    </aside>
  );
};

export default FilterPanel;


