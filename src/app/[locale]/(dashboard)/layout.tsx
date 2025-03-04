import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { LoadingProvider } from "@/components/providers/loading-provider"
import { AuthProvider } from "@/components/providers/auth-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <LoadingProvider>
          <div className="h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
            <Sidebar />
          </div>
          <main className="md:pl-72">
            <Navbar />
            <div className="p-8">
              {children}
            </div>
          </main>
        </LoadingProvider>
      </AuthProvider>
    </div>
  )
} 