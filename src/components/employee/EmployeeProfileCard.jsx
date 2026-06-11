import React from 'react';
import { User, Mail, Phone, Building2, Briefcase, Calendar } from 'lucide-react';

const EmployeeProfileCard = ({ profile, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm p-6 mt-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div>
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm p-6 mt-6">
      <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-5">My Profile</h3>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          {initials}
        </div>
        <div>
          <h4 className="font-semibold text-base text-slate-800 dark:text-white">
            {profile.firstName} {profile.middleName} {profile.lastName}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.designation}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <InfoRow icon={Mail} label="Email" value={profile.email} />
        <InfoRow icon={Phone} label="Mobile" value={profile.mobileNumber || '—'} />
        <InfoRow icon={Building2} label="Department" value={profile.department || '—'} />
        <InfoRow icon={Briefcase} label="Designation" value={profile.designation || '—'} />
        <InfoRow icon={User} label="Manager" value={profile.managerName || '—'} />
        <InfoRow icon={Calendar} label="Joining Date" value={profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '—'} />
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <Icon size={16} className="mt-0.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
    <div>
      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
      <p className="text-slate-700 dark:text-slate-300 font-medium">{value}</p>
    </div>
  </div>
);

export default EmployeeProfileCard;
