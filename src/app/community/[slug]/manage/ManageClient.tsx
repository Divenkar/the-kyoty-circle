'use client';

import { useState } from 'react';
import type { Community, CommunityMemberWithUser, CommunityRole, CommunityRoleLevel } from '@/types';
import { updateCommunitySettingsAction, removeMemberAction, approveMemberAction, rejectMemberAction, bulkApproveMembersAction } from '@/server/actions/community-manage.actions';
import { assignRoleAction, removeRoleAction } from '@/server/actions/community-roles.actions';
import { toast } from 'sonner';
import { Settings, Users, Shield, Check, Loader2, Trash2, Crown, ChevronDown, Clock, ExternalLink, CheckCircle, XCircle, CheckSquare, Square } from 'lucide-react';

type Tab = 'settings' | 'members' | 'roles' | 'requests';

interface ManageClientProps {
    community: Community;
    members: CommunityMemberWithUser[];
    pendingMembers: CommunityMemberWithUser[];
    roles: CommunityRole[];
    currentUserId: number;
    isOwner: boolean;
}

export function ManageClient({ community, members, pendingMembers, roles: initialRoles, currentUserId, isOwner }: ManageClientProps) {
    const [tab, setTab] = useState<Tab>('requests');
    const [roles, setRoles] = useState<CommunityRole[]>(initialRoles);
    const [memberList, setMemberList] = useState<CommunityMemberWithUser[]>(members);
    const [pendingList, setPendingList] = useState<CommunityMemberWithUser[]>(pendingMembers);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkApproving, setBulkApproving] = useState(false);

    // Settings form state
    const [name, setName] = useState(community.name);
    const [description, setDescription] = useState(community.description || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [settingsError, setSettingsError] = useState<string | null>(null);

    const saveSettings = async () => {
        setSaving(true);
        setSettingsError(null);
        const result = await updateCommunitySettingsAction(community.id, { name, description });
        setSaving(false);
        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            toast.success('Settings saved');
        } else {
            setSettingsError(result.error || 'Failed to save');
            toast.error(result.error || 'Failed to save settings');
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        const result = await removeMemberAction(community.id, memberId);
        if (result.success) {
            setMemberList(prev => prev.filter(m => m.id !== memberId));
            toast.success('Member removed');
        } else {
            toast.error(result.error || 'Failed to remove member');
        }
    };

    const handleApprove = async (memberId: number) => {
        const result = await approveMemberAction(community.id, memberId);
        if (result.success) {
            const approved = pendingList.find(m => m.id === memberId);
            setPendingList(prev => prev.filter(m => m.id !== memberId));
            if (approved) setMemberList(prev => [...prev, { ...approved, status: 'approved' }]);
            toast.success('Member approved');
        } else {
            toast.error(result.error || 'Failed to approve member');
        }
    };

    const handleReject = async (memberId: number) => {
        const result = await rejectMemberAction(community.id, memberId);
        if (result.success) {
            setPendingList(prev => prev.filter(m => m.id !== memberId));
            setSelectedIds(prev => { const n = new Set(prev); n.delete(memberId); return n; });
            toast.success('Request declined');
        } else {
            toast.error(result.error || 'Failed to decline request');
        }
    };

    const handleBulkApprove = async () => {
        const ids = Array.from(selectedIds);
        setBulkApproving(true);
        const result = await bulkApproveMembersAction(community.id, ids);
        setBulkApproving(false);
        if (result.success) {
            const approvedMembers = pendingList.filter(m => selectedIds.has(m.id));
            setPendingList(prev => prev.filter(m => !selectedIds.has(m.id)));
            setMemberList(prev => [...prev, ...approvedMembers.map(m => ({ ...m, status: 'approved' as const }))]);
            setSelectedIds(new Set());
            toast.success(`${result.data?.count ?? ids.length} members approved`);
        } else {
            toast.error(result.error || 'Failed to approve members');
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const allSelected = pendingList.length > 0 && selectedIds.size === pendingList.length;
    const toggleSelectAll = () => {
        setSelectedIds(allSelected ? new Set() : new Set(pendingList.map(m => m.id)));
    };

    const handleAssignRole = async (userId: number, role: CommunityRoleLevel) => {
        const result = await assignRoleAction(community.id, userId, role);
        if (result.success && result.data) {
            setRoles(prev => {
                const idx = prev.findIndex(r => r.user_id === userId);
                if (idx >= 0) { const next = [...prev]; next[idx] = result.data!; return next; }
                return [...prev, result.data!];
            });
            toast.success(`Role assigned: ${role}`);
        } else {
            toast.error(result.error || 'Failed to assign role');
        }
    };

    const handleRemoveRole = async (userId: number) => {
        const result = await removeRoleAction(community.id, userId);
        if (result.success) {
            setRoles(prev => prev.filter(r => r.user_id !== userId));
            toast.success('Role removed');
        } else {
            toast.error(result.error || 'Failed to remove role');
        }
    };

    const roleMap = new Map(roles.map(r => [r.user_id, r.role]));

    const TABS = [
        { id: 'requests' as Tab, label: 'Requests', icon: <Clock size={15} />, badge: pendingList.length },
        { id: 'settings' as Tab, label: 'Settings', icon: <Settings size={15} /> },
        { id: 'members' as Tab, label: 'Members', icon: <Users size={15} /> },
        { id: 'roles' as Tab, label: 'Roles', icon: <Shield size={15} /> },
    ];

    return (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {/* Tab header */}
            <div className="flex border-b border-neutral-200">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={[
                            'relative flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3.5 text-sm font-medium transition-colors',
                            tab === t.id
                                ? 'border-primary-600 text-primary-700 bg-primary-50/30'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700',
                        ].join(' ')}
                    >
                        {t.icon}
                        <span className="hidden sm:inline">{t.label}</span>
                        {t.badge ? (
                            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {t.badge}
                            </span>
                        ) : null}
                    </button>
                ))}
            </div>

            <div className="p-6">
                {/* REQUESTS TAB */}
                {tab === 'requests' && (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-neutral-900">Join Requests</h3>
                            {pendingList.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700"
                                    >
                                        {allSelected
                                            ? <CheckSquare size={14} className="text-primary-600" />
                                            : <Square size={14} />
                                        }
                                        {allSelected ? 'Deselect all' : 'Select all'}
                                    </button>
                                    {selectedIds.size > 0 && (
                                        <button
                                            onClick={handleBulkApprove}
                                            disabled={bulkApproving}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition"
                                        >
                                            {bulkApproving
                                                ? <Loader2 size={12} className="animate-spin" />
                                                : <CheckCircle size={12} />
                                            }
                                            Approve {selectedIds.size}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        {pendingList.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-neutral-300 py-10 text-center text-sm text-neutral-400">
                                No pending requests
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingList.map(member => {
                                    const user = member.kyoty_users;
                                    const isSelected = selectedIds.has(member.id);
                                    return (
                                        <div
                                            key={member.id}
                                            className={`rounded-xl border bg-neutral-50 p-4 transition-colors ${isSelected ? 'border-primary-300 bg-primary-50/30' : 'border-neutral-200'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <button
                                                    onClick={() => toggleSelect(member.id)}
                                                    className="mt-0.5 shrink-0 text-neutral-400 hover:text-primary-600"
                                                >
                                                    {isSelected
                                                        ? <CheckSquare size={16} className="text-primary-600" />
                                                        : <Square size={16} />
                                                    }
                                                </button>
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                                                    {user?.name?.slice(0, 2).toUpperCase() || '??'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-neutral-800">{user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                                                    {member.join_reason && (
                                                        <div className="mt-2">
                                                            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Why they want to join</p>
                                                            <p className="mt-0.5 text-sm text-neutral-700 leading-relaxed">{member.join_reason}</p>
                                                        </div>
                                                    )}
                                                    {member.social_proof_link && (
                                                        <a
                                                            href={member.social_proof_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-2 inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                                                        >
                                                            <ExternalLink size={11} />
                                                            View profile
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-end gap-2 border-t border-neutral-200 pt-3">
                                                <button
                                                    onClick={() => handleReject(member.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                                                >
                                                    <XCircle size={13} /> Decline
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(member.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition"
                                                >
                                                    <CheckCircle size={13} /> Approve
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* SETTINGS TAB */}
                {tab === 'settings' && (
                    <div className="space-y-5">
                        <h3 className="text-base font-semibold text-neutral-900">Community Settings</h3>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Community name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                            />
                        </div>
                        {settingsError && <p className="text-sm text-red-500">{settingsError}</p>}
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
                            {saved ? 'Saved!' : 'Save changes'}
                        </button>
                    </div>
                )}

                {/* MEMBERS TAB */}
                {tab === 'members' && (
                    <div>
                        <h3 className="mb-4 text-base font-semibold text-neutral-900">Manage Members</h3>
                        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
                            {memberList.map(member => {
                                const user = member.kyoty_users;
                                const isCurrentUser = member.user_id === currentUserId;
                                return (
                                    <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                                            {user?.name?.slice(0, 2).toUpperCase() || '??'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 truncate">{user?.name || 'Unknown'}</p>
                                            <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                                        </div>
                                        {!isCurrentUser && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 size={12} /> Remove
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {memberList.length === 0 && (
                                <div className="py-8 text-center text-sm text-neutral-400">No members yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ROLES TAB */}
                {tab === 'roles' && (
                    <div>
                        <h3 className="mb-4 text-base font-semibold text-neutral-900">Role Management</h3>
                        <p className="mb-4 text-sm text-neutral-500">Assign admins and moderators to help manage your community.</p>
                        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
                            {memberList.map(member => {
                                const user = member.kyoty_users;
                                const currentRole = roleMap.get(member.user_id);
                                const isCurrentUser = member.user_id === currentUserId;

                                return (
                                    <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                                            {user?.name?.slice(0, 2).toUpperCase() || '??'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 truncate">{user?.name || 'Unknown'}</p>
                                        </div>
                                        {isCurrentUser ? (
                                            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                                                <Crown size={11} /> Owner
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {currentRole && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold capitalize text-blue-700">{currentRole}</span>
                                                )}
                                                <RoleDropdown
                                                    currentRole={currentRole || null}
                                                    onAssign={role => handleAssignRole(member.user_id, role)}
                                                    onRemove={() => handleRemoveRole(member.user_id)}
                                                    isOwner={isOwner}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function RoleDropdown({
    currentRole,
    onAssign,
    onRemove,
    isOwner,
}: {
    currentRole: CommunityRoleLevel | null;
    onAssign: (role: CommunityRoleLevel) => void;
    onRemove: () => void;
    isOwner: boolean;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-50">
                Assign <ChevronDown size={11} />
            </button>
            {open && (
                <div className="absolute right-0 top-8 z-10 w-36 rounded-xl border border-neutral-200 bg-white shadow-lg">
                    {isOwner && (
                        <button onClick={() => { onAssign('admin'); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-50">
                            <Shield size={12} className="text-blue-500" /> Admin
                        </button>
                    )}
                    <button onClick={() => { onAssign('moderator'); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-50">
                        <Shield size={12} className="text-green-500" /> Moderator
                    </button>
                    {currentRole && (
                        <button onClick={() => { onRemove(); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 border-t border-neutral-100">
                            <Trash2 size={12} /> Remove role
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
