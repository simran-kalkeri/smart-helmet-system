"use client";

import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-wrapper">
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

