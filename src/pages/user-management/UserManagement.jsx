import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import { usersAPI, sessionAPI, organizationUnitAPI } from '../../services/api';
import { formatLocalizedValue, getLocalizedDisplayName, getNameParts, getPreferredLanguage } from '../../services/displayValue';
import { ORG_UNIT_SOURCES, groupByOrganizationUnit, getOrganizationUnitLabel } from '../../services/organizationUnits';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const toArray = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
};

const formatApiValue = (value) => formatLocalizedValue(value, getPreferredLanguage());

const getFirstValue = (source, keys = []) => {
  if (!source) {
    return null;
  }

  for (const key of keys) {
    const value = formatApiValue(source?.[key]);
    if (value) {
      return value;
    }
  }

  return null;
};

const getDisplayName = (source) => {
  const directName = getLocalizedDisplayName(source);
  if (directName) {
    return directName;
  }

  const nameParts = getNameParts(source, getPreferredLanguage());
  const firstName = getFirstValue(source, ['firstName', 'firstname', 'givenName']) || nameParts.firstName;
  const lastName = getFirstValue(source, ['lastName', 'lastname', 'surname', 'familyName']) || nameParts.lastName;
  const combined = [firstName, lastName].filter(Boolean).join(' ').trim();
  return combined || null;
};

const getSessionRoot = (response) => response?.data?.result || response?.data || {};

const findFirstObjectWithKeys = (value, keys = []) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const stack = [value];

  while (stack.length > 0) {
    const current = stack.shift();
    if (!current || typeof current !== 'object') {
      continue;
    }

    if (keys.some((key) => current[key] !== undefined && current[key] !== null)) {
      return current;
    }

    Object.values(current).forEach((child) => {
      if (child && typeof child === 'object') {
        stack.push(child);
      }
    });
  }

  return null;
};

const getSessionUserCandidate = (root) => {
  const candidates = [
    root,
    root?.user,
    root?.currentUser,
    root?.current_user,
    root?.loginUser,
    root?.loginInfo?.user,
    root?.loginInfo?.currentUser,
    root?.result?.user,
    root?.result?.currentUser,
    root?.result?.loginInfo?.user,
    root?.result?.loginInfo?.currentUser,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const normalized = findFirstObjectWithKeys(candidate, ['userName', 'username', 'emailAddress', 'email', 'fullName', 'name', 'displayName']);
    if (normalized) {
      return normalized;
    }
  }

  return candidates[0] || null;
};

const normalizeSessionInfo = (response) => {
  const root = getSessionRoot(response);
  const rawUser = getSessionUserCandidate(root) || {};
  const userName = getFirstValue(rawUser, ['userName', 'username', 'loginName']) || getDisplayName(rawUser) || '';
  const fullName = getDisplayName(rawUser) || getFirstValue(rawUser, ['fullName', 'name']) || userName || '';
  const user = {
    ...rawUser,
    userName,
    username: rawUser?.username || userName,
    fullName,
    name: rawUser?.name || fullName,
    emailAddress: rawUser?.emailAddress || rawUser?.email || '',
    email: rawUser?.email || rawUser?.emailAddress || '',
  };
  const tenant = root?.tenant || root?.currentTenant || root?.tenantInfo || {};
  const normalizedTenant = {
    ...tenant,
    name: tenant?.name || tenant?.tenantName || tenant?.displayName || 'Host',
  };

  const permissions =
    toArray(user?.grantedPermissions)
      .concat(toArray(user?.permissions))
      .concat(toArray(root?.grantedPermissions))
      .concat(toArray(root?.permissions))
      .concat(toArray(user?.roleNames))
      .concat(toArray(user?.roles))
      .concat(toArray(root?.roleNames))
      .concat(toArray(root?.roles))
      .filter(Boolean)
      .map((value) => {
        if (typeof value === 'string') {
          return value;
        }
        return formatApiValue(value?.name || value?.displayName || value?.roleName || value?.value || value?.code || value);
      })
      .filter(Boolean);

  const normalizedPermissions = permissions.length > 0
    ? permissions
    : toArray(root?.roleNames)
        .concat(toArray(root?.roles))
        .map((value) => formatApiValue(value))
        .filter(Boolean);

  return {
    ...root,
    user,
    currentUser: user,
    tenant: normalizedTenant,
    currentTenant: normalizedTenant,
    permissions: Array.from(new Set(normalizedPermissions)),
  };
};

