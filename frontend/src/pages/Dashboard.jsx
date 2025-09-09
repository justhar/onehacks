import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const isBusinessNotOnboarded = user.userType === 'business' && !user.isOnboardingCompleted;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-medium text-foreground">
                Welcome back, {user.fullName}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant={user.userType === 'business' ? 'default' : 'secondary'} className="  px-3 py-1">
                  {user.userType === 'business' ? 'Business' : 'Buyer'}
                </Badge>
                {user.isOnboardingCompleted ? (
                  <Badge variant="outline" className="  px-3 py-1 text-primary border-primary">
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="  px-3 py-1 text-orange-500 border-orange-500">
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="  px-6"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Onboarding Alert for Business */}
        {isBusinessNotOnboarded && (
          <Alert className="mb-12 border-primary/20 bg-accent  ">
            <AlertDescription className="flex items-center justify-between">
              <div className="text-accent-foreground">
                <span className="font-medium">Complete your business setup</span> to start receiving customers
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate('/onboarding/business')}
                className=" "
              >
                Continue Setup
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Content Grid */}
        <div className="grid gap-8">
          {/* Profile Information */}
          <Card className="border border-border  ">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">Profile Information</CardTitle>
              <CardDescription className="text-muted-foreground">Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-gray-700">Email</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-gray-700">Full Name</span>
                <span className="text-gray-900">{user.fullName}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-gray-700">Account Type</span>
                <Badge variant={user.userType === 'business' ? 'default' : 'secondary'}>
                  {user.userType === 'business' ? 'Business' : 'Buyer'}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-gray-700">User ID</span>
                <span className="text-gray-900 font-mono">#{user.id}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {user.userType === 'business' && !user.isOnboardingCompleted && (
            <Card className="border border-border  ">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Get Started</CardTitle>
                <CardDescription className="text-muted-foreground">Complete your business setup</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full  " 
                  onClick={() => navigate('/onboarding/business')}
                >
                  Complete Setup
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
