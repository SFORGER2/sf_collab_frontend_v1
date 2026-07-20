/* ---------------------- AppearanceSection ---------------------- */
export default function AppearanceSection({ formData, onChange }) {
  // backend only stores theme in preferences, so we map to preferences.theme
  const appearance = formData.preferences || {};

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold mb-6">Appearance</h2>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Theme Mode</h3>
        {["light","dark"].map(mode => (
          <label key={mode} className="flex items-center gap-3 bg-gray-700/30 p-4 rounded-lg cursor-pointer">
            <input type="radio" name="themeMode" value={mode} checked={(appearance.theme || 'light') === mode} onChange={() => onChange()} />
            <span className="capitalize">{mode}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

