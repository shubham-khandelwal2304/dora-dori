import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Loader2, RotateCcw, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const MASTER_TABLE_CACHE_KEY = "dora_dori_master_table_cache_v1";

/* 
 * SCROLLBAR FIX: Custom always-visible scrollbar styling
 * 
 * Previously: Scrollbar was hidden until page scrolled because the scroll container
 * was nested inside containers that grew beyond viewport height.
 * 
 * Now: Single scroll container constrained by viewport-bound flex layout,
 * ensuring horizontal scrollbar is immediately visible and functional.
 */
const scrollbarStyles = `
  .master-table-scroll-container::-webkit-scrollbar {
    width: 14px;
    height: 14px;
  }
  
  .master-table-scroll-container::-webkit-scrollbar-track {
    background: #FAF8F6;
    border-left: 1px solid #E5DDD5;
    border-top: 1px solid #E5DDD5;
  }
  
  .master-table-scroll-container::-webkit-scrollbar-thumb {
    background: #A27B5C;
    border-radius: 7px;
    border: 3px solid #FAF8F6;
  }
  
  .master-table-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #8B5E34;
  }
  
  .master-table-scroll-container::-webkit-scrollbar-thumb:active {
    background: #6B4423;
  }
  
  .master-table-scroll-container::-webkit-scrollbar-corner {
    background: #FAF8F6;
  }
  
  /* Firefox scrollbar styling */
  .master-table-scroll-container {
    scrollbar-width: thin;
    scrollbar-color: #A27B5C #FAF8F6;
  }
`;