const normalizeOrgUnitUser = (user, source) => {
  const identity = user?.user || user?.currentUser || user?.member || user?.person || user || {};
  const organizationUnitId = user?.organizationUnitId ?? user?.organizationUnit?.id ?? source.id;
  const organizationUnitName =
    formatApiValue(user?.organizationUnitName) ||
    formatApiValue(user?.organizationUnit?.displayName) ||
    formatApiValue(source.label);
  const roleValue =
    getFirstValue(identity, ['role', 'roleName', 'userRole', 'userType']) ||
    getFirstValue(user, ['role', 'roleName', 'userRole', 'userType']) ||
    'EndUser';

  return {
    ...user,
    ...identity,
    id:
      identity?.id ??
      user?.id ??
      user?.Id ??
      identity?.userId ??
      user?.userId ??
      `${organizationUnitId}-${identity?.userName || identity?.username || identity?.email || identity?.emailAddress || identity?.name || source.label}`,
    username: getFirstValue(identity, ['userName', 'username', 'loginName', 'name']) || getDisplayName(identity) || 'Unknown',
    email: getFirstValue(identity, ['emailAddress', 'email']) || '',
    ...getNameParts(identity, getPreferredLanguage()),
    fullName: getDisplayName(identity) || getDisplayName(user) || '',
    role: roleValue,
    department: organizationUnitName,
    jobTitle: getFirstValue(identity, ['jobTitle', 'title', 'position']) || getFirstValue(user, ['jobTitle', 'title', 'position']) || organizationUnitName,
    phoneNumber: getFirstValue(identity, ['phoneNumber', 'mobile', 'mobileNumber']) || getFirstValue(user, ['phoneNumber', 'mobile', 'mobileNumber']) || '',
    isActive:
      typeof identity?.isActive === 'boolean'
        ? identity.isActive
        : typeof user?.isActive === 'boolean'
          ? user.isActive
          : true,
    lastLoginAt:
      getFirstValue(identity, ['lastLoginAt', 'lastLoginDateTime', 'lastLogin']) ||
      getFirstValue(user, ['lastLoginAt', 'lastLoginDateTime', 'lastLogin']) ||
      null,
    organizationUnitId,
    organizationUnitName,
    organizationUnitIds: user?.organizationUnitIds || [organizationUnitId],
    organizationUnitNames: user?.organizationUnitNames || [organizationUnitName],
    sourceUser: user,
  };
};

const extractItems = (response) => {
  const items =
    response?.data?.result?.items ||
    response?.data?.result ||
    response?.data?.items ||
    response?.data ||
    [];
  return Array.isArray(items) ? items : [];
};

const loadOrganizationUnitUsers = async () => {
  const responses = await Promise.all(
    ORG_UNIT_SOURCES.map((source) => organizationUnitAPI.getUsers(source.id, 100, 0))
  );

  const merged = [];
  const seen = new Map();

  responses.forEach((response, index) => {
    const source = ORG_UNIT_SOURCES[index];
    extractItems(response).forEach((user) => {
      const identity = user?.user || user?.currentUser || user?.member || user?.person || user || {};
      const key =
        identity?.id ??
        user?.id ??
        identity?.userId ??
        user?.userId ??
        `${source.id}-${identity?.userName ?? identity?.username ?? identity?.name ?? identity?.emailAddress ?? merged.length}`;
      const existing = seen.get(key);
      const normalized = normalizeOrgUnitUser(user, source);

      if (existing) {
        existing.organizationUnitIds = Array.from(
          new Set([...(existing.organizationUnitIds || []), source.id])
        );
        existing.organizationUnitNames = Array.from(
          new Set([...(existing.organizationUnitNames || []), source.label])
        );
        return;
      }

      seen.set(key, normalized);
      merged.push(normalized);
    });
  });

  return merged;
};

