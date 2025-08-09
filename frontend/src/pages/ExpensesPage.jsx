import { useState, useEffect } from "react";
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
  const [allExpenses, setAllExpenses] = useState([]); // Store all expenses
  const [filteredExpenses, setFilteredExpenses] = useState([]); // Store filtered results
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("last_7_days");


  // Pagination for filtered results
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;


  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);


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
    { value: "last_7_days", label: "Last 7 days" },
    { value: "last_30_days", label: "Last 30 days" },
    { value: "last_year", label: "Last Year" }
  ];


  // Load initial data only once
  useEffect(() => {
    fetchAllExpenses();
  }, []);


  // Apply filters whenever search term, category, or date range changes
  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [debouncedSearchTerm, selectedCategory, selectedDateRange, allExpenses]);


  const fetchAllExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      let allExpenses = [];
      let nextUrl = '/api/expenses/';
      
      // Keep fetching until no more pages
      while (nextUrl) {
        const response = await api.get(nextUrl);
        const data = response.data;
        
        // Add current page results
        allExpenses = [...allExpenses, ...(data.results || [])];
        
        // Get next page URL (cursor pagination)
        // Remove the base URL if it's included in the next URL
        nextUrl = data.next;
        if (nextUrl && nextUrl.includes(api.defaults.baseURL)) {
          nextUrl = nextUrl.replace(api.defaults.baseURL, '');
        }
      }
      
      setAllExpenses(allExpenses);
    } catch (err) {
      console.error("Fetch expenses error:", err);
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };


  const applyFilters = () => {
    let filtered = [...allExpenses];


    // Apply search filter (description only)
    if (debouncedSearchTerm) {
      filtered = filtered.filter(expense =>
        expense.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }


    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }


    // Apply date range filter
    const today = new Date();
    let minDate;
    
    switch (selectedDateRange) {
      case 'last_7_days':
        minDate = new Date(today);
        minDate.setDate(today.getDate() - 7);
        break;
      case 'last_30_days':
        minDate = new Date(today);
        minDate.setDate(today.getDate() - 30);
        break;
      case 'last_year':
        minDate = new Date(today);
        minDate.setFullYear(today.getFullYear() - 1);
        break;
    }
    
    if (minDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= minDate;
      });
    }


    setFilteredExpenses(filtered);
  };


  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;


    try {
      await api.delete(`/api/expenses/${expenseToDelete.id}/`);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
      
      // Remove from local state instead of refetching
      setAllExpenses(prev => prev.filter(exp => exp.id !== expenseToDelete.id));
    } catch (err) {
      console.error("Delete expense error:", err);
      setError("Failed to delete expense");
    }
  };


  // Calculate pagination for filtered results
  const totalFilteredItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageExpenses = filteredExpenses.slice(startIndex, endIndex);


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
    // Use black text for light backgrounds (OTHER category)
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


  if (loading) {
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
          {currentPageExpenses.length > 0 ? (
            currentPageExpenses.map((expense) => (
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
              {debouncedSearchTerm || selectedCategory !== 'all' ? 
                'No expenses match your filters' : 
                'No expenses found'
              }
            </div>
          )}
        </div>
      </div>


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            Showing {startIndex + 1} to {Math.min(endIndex, totalFilteredItems)} of {totalFilteredItems} expenses
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-zinc-400 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
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
