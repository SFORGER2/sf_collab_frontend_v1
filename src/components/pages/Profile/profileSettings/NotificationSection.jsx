import { Bell, Clock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Field, FieldGrid, SectionHead, Select, SettingsCard, TextInput, Toggle } from './SettingsUI';

/**
 * Notification settings.
 *
 * Rebuilt on the shared settings primitives — was three differently-coloured
 * gradient panels with `bg-gray-700` controls.
 *
 * The toggle list is grouped rather than a flat run of eleven switches, because
 * "warn me about payouts" and "tell me who liked my post" are not the same kind
 * of decision and shouldn't sit in one undifferentiated column.
 */

const GROUPS = [
  {
    label: 'Important',
    hint: 'Things that need you to act. Turning these off is rarely a good idea.',
    accent: '#ffbf5e',
    items: [
      { key: 'systemWarnings', title: 'Warnings', description: 'Critical system and workspace alerts' },
      { key: 'financialAlerts', title: 'Payouts & money', description: 'Payouts, investments and wallet activity' },
      { key: 'taskReminders', title: 'Task reminders', description: 'Deadlines and assignments coming due' },
      { key: 'approvals', title: 'Approvals', description: 'Something is waiting on your decision' },
      { key: 'joinRequests', title: 'Join requests', description: 'People asking to join your startups' },
    ],
  },
  {
    label: 'Social',
    hint: 'Activity on the things you post and share.',
    accent: '#ff6fd8',
    items: [
      { key: 'mentions', title: 'Mentions', description: 'When someone @mentions you' },
      { key: 'newComments', title: 'Comments', description: 'Replies on your posts' },
      { key: 'newLikes', title: 'Likes', description: 'Reactions to your content' },
      { key: 'postEngagement', title: 'Post engagement', description: 'Reach and interaction summaries' },
      { key: 'storyViews', title: 'Story views', description: 'When your stories are viewed' },
    ],
  },
  {
    label: 'Suggestions',
    hint: 'Proactive nudges from the assistant and matchmaking.',
    accent: '#8b6cff',
    items: [
      { key: 'newSuggestions', title: 'Personalised suggestions', description: 'Matches, opportunities and ideas picked for you' },
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

export default function NotificationSection({ formData, onChange }) {
  const settings = formData.notificationSettings || {};
  const quiet = settings.quietHours || {};

  const set = (patch) => onChange({ ...settings, ...patch });

  return (
    <motion.div className="flex flex-col gap-6 w-full max-w-full min-w-0" initial="hidden" animate="visible" variants={container}>
      <motion.div variants={item}>
        <SectionHead
          icon={Bell}
          title="Notifications"
          description="What reaches you, and when."
          accent="#ffbf5e"
        />
      </motion.div>

      {GROUPS.map((group) => (
        <motion.div key={group.label} variants={item}>
          <SettingsCard title={group.label} hint={group.hint} accent={group.accent}>
            <div className="flex flex-col gap-2.5 sm:gap-3 w-full min-w-0">
              {group.items.map((t) => (
                <Toggle
                  key={t.key}
                  label={t.title}
                  description={t.description}
                  checked={settings[t.key]}
                  onChange={(v) => set({ [t.key]: v })}
                  accent={group.accent}
                />
              ))}
            </div>
          </SettingsCard>
        </motion.div>
      ))}

      <motion.div variants={item}>
        <SettingsCard title="Email digest" accent="#4fd8ff">
          <Field label="How often" hint="A single roundup instead of individual emails.">
            <Select
              value={settings.emailDigest || 'weekly'}
              onChange={(e) => set({ emailDigest: e.target.value })}
              placeholder={null}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'never', label: 'Never' },
              ]}
            />
          </Field>
        </SettingsCard>
      </motion.div>

      <motion.div variants={item}>
        <SettingsCard title="Quiet hours" accent="#3ee6a0">
          <div className="flex flex-col gap-3">
            <Toggle
              label="Hold notifications overnight"
              description="Anything that arrives in this window waits until it ends."
              checked={quiet.enabled}
              onChange={(v) => set({ quietHours: { ...quiet, enabled: v } })}
              accent="#3ee6a0"
            />

            {quiet.enabled && (
              <div className="pt-2 border-t border-white/[0.08] animate-in fade-in-0 duration-200">
                <FieldGrid>
                  <Field label="From">
                    <TextInput
                      type="time"
                      value={quiet.start || ''}
                      onChange={(e) => set({ quietHours: { ...quiet, start: e.target.value } })}
                    />
                  </Field>
                  <Field label="Until">
                    <TextInput
                      type="time"
                      value={quiet.end || ''}
                      onChange={(e) => set({ quietHours: { ...quiet, end: e.target.value } })}
                    />
                  </Field>
                </FieldGrid>
              </div>
            )}
          </div>
        </SettingsCard>
      </motion.div>

      <p className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[0.78rem] font-medium text-dim/80 px-1 mt-1 min-w-0">
        <span className="flex items-center gap-1.5 break-words"><Mail size={13} className="text-dim/70 shrink-0" /> Email delivery follows your digest setting.</span>
        <span className="flex items-center gap-1.5 break-words"><Clock size={13} className="text-dim/70 shrink-0" /> Times use your profile timezone.</span>
      </p>
    </motion.div>
  );
}
