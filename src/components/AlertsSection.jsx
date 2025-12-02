import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const alertsData = [
  {
    styleId: "DD-DR-001",
    styleName: "Floral Kurta Set",
    platform: "Myntra",
    alertType: "Low Stock",
    severity: "critical",
    message: "Available units < reorder point (5 units left)",
    date: "2025-11-08",
  },
  {
    styleId: "DD-CO-045",
    styleName: "Cotton Co-ord",
    platform: "Nykaa",
    alertType: "High Return",
    severity: "warning",
    message: "Return rate 12% (threshold: 10%)",
    date: "2025-11-07",
  },
  {
    styleId: "DD-DR-023",
    styleName: "Silk Maxi Dress",
    platform: "Myntra",
    alertType: "Broken Size Curve",
    severity: "warning",
    message: "Missing sizes: M, L",
    date: "2025-11-08",
  },
  {
    styleId: "FABRIC-001",
    styleName: "Cotton Voile",
    platform: "All",
    alertType: "Fabric Reorder",
    severity: "critical",
    message: "Available: 150m < Reorder point: 200m",
    date: "2025-11-09",
  },
  {
    styleId: "DD-KU-089",
    styleName: "Printed Kurta",
    platform: "Nykaa",
    alertType: "Low Stock",
    severity: "stable",
    message: "Stock at moderate level",
    date: "2025-11-06",
  },
];

const AlertsSection = () => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      case "stable":
        return "secondary";
      default:
        return "default";
    }
  };

  const [severityFilter, setSeverityFilter] = useState("critical-warning");
  const [platformFilter, setPlatformFilter] = useState("all");

  const filteredAlerts = alertsData.filter((alert) => {
    const severityOk =
      severityFilter === "all" ||
      (severityFilter === "critical-warning" &&
        (alert.severity === "critical" || alert.severity === "warning")) ||
      alert.severity === severityFilter;

    const platformOk =
      platformFilter === "all" || alert.platform.toLowerCase() === platformFilter;

    return severityOk && platformOk;
  });

  return (
    <section>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-xl">Inventory Alerts</CardTitle>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Severity:</span>
                <div className="inline-flex rounded-full border bg-muted px-1 py-0.5">
                  {["critical-warning", "critical", "warning", "stable", "all"].map(
                    (key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSeverityFilter(key)}
                        className={`px-2 py-0.5 rounded-full transition-colors ${
                          severityFilter === key
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground"
                        }`}
                      >
                        {key === "critical-warning"
                          ? "Critical + Warning"
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Platform:</span>
                <div className="inline-flex rounded-full border bg-muted px-1 py-0.5">
                  {[
                    { key: "all", label: "All" },
                    { key: "myntra", label: "Myntra" },
                    { key: "nykaa", label: "Nykaa" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPlatformFilter(key)}
                      className={`px-2 py-0.5 rounded-full transition-colors ${
                        platformFilter === key
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Style ID</TableHead>
                  <TableHead>Style Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Alert Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Alert date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert, index) => (
                  <TableRow
                    key={index}
                    className={`border-l-4 ${
                      alert.severity === "critical"
                        ? "border-destructive/80"
                        : alert.severity === "warning"
                        ? "border-warning/80"
                        : "border-muted"
                    }`}
                  >
                    <TableCell className="font-mono text-sm">
                      {alert.styleId}
                    </TableCell>
                    <TableCell className="font-medium">{alert.styleName}</TableCell>
                    <TableCell>{alert.platform}</TableCell>
                    <TableCell>{alert.alertType}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {alert.message.split(/(\d+[%\d\s\w]+)/).map((part, i) =>
                        /\d/.test(part) ? (
                          <span key={i} className="font-semibold text-foreground">
                            {part}
                          </span>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{alert.date}</TableCell>
                    <TableCell className="text-right text-xs">
                      <button
                        type="button"
                        className="px-2 py-1 border rounded-full text-[11px] hover:bg-accent transition-colors"
                        onClick={() =>
                          console.log("Open alert for style", alert.styleId)
                        }
                      >
                        Open
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default AlertsSection;


