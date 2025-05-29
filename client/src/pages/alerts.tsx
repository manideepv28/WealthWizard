import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Calendar, TrendingUp, X, Settings } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { LocalStorageService } from "@/lib/storage";

export default function Alerts() {
  const user = AuthService.getCurrentUser();
  const alerts = user ? LocalStorageService.getAlerts(user.id) : [];

  const handleMarkAsRead = (alertId: number) => {
    LocalStorageService.markAlertAsRead(alertId);
    // In a real app, you'd trigger a re-render here
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'nav_change':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'sip_due':
        return <Calendar className="w-5 h-5 text-green-600" />;
      case 'rebalance':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'goal_achieved':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'nav_change':
        return 'bg-blue-100';
      case 'sip_due':
        return 'bg-green-100';
      case 'rebalance':
        return 'bg-yellow-100';
      case 'goal_achieved':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h2>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Alert Settings
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <Card key={alert.id} className={`${alert.isRead ? 'opacity-75' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 ${getAlertBgColor(alert.type)} rounded-lg flex items-center justify-center`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{alert.title}</h3>
                        {!alert.isRead && (
                          <Badge variant="destructive" className="text-xs px-2 py-1">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{alert.description}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(alert.createdAt!).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts</h3>
              <p className="text-gray-500 mb-4">
                You're all caught up! New alerts will appear here when there are important updates about your investments.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>You'll receive alerts for:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Significant NAV changes</li>
                  <li>Upcoming SIP payments</li>
                  <li>Portfolio rebalancing recommendations</li>
                  <li>Goal achievements</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sample alerts for demo */}
      {alerts.length === 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Sample Alerts</h3>
          <Card className="opacity-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">SIP Due Tomorrow</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Your SIP for Axis Bluechip Fund (₹5,000) is scheduled for tomorrow.
                    </p>
                    <p className="text-gray-500 text-xs mt-2">Sample alert</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">NAV Update</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Mirae Asset Large Cap Fund NAV increased by 2.5% today.
                    </p>
                    <p className="text-gray-500 text-xs mt-2">Sample alert</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