const defaultForm = {
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  role: 'EndUser',
  department: '',
  jobTitle: '',
  phoneNumber: '',
  isActive: true,
  password: '',
};

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'EndUser', label: 'End User' },
  { value: 'Technician', label: 'Technician' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Administrator', label: 'Administrator' },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const roleOptions = [
    { value: 'all', label: t('allRoles', 'All Roles') },
    { value: 'EndUser', label: t('endUser', 'End User') },
    { value: 'Technician', label: t('technician', 'Technician') },
    { value: 'Manager', label: t('manager', 'Manager') },
    { value: 'Administrator', label: t('administrator', 'Administrator') },
  ];

  useEffect(() => {
    fetchUsers();
    fetchSessionInfo();
  }, []);

  const fetchSessionInfo = async () => {
    try {
      setSessionLoading(true);
      setSessionError('');
      const res = await sessionAPI.getCurrentLoginInformations();
      setSessionInfo(normalizeSessionInfo(res));
    } catch (err) {
      setSessionError(t('couldNotLoadSession', 'Could not load your live session permissions.'));
      console.error('Failed to fetch session info:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      // Try the ERP org-unit source first; fall back to the local /users API
      let list = [];
      try {
        const erpUsers = await loadOrganizationUnitUsers();
        list = Array.isArray(erpUsers) ? erpUsers : [];
      } catch (erpErr) {
        console.warn('ERP org-unit fetch failed, falling back to local users API:', erpErr);
      }

      if (list.length === 0) {
        const localRes = await usersAPI.getAll();
        const raw = localRes?.data?.result?.items ?? localRes?.data?.items ?? localRes?.data ?? [];
        list = Array.isArray(raw) ? raw : [];
      }

      setUsers(list);
    } catch (err) {
      setError(t('failedToLoadUsers', 'Failed to load users. Make sure the backend is running and your account has permission.'));
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (users || []).filter((user) => {
      const roleMatches = roleFilter === 'all' || user?.role === roleFilter;
      const searchable = [
        user?.username,
        user?.email,
        user?.firstName,
        user?.lastName,
        user?.department,
        user?.jobTitle,
      ].join(' ').toLowerCase();

      return roleMatches && (!query || searchable.includes(query));
    });
  }, [users, searchQuery, roleFilter]);
  const groupedUsers = useMemo(
    () =>
      groupByOrganizationUnit(
        filteredUsers,
        (user) => user?.organizationUnitId || user?.organizationUnitIds?.[0] || null,
        (user) => getOrganizationUnitLabel(user?.organizationUnitId || user?.organizationUnitIds?.[0], user?.organizationUnitName || user?.department)
      ),
    [filteredUsers]
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/50';
      case 'Manager':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/50';
      case 'Technician':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/50';
    }
  };

  const getSessionUser = () =>
    sessionInfo?.user ||
    sessionInfo?.currentUser ||
    sessionInfo?.result?.user ||
    sessionInfo?.result?.currentUser ||
    sessionInfo?.result?.loginInfo?.user ||
    sessionInfo?.result?.loginInfo?.currentUser ||
    null;

  const getPermissionList = () => {
    const user = getSessionUser() || {};
    const source =
      user?.grantedPermissions ||
      user?.permissions ||
      sessionInfo?.grantedPermissions ||
      sessionInfo?.permissions ||
      sessionInfo?.roleNames ||
      sessionInfo?.roles ||
      user?.roles ||
      [];

    if (Array.isArray(source)) {
      return source.map((item) => formatApiValue(item)).filter(Boolean);
    }

    if (source && typeof source === 'object') {
      return Object.entries(source)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key);
    }

    return [];
  };

  const sessionPermissions = getPermissionList();
  const sessionUser = getSessionUser();

  const openEditor = (user = null) => {
    setSelectedUser(user);
    setForm(user ? {
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'EndUser',
      department: user.department || '',
      jobTitle: user.jobTitle || '',
      phoneNumber: user.phoneNumber || '',
      isActive: user.isActive ?? true,
      password: '',
    } : defaultForm);
    setFormError('');
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedUser(null);
    setForm(defaultForm);
  };

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveUser = async () => {
    const nextError = !selectedUser
      ? (!form.username.trim() ? t('usernameRequired', 'Username is required.') :
        !form.email.trim() ? t('emailRequired', 'Email is required.') :
        !form.firstName.trim() ? t('firstNameRequired', 'First name is required.') :
        !form.lastName.trim() ? t('lastNameRequired', 'Last name is required.') :
        !form.password.trim() ? t('passwordRequired', 'Password is required.') : '')
      : (!form.email.trim() ? t('emailRequired', 'Email is required.') : '');

    if (nextError) {
      setFormError(nextError);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setFormError('');

      if (selectedUser) {
        const payload = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          department: form.department,
          jobTitle: form.jobTitle,
          phoneNumber: form.phoneNumber,
          role: form.role,
          isActive: form.isActive,
        };
        await usersAPI.update(selectedUser.id, payload);
      } else {
        const payload = {
          username: form.username,
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          department: form.department,
          jobTitle: form.jobTitle,
          password: form.password,
        };
        await usersAPI.create(payload);
      }

      closeEditor();
      await fetchUsers();
    } catch (err) {
      setError(err?.response?.data || t('failedToSaveUser', 'Failed to save user changes.'));
      console.error('Failed to save user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (user) => {
    try {
      setSubmitting(true);
      await usersAPI.update(user.id, { isActive: !user.isActive });
      await fetchUsers();
    } catch (err) {
      setError(t('failedToUpdateUserStatus', 'Failed to update user status.'));
      console.error('Failed to update user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('userManagement', 'User Management')}</h1>
            <p className="text-muted-foreground mt-2">{t('userManagementDescription', 'Manage system users, roles, and account status.')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="search"
              placeholder={t('searchUsers', 'Search users...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="sm:w-72"
            />
            <Select
              options={roleOptions}
              value={roleFilter}
              onChange={setRoleFilter}
              className="sm:w-48"
            />
            <Button onClick={() => openEditor()} iconName="Plus" iconPosition="left">
              {t('addUser', 'Add User')}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchUsers}>
              {t('retry', 'Retry')}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">{t('totalUsers', 'Total Users')}</div>
            <div className="text-2xl font-bold mt-1">{users.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">{t('activeUsers', 'Active Users')}</div>
            <div className="text-2xl font-bold mt-1">{users.filter((user) => user.isActive).length}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">{t('filteredResults', 'Filtered Results')}</div>
            <div className="text-2xl font-bold mt-1">{filteredUsers.length}</div>
          </div>
        </div>

        <section className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-elevation-1">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Icon name="ShieldCheck" size={14} />
                {t('liveSessionAccess', 'Live session access')}
              </div>
              <h2 className="text-lg font-semibold text-foreground">{t('yourPermissions', 'Your Permissions')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('permissionsDescription', 'This is loaded from the current login session so you can see the active user context.')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-[340px]">
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="text-xs text-muted-foreground">{t('user', 'User')}</div>
                <div className="mt-1 text-sm font-semibold text-foreground">
      {sessionLoading
        ? t('loading', 'Loading...')
        : (formatApiValue(sessionUser?.fullName) ||
          formatApiValue(sessionUser?.name) ||
          formatApiValue(sessionUser?.displayName) ||
          formatApiValue(sessionUser?.userName) ||
          formatApiValue(sessionUser?.emailAddress) ||
          formatApiValue(sessionUser?.email) ||
          t('unknownUser', 'Unknown user'))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="text-xs text-muted-foreground">{t('roles', 'Roles')}</div>
                <div className="mt-1 text-sm font-semibold text-foreground">
                  {sessionLoading ? t('loading', 'Loading...') : (sessionPermissions.length || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{t('permissions', 'Permissions')}</div>
              {sessionLoading ? (
                <p className="mt-2 text-sm text-muted-foreground">{t('loadingPermissions', 'Loading permissions...')}</p>
              ) : sessionError ? (
                <p className="mt-2 text-sm text-warning">{sessionError}</p>
              ) : sessionPermissions.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {sessionPermissions.map((permission) => (
                    <span key={permission} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">
                      {permission}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('noExplicitPermissions', 'No explicit permissions were returned by the session endpoint. The backend may be exposing roles only.')}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{t('sessionDetails', 'Session details')}</div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t('email', 'Email')}</span>
                  <span className="font-medium text-foreground text-right break-words">{formatApiValue(sessionUser?.emailAddress) || formatApiValue(sessionUser?.email) || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t('username', 'Username')}</span>
                  <span className="font-medium text-foreground text-right break-words">{formatApiValue(sessionUser?.userName) || formatApiValue(sessionUser?.username) || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t('tenant', 'Tenant')}</span>
                  <span className="font-medium text-foreground text-right break-words">{formatApiValue(sessionInfo?.tenant?.name) || formatApiValue(sessionInfo?.tenantName) || 'Host'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('user', 'User')}</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('role', 'Role')}</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('department', 'Department')}</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('status', 'Status')}</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('lastLogin', 'Last Login')}</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">{t('actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                      {t('loadingUsers', 'Loading users...')}
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                      {t('noUsersFound', 'No users found for the current filters.')}
                    </td>
                  </tr>
                ) : (
                  groupedUsers.map((group) => (
                    <React.Fragment key={group.key}>
                      <tr className="bg-muted/40">
                        <td colSpan="6" className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {group.label}
                          <span className="ml-2 text-primary">({group.items.length})</span>
                        </td>
                      </tr>
                      {group.items.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                {(formatApiValue(user.firstName) || formatApiValue(user.username) || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{formatApiValue(user.fullName) || `${formatApiValue(user.firstName) || ''} ${formatApiValue(user.lastName) || ''}`.trim() || formatApiValue(user.username) || t('unknownUser', 'Unknown user')}</div>
                                <div className="text-xs text-muted-foreground">{formatApiValue(user.username) || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                              {formatApiValue(user.role) || t('endUser', 'EndUser')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground">{formatApiValue(user.department) || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{formatApiValue(user.jobTitle) || t('noTitle', 'No title')}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                              {user.isActive ? t('active', 'Active') : t('inactive', 'Inactive')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : t('never', 'Never')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditor(user)}>
                                {t('edit', 'Edit')}
                              </Button>
                              <Button
                                variant={user.isActive ? 'ghost' : 'default'}
                                size="sm"
                                onClick={() => toggleActive(user)}
                                disabled={submitting}
                              >
                                {user.isActive ? t('deactivate', 'Deactivate') : t('activate', 'Activate')}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedUser ? t('editUser', 'Edit User') : t('addUser', 'Add User')}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedUser ? t('updateRoleContactDetails', 'Update role, contact details, or account status.') : t('createNewUserAccount', 'Create a new user account.')}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeEditor}>
                <span className="sr-only">{t('close', 'Close')}</span>
                x
              </Button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {formError && (
                <div className="md:col-span-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}
              {!selectedUser && (
                <Input
                  label={t('username', 'Username')}
                  value={form.username}
                  onChange={(e) => setField('username', e?.target?.value)}
                />
              )}
              <Input
                label={t('email', 'Email')}
                value={form.email}
                onChange={(e) => setField('email', e?.target?.value)}
              />
              <Input
                label={t('firstName', 'First Name')}
                value={form.firstName}
                onChange={(e) => setField('firstName', e?.target?.value)}
              />
              <Input
                label={t('lastName', 'Last Name')}
                value={form.lastName}
                onChange={(e) => setField('lastName', e?.target?.value)}
              />
              <Select
                label={t('role', 'Role')}
                options={roleOptions.filter((option) => option.value !== 'all')}
                value={form.role}
                onChange={(value) => setField('role', value)}
              />
              <Input
                label={t('department', 'Department')}
                value={form.department}
                onChange={(e) => setField('department', e?.target?.value)}
              />
              <Input
                label={t('jobTitle', 'Job Title')}
                value={form.jobTitle}
                onChange={(e) => setField('jobTitle', e?.target?.value)}
              />
              <Input
                label={t('phoneNumber', 'Phone Number')}
                value={form.phoneNumber}
                onChange={(e) => setField('phoneNumber', e?.target?.value)}
              />
              {!selectedUser && (
                <Input
                  label={t('password', 'Password')}
                  type="password"
                  value={form.password}
                  onChange={(e) => setField('password', e?.target?.value)}
                />
              )}
              {selectedUser && (
                <div className="flex items-center gap-3 pt-7">
                  <input
                    id="is-active"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setField('isActive', e?.target?.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <label htmlFor="is-active" className="text-sm text-foreground">
                    {t('accountActive', 'Account active')}
                  </label>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={closeEditor}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button onClick={saveUser} disabled={submitting}>
                {submitting ? t('saving', 'Saving...') : t('saveUser', 'Save User')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
