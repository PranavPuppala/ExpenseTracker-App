import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 Number */}
        <div className="text-8xl font-bold text-zinc-700">
          404
        </div>
        
        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            Page Not Found
          </h1>
          <p className="text-zinc-400">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            asChild
            className="bg-white text-black hover:bg-zinc-200"
          >
            <Link to="/dashboard">
              <Home size={16} className="mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}