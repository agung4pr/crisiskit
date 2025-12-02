import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Region } from '../types';
import { Button } from '../components/Button';
import { Input, TextArea } from '../components/Input';
import { ArrowLeft, Plus, X } from 'lucide-react';

// Preset region templates
const REGION_PRESETS = {
  hongkong: [
    { name: "Hong Kong Island", districts: ["Central", "Wan Chai", "Eastern", "Southern"] },
    { name: "Kowloon", districts: ["Mong Kok", "Tsim Sha Tsui", "Sham Shui Po", "Kowloon City"] },
    { name: "New Territories", districts: ["Sha Tin", "Tai Po", "Yuen Long", "Tuen Mun"] }
  ],
  losangeles: [
    { name: "Los Angeles", districts: ["Downtown", "Hollywood", "Santa Monica", "Venice"] },
    { name: "Orange County", districts: ["Irvine", "Anaheim", "Santa Ana", "Huntington Beach"] }
  ],
  none: []
};

export const CreateIncident: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableRegions, setEnableRegions] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('none');
  const [regions, setRegions] = useState<Region[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    if (preset !== 'none' && REGION_PRESETS[preset as keyof typeof REGION_PRESETS]) {
      setRegions(REGION_PRESETS[preset as keyof typeof REGION_PRESETS]);
    } else {
      setRegions([]);
    }
  };

  const addCustomRegion = () => {
    setRegions([...regions, { name: '', districts: [] }]);
  };

  const removeRegion = (index: number) => {
    setRegions(regions.filter((_, i) => i !== index));
  };

  const updateRegionName = (index: number, name: string) => {
    const updated = [...regions];
    updated[index].name = name;
    setRegions(updated);
  };

  const updateRegionDistricts = (index: number, districtsStr: string) => {
    const updated = [...regions];
    updated[index].districts = districtsStr.split(',').map(d => d.trim()).filter(d => d);
    setRegions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      const incidentData = {
        ...formData,
        regions: enableRegions && regions.length > 0 ? regions : undefined
      };
      const newIncident = await storageService.createIncident(incidentData);
      navigate(`/incident/${newIncident.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Incident Form</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Incident Title" 
            placeholder="e.g. 2025 Taipo Fire - Building A"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            autoFocus
          />
          
          <TextArea
            label="Description & Instructions"
            placeholder="Describe the situation and what information is needed from affected individuals."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            required
          />

          {/* Region Configuration (Optional) */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Location Selection (Optional)
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Help people quickly select their region/district instead of typing
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnableRegions(!enableRegions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enableRegions ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enableRegions ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {enableRegions && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">
                    Use Preset Template
                  </label>
                  <select
                    value={selectedPreset}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="none">-- No Preset (Custom) --</option>
                    <option value="hongkong">Hong Kong (3 Regions)</option>
                    <option value="losangeles">Los Angeles (2 Regions)</option>
                  </select>
                </div>

                {regions.length > 0 && (
                  <div className="space-y-3">
                    {regions.map((region, idx) => (
                      <div key={idx} className="bg-white p-3 rounded border border-gray-200 relative">
                        <button
                          type="button"
                          onClick={() => removeRegion(idx)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <input
                          type="text"
                          placeholder="Region name (e.g., Hong Kong Island)"
                          value={region.name}
                          onChange={(e) => updateRegionName(idx, e.target.value)}
                          className="w-full px-2 py-1 text-sm font-medium border-b border-gray-200 mb-2 focus:outline-none focus:border-primary-500"
                        />
                        <input
                          type="text"
                          placeholder="Districts (comma-separated: Central, Wan Chai, Eastern)"
                          value={region.districts.join(', ')}
                          onChange={(e) => updateRegionDistricts(idx, e.target.value)}
                          className="w-full px-2 py-1 text-xs text-gray-600 border-0 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addCustomRegion}
                  className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Custom Region
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" isLoading={isSubmitting} size="lg">
              Create & Get Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};