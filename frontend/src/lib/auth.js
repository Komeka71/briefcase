/**
 * Authentication and Role Authorization Helpers
 * Reads briefcase_user and briefcase_token from localStorage
 */

export function getToken() {
  return localStorage.getItem('briefcase_token') || null;
}

export function getUser() {
  try {
    const raw = localStorage.getItem('briefcase_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getRole() {
  const user = getUser();
  return user?.role || null;
}

/**
 * Checks whether the current user's role can perform an action
 * Admin can perform all actions.
 * @param {string} action
 * @returns {boolean}
 */
export function can(action) {
  const role = getRole();
  if (!role) return false;
  if (role === 'Admin') return true;

  const rolePermissions = {
    Lawyer: [
      'view_dashboard',
      'view_clients',
      'view_cases',
      'edit_case',
      'view_lawyers',
      'view_hearings',
      'edit_hearing',
      'view_documents',
      'create_document',
      'view_tasks',
      'create_task',
      'edit_task_status'
    ],
    Assistant: [
      'view_dashboard',
      'view_clients',
      'view_cases',
      'view_lawyers',
      'view_hearings',
      'view_documents',
      'create_document',
      'view_tasks',
      'create_task',
      'edit_task_status'
    ],
    Staff: [
      'view_dashboard',
      'view_clients',
      'view_cases',
      'view_lawyers',
      'view_hearings',
      'view_documents',
      'create_document',
      'view_tasks',
      'create_task',
      'edit_task_status'
    ]
  };

  const allowed = rolePermissions[role] || [];
  return allowed.includes(action);
}

export function clearAuth() {
  localStorage.removeItem('briefcase_token');
  localStorage.removeItem('briefcase_user');
}
