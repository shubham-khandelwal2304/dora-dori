import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const columns = data.length ? Object.keys(data[0]) : [];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();

      const res = await fetch(`/api/master-table`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }

      const json = await res.json();
      const rows = json.data || [];
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
    // On first mount, try to hydrate from cache; if none, fetch once.
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const cached = window.localStorage.getItem(MASTER_TABLE_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.data)) {
            setData(parsed.data);
            if (parsed.pagination && typeof parsed.pagination.total === "number") {
              setPagination(parsed.pagination);
            } else {
              setPagination({ total: parsed.data.length });
            }
            return; // use cached state; don't auto-refresh
          }
        }
      }
    } catch (e) {
      console.error("Failed to read cached master table:", e);
    }

    fetchData();
  }, [fetchData]);

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
          {/* 
            SINGLE SCROLL CONTAINER - The Fix!
            
            PREVIOUS ISSUE:
            - Had max-h-[70vh] but parent containers weren't height-constrained
            - Scrollbar was pushed out of viewport by page growth
            - User had to scroll page to see the horizontal scrollbar
            
            NEW SOLUTION:
            - flex-1: Grows to fill all available CardContent height
            - min-h-0: Critical for nested flex scrolling (prevents content from forcing growth)
            - overflow-x: auto: Shows horizontal scrollbar when table width exceeds container
            - overflow-y: auto: Shows vertical scrollbar when content height exceeds container
            - This is the ONLY scrollable container - no nested scroll areas
            - Constrained by viewport-bound parent, so scrollbar is always visible
          */}
          <div 
            className="master-table-scroll-container flex-1 min-h-0 rounded-md border" 
            style={{ 
              overflowX: 'auto', 
              overflowY: 'auto'
            }}
          >
            {/* 
              TABLE: Wide enough to trigger horizontal scrolling
              - min-w-[1200px] ensures table is wider than typical viewports
              - Table itself does NOT scroll; parent container handles it
            */}
            <Table className="min-w-full w-full">
              <TableHeader className="sticky top-0 bg-muted/50 z-10">
                <TableRow className="border-b-2">
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
                      colSpan={columns.length || 1}
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
                      colSpan={columns.length || 1}
                      className="text-center text-destructive py-8"
                    >
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length || 1}
                      className="text-center text-muted-foreground py-8"
                    >
                      No styles found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                      {columns.map((col) => (
                        <TableCell key={col} className="py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs whitespace-nowrap">
                          {row[col] !== null && row[col] !== undefined
                            ? String(row[col])
                            : ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Footer - fixed at bottom, doesn't scroll */}
          <div className="mt-3 sm:mt-4 flex items-center justify-between flex-shrink-0 px-1">
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{pagination.total}</span> styles
            </div>
          </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default MasterTableSection;

