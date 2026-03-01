import { useState, useCallback, useEffect, useRef } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  ShieldCheck,
  Activity,
  TrendingUp,
  LogOut,
  Search,
  ChevronDown,
  Lock,
  AlertTriangle,
} from "lucide-react";

// ─── Auth Configuration ─────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";
const TOKEN_STORAGE_KEY = "admin_access_token";
const REFRESH_STORAGE_KEY = "admin_refresh_token";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  roles: Array<{ role: string; restaurant_id?: string }>;
  authenticatedAt: Date;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
}

// ─── Auth Service ────────────────────────────────────────────

/** Parse JWT payload without verification (verification happens server-side) */
function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Check if a JWT is expired (with 30s buffer) */
function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 < Date.now() + 30_000;
}

/** Check if user has required admin/manager role */
function hasAdminRole(roles: Array<{ role: string }>): boolean {
  const allowedRoles = ["admin", "manager", "owner"];
  return roles.some((r) => allowedRoles.includes(r.role.toLowerCase()));
}

async function apiLogin(
  email: string,
  password: string
): Promise<{ user: AdminUser; tokens: AuthTokens }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Authentication failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const userData = data.data || data;

  return {
    user: {
      id: userData.user.id,
      email: userData.user.email,
      full_name: userData.user.full_name,
      roles: userData.user.roles || [],
      authenticatedAt: new Date(),
    },
    tokens: {
      access_token: userData.access_token,
      refresh_token: userData.refresh_token,
      expires_in: userData.expires_in,
      refresh_expires_in: userData.refresh_expires_in,
    },
  };
}

async function apiRefreshToken(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await response.json();
  const tokenData = data.data || data;
  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
    refresh_expires_in: tokenData.refresh_expires_in,
  };
}

async function apiLogout(accessToken: string, refreshToken?: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    // Logout is best-effort — clear local state regardless
  }
}

// ─── Token Management Hook ──────────────────────────────────
function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTokens = useCallback(() => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(REFRESH_STORAGE_KEY);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const storeTokens = useCallback((tokens: AuthTokens) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, tokens.access_token);
    sessionStorage.setItem(REFRESH_STORAGE_KEY, tokens.refresh_token);
  }, []);

  const scheduleRefresh = useCallback(
    (expiresIn: number) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      // Refresh 60 seconds before expiry
      const refreshDelay = Math.max((expiresIn - 60) * 1000, 10_000);
      refreshTimerRef.current = setTimeout(async () => {
        const refreshToken = sessionStorage.getItem(REFRESH_STORAGE_KEY);
        if (!refreshToken) {
          setUser(null);
          clearTokens();
          return;
        }
        try {
          const newTokens = await apiRefreshToken(refreshToken);
          storeTokens(newTokens);
          scheduleRefresh(newTokens.expires_in);
        } catch {
          setUser(null);
          clearTokens();
        }
      }, refreshDelay);
    },
    [clearTokens, storeTokens]
  );

  // Restore session on mount
  useEffect(() => {
    const accessToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!accessToken || isTokenExpired(accessToken)) {
      clearTokens();
      setLoading(false);
      return;
    }

    const payload = parseJwtPayload(accessToken);
    if (!payload) {
      clearTokens();
      setLoading(false);
      return;
    }

    const roles = (payload.roles as string[]) || [];
    const userFromToken: AdminUser = {
      id: payload.sub as string,
      email: payload.email as string,
      full_name: payload.full_name as string,
      roles: roles.map((r) => ({ role: r })),
      authenticatedAt: new Date((payload.iat as number) * 1000),
    };

    if (!hasAdminRole(userFromToken.roles)) {
      clearTokens();
      setLoading(false);
      return;
    }

    setUser(userFromToken);
    const exp = (payload.exp as number) - Math.floor(Date.now() / 1000);
    scheduleRefresh(exp);
    setLoading(false);
  }, [clearTokens, scheduleRefresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: authUser, tokens } = await apiLogin(email, password);

      if (!hasAdminRole(authUser.roles)) {
        throw new Error("Access denied. Admin or Manager role required.");
      }

      storeTokens(tokens);
      scheduleRefresh(tokens.expires_in);
      setUser(authUser);
    },
    [storeTokens, scheduleRefresh]
  );

  const logout = useCallback(async () => {
    const accessToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const refreshToken = sessionStorage.getItem(REFRESH_STORAGE_KEY);
    if (accessToken) {
      await apiLogout(accessToken, refreshToken || undefined);
    }
    clearTokens();
    setUser(null);
  }, [clearTokens]);

  return { user, loading, login, logout };
}

// ─── Login Component ─────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        if (!email || !password) {
          setError("Email and password are required");
          return;
        }

        await onLogin(email, password);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      } finally {
        setLoading(false);
      }
    },
    [email, password, onLogin]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>Sign in to access the administration panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@okinawa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Metrics Cards ───────────────────────────────────────────
function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-primary flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> {trend}
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Users Table (fetches from API) ──────────────────────────
function UsersTable() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<
    Array<{ id: string; name: string; email: string; role: string; status: string; lastLogin: string }>
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const accessToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!accessToken) return;

    fetch(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load users"))))
      .then((data) => {
        const list = data.data || data;
        if (Array.isArray(list)) {
          setUsers(
            list.map((u: any) => ({
              id: u.id,
              name: u.full_name || u.name || "Unknown",
              email: u.email,
              role: u.roles?.[0]?.role || "User",
              status: u.is_active ? "active" : "inactive",
              lastLogin: u.last_login_at || "—",
            }))
          );
        }
      })
      .catch(() => {
        // API not available — show empty state
      })
      .finally(() => setLoadingUsers(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Users</CardTitle>
            <CardDescription>{users.length} registered users</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loadingUsers ? (
          <div className="py-8 text-center text-muted-foreground">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{user.name}</td>
                    <td className="py-3 text-muted-foreground">{user.email}</td>
                    <td className="py-3">
                      <Badge variant={user.role === "Owner" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={user.status === "active" ? "default" : "outline"}
                        className={
                          user.status === "active"
                            ? "bg-primary/10 text-primary hover:bg-primary/10"
                            : ""
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{user.lastLogin}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      {users.length === 0
                        ? "Connect to the backend API to view users"
                        : "No users found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={login} />;
  }

  const isAdmin = user.roles.some((r) => r.role.toLowerCase() === "admin");

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Admin Dashboard"
        description="Painel administrativo — métricas, usuários e gestão da plataforma."
        noIndex
      />
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <Badge variant="outline" className="text-xs">
              {isAdmin ? "Admin" : "Manager"}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 space-y-8">
        {/* Metrics — these would come from /api/v1/analytics in production */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Metrics Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard title="Total Users" value="—" icon={Users} />
            <MetricCard title="Active Today" value="—" icon={Activity} />
            <MetricCard title="Total Orders" value="—" icon={TrendingUp} />
            <MetricCard title="Revenue" value="—" icon={TrendingUp} />
            <MetricCard title="Avg Order Value" value="—" icon={ChevronDown} />
            <MetricCard title="Conversion Rate" value="—" icon={TrendingUp} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Connect to the analytics API to populate real-time metrics.
          </p>
        </section>

        <Separator />

        {isAdmin ? (
          <section>
            <UsersTable />
          </section>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                User management is restricted to admin accounts.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
