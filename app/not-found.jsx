import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function NotFound  (){
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
      <h1 className="text-6xl font-bold gradient-title mb-4"></h1>
      <h2 className="text-6xl font-bold gradient-title mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">Oops! The page you&app;re looking for doesn&app;t exist or has been moved.</p>
      <Link href={"/"}>
      <Button>Return Home</Button>
      </Link>
    </div>
  );
};

