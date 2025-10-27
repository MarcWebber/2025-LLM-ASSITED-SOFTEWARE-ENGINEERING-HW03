import { MainNav } from "@/components/shared/main-nav";

export default function MainLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 border-b bg-background">
                <div className="container flex items-center justify-between h-16 py-4">
                    <MainNav />
                    {/* <UserNav /> 将在实现用户认证后添加 */}
                </div>
            </header>
            <main className="flex-1">{children}</main>
        </div>
    );
}