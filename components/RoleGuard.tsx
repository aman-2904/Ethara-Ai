import { ReactNode } from 'react'

interface RoleGuardProps {
  userRole: string;
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ userRole, allowedRoles, children, fallback = null }: RoleGuardProps) {
  if (allowedRoles.includes(userRole)) {
    return <>{children}</>
  }
  return <>{fallback}</>
}
