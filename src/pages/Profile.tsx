
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Briefcase, Building, Phone, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  if (!currentUser) return null;

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
    setIsEditing(false);
  };

  const renderBasicInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Avatar className="h-24 w-24">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="rounded-full" />
            ) : (
              <div className="bg-architect text-white h-24 w-24 rounded-full flex items-center justify-center text-3xl">
                {currentUser.name?.[0]?.toUpperCase()}
              </div>
            )}
          </Avatar>
          
          {isEditing && (
            <div className="flex-1">
              <Label htmlFor="avatar-upload">Profile Picture</Label>
              <Input id="avatar-upload" type="file" className="mt-1" />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          {isEditing ? (
            <Input id="name" defaultValue={currentUser.name} />
          ) : (
            <p className="text-foreground">{currentUser.name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          {isEditing ? (
            <Input id="email" type="email" defaultValue={currentUser.email} />
          ) : (
            <p className="text-foreground">{currentUser.email}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>User Role</Label>
          <div className="flex">
            <Badge className="capitalize bg-architect text-white">
              {currentUser.role}
            </Badge>
          </div>
        </div>
        
        {currentUser.role === "architect" && (
          <div className="space-y-2">
            <Label htmlFor="hourly-rate">Hourly Rate</Label>
            {isEditing ? (
              <Input id="hourly-rate" type="number" defaultValue="75" />
            ) : (
              <p className="text-foreground">$75 / hour</p>
            )}
          </div>
        )}
        
        {currentUser.role === "client" && (
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            {isEditing ? (
              <Input id="company" defaultValue="ABC Construction" />
            ) : (
              <p className="text-foreground">ABC Construction</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isEditing ? (
          <div className="flex gap-2">
            <Button onClick={handleSaveProfile}>Save Changes</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </CardFooter>
    </Card>
  );

  const renderArchitectProfile = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Your professional details and skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skills">Skills & Expertise</Label>
            {isEditing ? (
              <Textarea 
                id="skills" 
                defaultValue="Residential Design, Commercial Architecture, Sustainable Building, 3D Modeling, Interior Design"
                className="min-h-[100px]"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {["Residential Design", "Commercial Architecture", "Sustainable Building", "3D Modeling", "Interior Design"].map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            {isEditing ? (
              <Input id="experience" type="number" defaultValue="8" />
            ) : (
              <p className="text-foreground">8 years</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio Link</Label>
            {isEditing ? (
              <Input id="portfolio" defaultValue="https://portfolio.architect.com" />
            ) : (
              <a href="#" className="text-primary hover:underline">https://portfolio.architect.com</a>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Time Tracking Summary</CardTitle>
          <CardDescription>Overview of your tracked hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary p-4 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">This Week</p>
              <p className="text-2xl font-bold">24.5 hrs</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">This Month</p>
              <p className="text-2xl font-bold">87.3 hrs</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">Average Daily</p>
              <p className="text-2xl font-bold">4.9 hrs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderClientProfile = () => (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>Your business details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          {isEditing ? (
            <Input id="company-name" defaultValue="ABC Construction" />
          ) : (
            <p className="text-foreground flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              ABC Construction
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact-number">Contact Number</Label>
          {isEditing ? (
            <Input id="contact-number" defaultValue="+27 82 123 4567" />
          ) : (
            <p className="text-foreground flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              +27 82 123 4567
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Business Address</Label>
          {isEditing ? (
            <Textarea 
              id="address" 
              defaultValue="123 Business Park, Cape Town, South Africa"
              className="min-h-[80px]"
            />
          ) : (
            <p className="text-foreground flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
              123 Business Park, Cape Town, South Africa
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderAdminProfile = () => (
    <Card>
      <CardHeader>
        <CardTitle>Admin Information</CardTitle>
        <CardDescription>Your administrator details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-role">Admin Role</Label>
          {isEditing ? (
            <select
              id="admin-role"
              className="w-full p-2 border rounded-md"
              defaultValue="System Administrator"
            >
              <option>System Administrator</option>
              <option>Content Manager</option>
              <option>User Manager</option>
            </select>
          ) : (
            <p className="text-foreground">System Administrator</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="permissions">Permissions</Label>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="perm-users" defaultChecked />
                <label htmlFor="perm-users">User Management</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="perm-jobs" defaultChecked />
                <label htmlFor="perm-jobs">Job Management</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="perm-settings" defaultChecked />
                <label htmlFor="perm-settings">System Settings</label>
              </div>
            </div>
          ) : (
            <ul className="list-disc list-inside">
              <li>User Management</li>
              <li>Job Management</li>
              <li>System Settings</li>
            </ul>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last-login">Last Login</Label>
          <p className="text-foreground flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            {new Date().toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto blueprint-bg min-h-[calc(100vh-3.5rem)]">
      <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center">
        <User className="h-6 w-6 mr-2 text-architect" />
        My Profile
      </h2>

      <div className="space-y-6">
        {renderBasicInfo()}

        {currentUser.role === "architect" && renderArchitectProfile()}
        {currentUser.role === "client" && renderClientProfile()}
        {currentUser.role === "admin" && renderAdminProfile()}
        
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Change Password</h3>
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-medium">Login Sessions</h3>
              <div className="bg-secondary p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-muted-foreground">
                      Cape Town, South Africa • Chrome on Windows
                    </p>
                  </div>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Change Password</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
