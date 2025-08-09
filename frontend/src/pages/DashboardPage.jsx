import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  DollarSign, 
  Calendar, 
  Clock,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { CATEGORY_COLORS } from "@/lib/constants";
import { useAuth } from "@/lib/useAuth";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    } else if (!authLoading && !user) {
      setError("Please log in to view dashboard");
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch all dashboard data in parallel
      const [dashboardRes, recentRes, chartRes] = await Promise.all([
        api.get("/api/expenses/dashboard"),
        api.get("/api/expenses/recent"),
        api.get("/api/expenses/series/daily?days=30")
      ]);

      setDashboardData(dashboardRes.data);
      setRecentExpenses(recentRes.data);
      setChartData(chartRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response?.status === 404) {
        setError("Dashboard endpoints not found. Check backend configuration.");
      } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError("Cannot connect to server. Is the backend running?");
      } else {
        setError(`Failed to load dashboard data: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatTrendPercentage = (percentage) => {
    if (percentage === 0) return "0%";
    const sign = percentage > 0 ? "+" : "";
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getRelativeTime = (dateString) => {
    // Parse the date string properly to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const expenseDate = new Date(year, month - 1, day); // month is 0-indexed
    
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const yesterday = new Date(todayDateOnly);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (expenseDate.getTime() === todayDateOnly.getTime()) {
      return "Today";
    } else if (expenseDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      const diffTime = Math.abs(todayDateOnly - expenseDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days ago`;
    }
  };

  const getCategoryInitial = (category) => {
    return category ? category.charAt(0).toUpperCase() : "?";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-400 text-center">{error}</div>
        {error.includes("login") && (
          <Link 
            to="/login"
            className="px-4 py-2 bg-white text-black rounded hover:bg-zinc-200 transition-colors"
          >
            Go to Login
          </Link>
        )}
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Expenses Card */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(dashboardData?.current_month_total)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-zinc-400">
              {dashboardData?.trend_percentage > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : dashboardData?.trend_percentage < 0 ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <span className={
                dashboardData?.trend_percentage > 0 ? "text-green-500" :
                dashboardData?.trend_percentage < 0 ? "text-red-500" : 
                "text-zinc-400"
              }>
                {formatTrendPercentage(dashboardData?.trend_percentage)} from last month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Average Card */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Monthly Average
            </CardTitle>
            <Calendar className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(dashboardData?.monthly_average)}
            </div>
            <p className="text-xs text-zinc-400">
              {dashboardData?.active_categories_count || 0} active categories
            </p>
          </CardContent>
        </Card>

        {/* Top Category Card */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Top Category
            </CardTitle>
            <Clock className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dashboardData?.top_category ? 
                getCategoryDisplayName(dashboardData.top_category) : 
                "None"
              }
            </div>
            <p className="text-xs text-zinc-400">
              {dashboardData?.top_category_percentage || 0}% of total expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Chart and Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Overview Chart */}
        <Card className="lg:col-span-2 bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Expense Overview</CardTitle>
            <p className="text-sm text-zinc-400">Your expense trends for the past 30 days</p>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a1a1aa', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#2563eb" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-zinc-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Recent Expenses</CardTitle>
            <p className="text-sm text-zinc-400">
              You've spent {formatCurrency(dashboardData?.current_week_total)} this week
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentExpenses.length > 0 ? (
              <>
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center space-x-3">
                    {/* Category Avatar */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{ 
                        backgroundColor: getCategoryColor(expense.category),
                        color: getCategoryTextColor(expense.category)
                      }}
                    >
                      {getCategoryInitial(expense.category)}
                    </div>
                    
                    {/* Expense Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {expense.description || "No description"}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: getCategoryColor(expense.category),
                            color: getCategoryTextColor(expense.category)
                          }}
                        >
                          {getCategoryDisplayName(expense.category)}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {getRelativeTime(expense.date)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <div className="text-sm font-medium text-white">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                ))}
                
                {/* View All Link */}
                <Link 
                  to="/expenses"
                  className="flex items-center justify-center space-x-1 text-sm text-zinc-400 hover:text-white transition-colors pt-2"
                >
                  <span>View All Expenses</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </>
            ) : (
              <div className="text-center text-zinc-400 py-8">
                No expenses
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}