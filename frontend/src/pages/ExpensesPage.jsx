import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CATEGORY_COLORS } from "@/lib/constants";

export default function ExpensesPage() {
  // RESULTS from server
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  // Pagination (cursor endpoints)
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [count, setCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 800);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all"); // Default to "All Time"

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Page size (matches DRF)
  // const ITEMS_PER_PAGE = 20;

  // Categories for filter dropdown
  const categories = [
    { value: "all", label: "All Categories" },
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

  // Date range options
  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "last_7_days", label: "Last 7 days" },
    { value: "last_30_days", label: "Last 30 days" },
    { value: "last_year", label: "Last Year" }
  ];

  // Build filters into query params
  const getFilterParams = useCallback(() => {
    let params = {};
    // Search
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    // Category
    if (selectedCategory !== "all") params.category = selectedCategory;
    // Date range
    const today = new Date();
    if (selectedDateRange !== "all") {
      switch (selectedDateRange) {
        case "last_7_days": {
          const minDate = new Date(today);
          minDate.setDate(today.getDate() - 7);
          params.min_date = minDate.toISOString().substring(0, 10);
          break;
        }
        case "last_30_days": {
          const minDate = new Date(today);
          minDate.setDate(today.getDate() - 30);
          params.min_date = minDate.toISOString().substring(0, 10);
          break;
        }
        case "last_year": {
          const minDate = new Date(today);
          minDate.setFullYear(today.getFullYear() - 1);
          params.min_date = minDate.toISOString().substring(0, 10);
          break;
        }
        default:
          break;
      }
    }
    return params;
  }, [debouncedSearchTerm, selectedCategory, selectedDateRange]);

  // Fetch expenses when filter/pagination changes
  const fetchExpenses = useCallback(async (url = null, customParams = null) => {
    setLoading(true);
    setError("");
    try {
      let resp;
      if (url) {
        resp = await api.get(url);
      } else {
        const params = customParams || getFilterParams();
        resp = await api.get("/api/expenses/", { params });
      }
      setExpenses(resp.data.results || []);
      setNextUrl(resp.data.next || null);
      setPrevUrl(resp.data.previous || null);
      setCount(resp.data.count || resp.data.results?.length || 0);
    } catch (err) {
      console.error("Fetch expenses error:", err);
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [getFilterParams]);

  // Fetch when initial load or any filter changes
  useEffect(() => {
    fetchExpenses(null, getFilterParams());
    setDeleteDialogOpen(false);
    setExpenseToDelete(null);
  }, [fetchExpenses, getFilterParams]);

  // Pagination handlers
  const handleNextPage = () => {
    if (nextUrl) fetchExpenses(nextUrl);
  };
  const handlePrevPage = () => {
    if (prevUrl) fetchExpenses(prevUrl);
  };

  // Delete
  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      await api.delete(`/api/expenses/${expenseToDelete.id}/`);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (err) {
      console.error("Delete expense error:", err);
      setError("Failed to delete expense");
    }
  };

  // Format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category] || "#ffffff";
  };
  const getCategoryTextColor = (category) => {
    return category === "OTHER" ? "#000000" : "#ffffff";
  };
  const getCategoryDisplayName = (category) => {
    const names = {
      GROCERIES: "Groceries",
      UTILITIES: "Utilities", 
      ENTERTAINMENT: "Entertainment",
      TRANSPORTATION: "Transportation",
      DINING_OUT: "Dining Out",
      HEALTHCARE: "Healthcare",
      HOUSING: "Housing",
      EDUCATION: "Education",
      OTHER: "Other"
    };
    return names[category] || category;
  };
  const getPaymentMethodDisplayName = (method) => {
    const names = {
      DEBIT_CARD: "Debit Card",
      CREDIT_CARD: "Credit Card",
      CASH: "Cash",
      BANK_TRANSFER: "Bank Transfer",
      OTHER: "Other"
    };
    return names[method] || method;
  };

  if (initialLoad && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">All Expenses</h1>
        <p className="text-zinc-400 mt-1">Manage and filter your expense records</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pl-10 h-12"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-12 w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value} className="text-white hover:bg-zinc-700">
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-12 w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {dateRanges.map((range) => (
              <SelectItem key={range.value} value={range.value} className="text-white hover:bg-zinc-700">
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-700 font-medium text-zinc-300">
          <div className="col-span-3">Description</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Payment Method</div>
          <div className="col-span-1 text-right">Amount</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-zinc-700">
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <div key={expense.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-zinc-700/50 transition-colors">
                <div className="col-span-3 text-white font-medium">
                  {expense.description || "No description"}
                </div>
                <div className="col-span-2">
                  <span 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: getCategoryColor(expense.category),
                      color: getCategoryTextColor(expense.category)
                    }}
                  >
                    {getCategoryDisplayName(expense.category)}
                  </span>
                </div>
                <div className="col-span-2 text-zinc-300">
                  {formatDate(expense.date)}
                </div>
                <div className="col-span-3 text-zinc-300">
                  {getPaymentMethodDisplayName(expense.payment_method)}
                </div>
                <div className="col-span-1 text-right text-white font-medium">
                  {formatCurrency(expense.amount)}
                </div>
                <div className="col-span-1 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                      <DropdownMenuItem asChild className="text-white hover:bg-zinc-700">
                        <Link to={`/expenses/${expense.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setExpenseToDelete(expense);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-400 hover:bg-zinc-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-400">
              {debouncedSearchTerm || selectedCategory !== 'all' || selectedDateRange !== 'all' ? 
                'No expenses match your filters' : 
                'No expenses found'
              }
            </div>
          )}
        </div>
      </div>

      {/* Pagination (only show if at least one page exists) */}
      {(prevUrl || nextUrl) && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-400">
            Showing {expenses.length > 0 ? 1 : 0} to {expenses.length} of {count} expenses
          </div>
          <div className="flex items-center space-x-2">
            {prevUrl && (
              <Button
                onClick={handlePrevPage}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded-lg transition"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            {nextUrl && (
              <Button
                onClick={handleNextPage}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded-lg transition"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-800 border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Expense</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{expenseToDelete?.description}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-600 text-zinc-300 hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteExpense}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
