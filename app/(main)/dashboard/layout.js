import React, { Suspense } from "react";
import * as spin from "react-spinners"

const Layout = ({ children }) => {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">Industry Insights</h1>
      </div>
      <Suspense fallback={<spin.HashLoader color="#5659b8" className="mt-4" width={"100%"}  />}>{children}</Suspense>
    </div>
  );
};

export default Layout;
