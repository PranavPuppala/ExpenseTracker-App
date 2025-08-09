import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

export default function ExpenseFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Helper function to get today's date in YYYY-MM-DD format (local time)
  const getTodaysDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    payment_method: "",
    description: "",
    date: getTodaysDate() // This will get today's local date
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Categories from your backend model
  const categories = [
    { value: "GROCERIES", label: "Groceries" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "ENTERTAINMENT", label: "Entertainment" },
    { value: "TRANSPORTATION", label: "Transportation" },
    { value: "DINING_OUT", label: "Dining Out" },
    { value: "HEALTHCARE", label: "Healthcare" },
    { value: "HOUSING", label: "Housing" },
    { value: "EDUCATION", label: "Education" },
    { value: "OTHER", label: "Other" }
  ];

  // Payment methods from your backend model
  const paymentMethods = [
    { value: "DEBIT_CARD", label: "Debit Card" },
    { value: "CREDIT_CARD", label: "Credit Card" },
    { value: "CASH", label: "Cash" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "OTHER", label: "Other" }
  ];

  // Load expense data if editing
  useEffect(() => {
    // Debug date calculation
    const today = new Date();
    console.log("=== DATE DEBUG ===");
    console.log("Current date object:", today);
    console.log("getFullYear():", today.getFullYear());
    console.log("getMonth() + 1:", today.getMonth() + 1);
    console.log("getDate():", today.getDate());
    console.log("getTodaysDate():", getTodaysDate());
    console.log("Expected: 2025-08-08");
    
    if (isEditing) {
      fetchExpense();
    }
  }, [id, isEditing]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/expenses/${id}/`);
      setFormData(response.data);
    } catch (err) {
      setError("Failed to load expense data");
      console.error("Fetch expense error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.amount || !formData.category || !formData.payment_method) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        payment_method: formData.payment_method,
        description: formData.description,
        date: formData.date
      };

      if (isEditing) {
        await api.put(`/api/expenses/${id}/`, payload);
      } else {
        await api.post("/api/expenses/", payload);
      }

      navigate("/expenses");
    } catch (err) {
      setError("Failed to save expense");
      console.error("Save expense error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/expenses");
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString) => {
    // Parse the date string and format it for display
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading expense...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            {isEditing ? "Edit Expense" : "New Expense"}
          </CardTitle>
          <p className="text-sm text-zinc-400">
            {isEditing ? "Update your expense details" : "Add a new expense to your tracker"}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white font-medium">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  required
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 pl-8 h-12"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white font-medium">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-12 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="text-white hover:bg-zinc-800">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment_method" className="text-white font-medium">
                Payment Method
              </Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleInputChange("payment_method", value)}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-12 w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value} className="text-white hover:bg-zinc-800">
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date (Auto-filled, non-editable) */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-white font-medium">
                Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="date"
                  type="text"
                  value={formatDate(formData.date)}
                  readOnly
                  className="bg-zinc-700 border-zinc-600 text-zinc-300 pl-10 h-12 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter expense details"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px] resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-white text-black hover:bg-zinc-200 font-medium flex-1 h-12"
              >
                {loading ? "Saving..." : isEditing ? "Update Expense" : "Save Expense"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white flex-1 h-12"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}