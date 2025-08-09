import { useState, useEffect } from "react";
import { User, Shield, Trash2, Save, X, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: ""
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Edit mode states for each section
  const [editMode, setEditMode] = useState({
    firstName: false,
    lastName: false,
    password: false
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  // Delete account dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || ""
      });
    }
  }, [user]);

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await api.put("/api/profile/", {
        first_name: profileData.first_name,
        last_name: profileData.last_name
      });

      setUser(response.data);
      setProfileSuccess("Profile updated successfully!");
      
      // Reset edit modes
      setEditMode(prev => ({ ...prev, firstName: false, lastName: false }));
      
      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      setProfileError("Failed to update profile");
      console.error("Profile update error:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    // Client-side validation
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New passwords do not match");
      setPasswordLoading(false);
      return;
    }

    try {
      await api.put("/api/change-password/", {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });

      setPasswordSuccess("Password updated successfully!");
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: ""
      });
      
      // Reset edit mode
      setEditMode(prev => ({ ...prev, password: false }));
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      if (err.response?.data?.old_password) {
        setPasswordError("Current password is incorrect");
      } else if (err.response?.data?.new_password) {
        setPasswordError("New password does not meet requirements");
      } else {
        setPasswordError("Failed to update password");
      }
      console.error("Password change error:", err);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      await api.delete("/api/profile/");
      logout(); // This will redirect to login
    } catch (err) {
      console.error("Delete account error:", err);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section === 'profile') {
      setProfileData(prev => ({ ...prev, [field]: value }));
    } else if (section === 'password') {
      setPasswordData(prev => ({ ...prev, [field]: value }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCancel = (field) => {
    if (field === 'firstName') {
      setProfileData(prev => ({ ...prev, first_name: user?.first_name || "" }));
      setEditMode(prev => ({ ...prev, firstName: false }));
    } else if (field === 'lastName') {
      setProfileData(prev => ({ ...prev, last_name: user?.last_name || "" }));
      setEditMode(prev => ({ ...prev, lastName: false }));
    } else if (field === 'password') {
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
      setEditMode(prev => ({ ...prev, password: false }));
    }
    setProfileError("");
    setPasswordError("");
  };

  return (
    <div className="space-y-8 w-full">
      {/* Welcome Header */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <User className="h-6 w-6 text-blue-400" />
          <div>
            <h1 className="text-xl font-semibold text-white">
              Welcome, {user?.first_name || 'User'}!
            </h1>
            <p className="text-zinc-400 mt-1">
              Manage your account settings and preferences below. You can update your personal information and security settings.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Personal Information</h2>
        </div>

        {/* First Name */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">First Name</CardTitle>
            <p className="text-sm text-zinc-400">Update your first name as it appears on your account</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="first_name" className="text-white font-medium">First Name</Label>
                <Input
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) => handleInputChange('profile', 'first_name', e.target.value)}
                  disabled={!editMode.firstName}
                  className={`${editMode.firstName ? 'bg-zinc-900' : 'bg-zinc-700'} border-zinc-700 text-white placeholder:text-zinc-500 mt-2`}
                />
              </div>
              
              {profileError && editMode.firstName && <p className="text-red-400 text-sm">{profileError}</p>}
              {profileSuccess && <p className="text-green-400 text-sm">{profileSuccess}</p>}
              
              <div className="flex gap-3">
                {!editMode.firstName ? (
                  <Button
                    type="button"
                    onClick={() => setEditMode(prev => ({ ...prev, firstName: true }))}
                    className="bg-white text-black hover:bg-zinc-200"
                  >
                    Update
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleProfileSubmit}
                      disabled={profileLoading}
                      className="bg-white text-black hover:bg-zinc-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {profileLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleCancel('firstName')}
                      className="text-zinc-300 hover:text-white hover:bg-zinc-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Name */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Last Name</CardTitle>
            <p className="text-sm text-zinc-400">Update your last name as it appears on your account</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="last_name" className="text-white font-medium">Last Name</Label>
                <Input
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) => handleInputChange('profile', 'last_name', e.target.value)}
                  disabled={!editMode.lastName}
                  className={`${editMode.lastName ? 'bg-zinc-900' : 'bg-zinc-700'} border-zinc-700 text-white placeholder:text-zinc-500 mt-2`}
                />
              </div>
              
              {profileError && editMode.lastName && <p className="text-red-400 text-sm">{profileError}</p>}
              {profileSuccess && <p className="text-green-400 text-sm">{profileSuccess}</p>}
              
              <div className="flex gap-3">
                {!editMode.lastName ? (
                  <Button
                    type="button"
                    onClick={() => setEditMode(prev => ({ ...prev, lastName: true }))}
                    className="bg-white text-black hover:bg-zinc-200"
                  >
                    Update
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleProfileSubmit}
                      disabled={profileLoading}
                      className="bg-white text-black hover:bg-zinc-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {profileLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleCancel('lastName')}
                      className="text-zinc-300 hover:text-white hover:bg-zinc-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Address */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Email Address</CardTitle>
            <p className="text-sm text-zinc-400">Your email address is used for login and notifications</p>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="email" className="text-white font-medium">Current Email Address</Label>
              <Input
                id="email"
                value={profileData.email}
                readOnly
                className="bg-zinc-700 border-zinc-600 text-zinc-300 mt-2 cursor-not-allowed"
              />
              <p className="text-xs text-zinc-500 mt-2">This field cannot be changed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Security Settings</h2>
        </div>

        {/* Password Change */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Password</CardTitle>
            <p className="text-sm text-zinc-400">Update your password to keep your account secure</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {editMode.password && (
                <>
                  {/* Current Password */}
                  <div>
                    <Label htmlFor="old_password" className="text-white font-medium">Current Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="old_password"
                        type={showPasswords.old ? "text" : "password"}
                        placeholder="Enter current password"
                        value={passwordData.old_password}
                        onChange={(e) => handleInputChange('password', 'old_password', e.target.value)}
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => togglePasswordVisibility('old')}
                        className="absolute inset-y-0 right-0 h-full w-10 hover:bg-transparent"
                      >
                        {showPasswords.old ? (
                          <EyeOff className="h-4 w-4 text-zinc-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-zinc-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <Label htmlFor="new_password" className="text-white font-medium">New Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="new_password"
                        type={showPasswords.new ? "text" : "password"}
                        placeholder="Enter new password"
                        value={passwordData.new_password}
                        onChange={(e) => handleInputChange('password', 'new_password', e.target.value)}
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 h-full w-10 hover:bg-transparent"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-zinc-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-zinc-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <Label htmlFor="confirm_password" className="text-white font-medium">Confirm New Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="confirm_password"
                        type={showPasswords.confirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={passwordData.confirm_password}
                        onChange={(e) => handleInputChange('password', 'confirm_password', e.target.value)}
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 h-full w-10 hover:bg-transparent"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-zinc-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-zinc-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
              {passwordSuccess && <p className="text-green-400 text-sm">{passwordSuccess}</p>}

              <div className="flex gap-3">
                {!editMode.password ? (
                  <Button
                    type="button"
                    onClick={() => setEditMode(prev => ({ ...prev, password: true }))}
                    className="bg-white text-black hover:bg-zinc-200"
                  >
                    Update
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handlePasswordSubmit}
                      disabled={passwordLoading}
                      className="bg-white text-black hover:bg-zinc-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {passwordLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleCancel('password')}
                      className="text-zinc-300 hover:text-white hover:bg-zinc-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Trash2 className="h-5 w-5 text-red-400" />
          <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
        </div>

        <Card className="bg-zinc-800 border-red-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Account</h3>
                <p className="text-zinc-400 text-sm">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              
              <Button
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-800 border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete your account? This will permanently delete all your data including:
              <br />• All your expense records
              <br />• Your profile information
              <br />• All account settings
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-600 text-zinc-300 hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}