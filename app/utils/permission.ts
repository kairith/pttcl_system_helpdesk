export function getClientPermissions(headers: Headers): any {
  const permissionsHeader = headers.get('x-user-permissions');
  console.log('getClientPermissions: x-user-permissions header:', permissionsHeader || '[none]');
  try {
    return permissionsHeader ? JSON.parse(permissionsHeader) : null;
  } catch (error: any) {
    console.error('Error parsing permissions header:', error.message, error.stack);
    return null;
  }
}

export function canAccess(permissions: any, resource: string, action: string): boolean {
  console.log('canAccess check:', { resource, action, permissions: permissions ? '[permissions present]' : '[no permissions]' });
  if (!permissions) {
    console.error('No permissions provided for canAccess');
    return false;
  }
  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) {
    console.error('No permissions found for resource:', resource);
    return false;
  }
  const hasAccess = !!resourcePermissions[action];
  console.log('canAccess result:', hasAccess);
  return hasAccess;
}