const formatColumnName = (col) => {
  return col.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const MasterTableSection = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
  });
  const { toast } = useToast();

  // Editing state
  const [editingRowId, setEditingRowId] = useState(null);
  const [draftRow, setDraftRow] = useState(null);

  const columns = (data && data.length > 0 && data[0]) ? Object.keys(data[0]) : [];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEditingRowId(null);
    setDraftRow(null);

    try {
      const controller = new AbortController();

      const res = await fetch(`/api/master-table`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }

      const json = await res.json();
      const rows = (json && Array.isArray(json.data)) ? json.data : [];
      setData(rows);
      setPagination({
        total: rows.length,
      });

      // Cache the latest table so we can restore last state without refetching
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(
            MASTER_TABLE_CACHE_KEY,
            JSON.stringify({
              data: rows,
              pagination: { total: rows.length },
              fetchedAt: new Date().toISOString(),
            })
          );
        }
      } catch (storageError) {
        console.error("Failed to cache master table data:", storageError);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Failed to load master table", err);
        setError(err.message || "Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Always fetch fresh data on mount (ignore cache to ensure latest state)
    fetchData();
  }, [fetchData]);

  const handleEditClick = (row) => {
    // Only one row edit at a time
    if (editingRowId !== null) return;
    setEditingRowId(row.style_id);
    setDraftRow({ ...row });
  };

  const handleCancelClick = () => {
    setEditingRowId(null);
    setDraftRow(null);
  };

  const handleSaveClick = async () => {
    if (!editingRowId || !draftRow) return;

    try {
      // Create payload excluding style_id
      const payload = { ...draftRow };
      delete payload.style_id;

      const res = await fetch(`/api/master-table/${editingRowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Update failed');
      }

      const responseData = await res.json();
      const updatedRow = responseData.row;

      // Update local state
      const newData = data.map((r) =>
        r.style_id === editingRowId ? updatedRow : r
      );
      setData(newData);

      toast({
        title: "Saved",
        description: `Style ${editingRowId} updated successfully.`,
      });

      setEditingRowId(null);
      setDraftRow(null);
    } catch (err) {
      console.error("Error saving row:", err);
      toast({
        title: "Error",
        description: err.message || "Could not save changes",
        variant: "destructive",
      });
    }
  };

  /* New Validation: Read-only columns list */
  const readOnlyColumns = new Set([
    'style_id',
    'daily_sales_myntra',
    'daily_sales_nykaa',
    'daily_total_sales',
    'days_of_cover_myntra',
    'days_of_cover_nykaa',
    'total_days_of_cover',
    'sell_through_myntra',
    'sell_through_nykaa',
    'total_sell_through',
    'broken_size_myntra',
    'broken_size_nykaa',
    'fabric_consumed_meters',
    'fabric_consumed_meters_1',
    'fabric_consumed_meters_2',
    'fabric_consumed_meters_3',
    'fabric_remaining_meters_1',
    'fabric_remaining_meters_2',
    'fabric_remaining_meters_3',
    'units_possible_from_fabric',
    'revenue_myntra',
    'revenue_nykaa',
    'total_revenue',
    'roas',
    'contribution_margin_overall',
    'contribution_margin_myntra',
    'contribution_margin_nykaa',
    'size_contribution_myntra_s',
    'size_contribution_myntra_m',
    'size_contribution_myntra_l',
    'size_contribution_myntra_xl',
    'size_contribution_nykaa_s',
    'size_contribution_nykaa_m',
    'size_contribution_nykaa_l',
  ]);

  const handleInputChange = (col, value) => {
    setDraftRow((prev) => ({
      ...prev,
      [col]: value,
    }));
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

      <section className="flex flex-col h-full">
        {/* Header outside card - matches Insights page layout */}
        <div className="flex items-center justify-between mb-4 px-4 sm:px-6 pt-4 sm:pt-6 flex-wrap gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 sm:h-6 sm:w-6" />
            Master Data Table
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="h-8 sm:h-9 text-xs"
            onClick={fetchData}
            disabled={loading}
          >
            <RotateCcw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{loading ? "Refreshing..." : "Refresh"}</span>
            <span className="inline xs:hidden">Sync</span>
          </Button>
        </div>

        {/* Card contains only the table */}
        <Card className="flex flex-col flex-1 min-h-0 mx-4 sm:mx-6 mb-4 sm:mb-6">
          <CardContent className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 md:p-6">
            <Table
              className="min-w-full w-full"
              wrapperClassName="master-table-scroll-container flex-1 min-h-0 rounded-md border"
            >
              <TableHeader className="sticky top-0 bg-background z-20">
                <TableRow className="border-b-2">
                  {/* Actions Column Header - Moved to Start */}
                  {columns.length > 0 && (
                    <TableHead className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-semibold whitespace-nowrap text-left sticky left-0 bg-background z-30 shadow-[5px_0px_5px_-5px_rgba(0,0,0,0.1)]">
                      Actions
                    </TableHead>
                  )}
                  {columns.map((col) => (
                    <TableHead
                      key={col}
                      className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-semibold whitespace-nowrap"
                    >
                      {formatColumnName(col)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="text-center text-muted-foreground py-8"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="text-center text-destructive py-8"
                    >
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="text-center text-muted-foreground py-8"
                    >
                      No styles found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => {
                    const isEditing = editingRowId === row.style_id;
                    const rowKey = row.style_id || index;

                    return (
                      <TableRow key={rowKey} className={`hover:bg-muted/30 transition-colors ${isEditing ? 'bg-muted/20' : ''}`}>
                        {/* Actions Column - Moved to Start */}
                        <TableCell className="py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 text-left sticky left-0 bg-background z-10 shadow-[5px_0px_5px_-5px_rgba(0,0,0,0.1)]">
                          <div className="flex justify-start gap-2">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-100"
                                  onClick={handleCancelClick}
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100"
                                  onClick={handleSaveClick}
                                  title="Save"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => handleEditClick(row)}
                                disabled={editingRowId !== null}
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        {columns.map((col) => {
                          const isReadOnly = readOnlyColumns.has(col) || col === 'style_id';
                          return (
                            <TableCell key={col} className="py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs whitespace-nowrap">
                              {isEditing && !isReadOnly ? (
                                <Input
                                  className="h-7 w-full min-w-[100px] text-xs"
                                  value={draftRow[col] !== null && draftRow[col] !== undefined ? draftRow[col] : ""}
                                  onChange={(e) => handleInputChange(col, e.target.value)}
                                />
                              ) : (
                                row[col] !== null && row[col] !== undefined ? String(row[col]) : ""
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>


            {/* Footer - fixed at bottom, doesn't scroll */}
            <div className="mt-3 sm:mt-4 flex items-center justify-between flex-shrink-0 px-1">
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{pagination.total}</span> styles
              </div>
            </div>
          </CardContent>
        </Card>
      </section >
    </>
  );
};

export default MasterTableSection;
