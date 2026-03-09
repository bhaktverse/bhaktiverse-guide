import { LifeBuoy, MessageCircle, FileText } from "lucide-react";
import AdminChartCard from "@/components/admin/AdminChartCard";

export default function AdminSupport() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Support & Reports</h1>
        <p className="text-sm text-muted-foreground">User feedback and platform reports</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminChartCard title="Support Tickets">
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <LifeBuoy className="h-10 w-10 mb-3 text-primary/40" />
            <p className="text-sm">No support system configured</p>
            <p className="text-xs">Integrate a ticketing system to enable</p>
          </div>
        </AdminChartCard>
        <AdminChartCard title="User Feedback">
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <MessageCircle className="h-10 w-10 mb-3 text-primary/40" />
            <p className="text-sm">Feedback collection pending</p>
            <p className="text-xs">Add in-app feedback forms</p>
          </div>
        </AdminChartCard>
        <AdminChartCard title="Reports">
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 text-primary/40" />
            <p className="text-sm">Automated reports coming soon</p>
            <p className="text-xs">Weekly/monthly platform reports</p>
          </div>
        </AdminChartCard>
      </div>
    </div>
  );
}
