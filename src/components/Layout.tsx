import React, { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Vett & Venture</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
