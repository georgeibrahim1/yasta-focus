import React, { useState } from 'react';
import { X } from 'lucide-react';
// Select is no longer needed

export default function CreateCompetitionModal({ isOpen, onClose, onSubmit, communityId }) {
  const [formData, setFormData] = useState({
    competition_name: '',
    // competition_type is always 'local' now
    // start_time is set automatically
    end_time: '',
    max_subjects: '',
    max_participants: '',
    comp_description: '',
    community_id: communityId,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Don't update competition_type or start_time from input
    if (name === 'competition_type' || name === 'start_time') return; 
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.competition_name.trim()) {
      setError('Competition name is required');
      return;
    }
    // Only validate end_time, start_time is set automatically
    if (!formData.end_time) {
      setError('End time is required');
      return;
    }
    const currentTimestamp = new Date();
    if (currentTimestamp >= new Date(formData.end_time)) {
      setError('End time must be after the current time');
      return;
    }

    setIsLoading(true);
    try {
      // Auto-set competition_type and start_time
      const submissionData = {
        ...formData,
        competition_type: 'local',
        start_time: currentTimestamp.toISOString(),
      };
      await onSubmit(submissionData);
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create competition';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // competitionTypeOptions is no longer needed

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-8 max-w-lg w-full border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Competition</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-700/20 border border-red-600/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          <InputField label="Competition Name" name="competition_name" value={formData.competition_name} onChange={handleInputChange} placeholder="Enter competition name" maxLength={50} />
          <p className="text-xs text-slate-400 -mt-2">{formData.competition_name.length}/50</p>

          {/* Competition Type removed, always local */}

          <div className="flex gap-4">
            {/* Start Time removed, set automatically */}
            <InputField label="End Time" name="end_time" type="datetime-local" value={formData.end_time} onChange={handleInputChange} />
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/2">
              <InputField label="Max Subjects" name="max_subjects" type="number" value={formData.max_subjects} onChange={handleInputChange} placeholder="e.g., 5" min="1" />
            </div>
            <div className="w-1/2">
              <InputField label="Max Participants" name="max_participants" type="number" value={formData.max_participants} onChange={handleInputChange} placeholder="e.g., 50" min="1" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              name="comp_description"
              value={formData.comp_description}
              onChange={handleInputChange}
              placeholder="Describe the competition..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-teal-400 rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {isLoading ? 'Creating...' : 'Create Competition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const InputField = ({ label, ...props }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-white mb-2">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
    />
  </div>
);