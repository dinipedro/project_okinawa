/**
 * Re-export from Identity module (canonical source)
 * Auth module consumers should use this for backward compatibility.
 * The canonical entity lives in @/modules/identity/entities/audit-log.entity
 */
export { AuditLog, AuditAction } from '@/modules/identity/entities/audit-log.entity';
