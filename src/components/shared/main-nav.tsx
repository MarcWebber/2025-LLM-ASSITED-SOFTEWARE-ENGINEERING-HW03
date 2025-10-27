import Link from "next/link";

export function MainNav() {
    return (
        <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link href="/planner" className="text-sm font-medium transition-colors hover:text-primary">
                智能规划
            </Link>
            <Link href="/trips" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                我的行程
            </Link>
            <Link href="/expenses" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                费用管理
            </Link>
            <Link href="/settings" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                设置
            </Link>
        </nav>
    );
}