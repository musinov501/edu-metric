import { redirect } from 'next/navigation';

// Student "Settings" link in the sidebar lands on the shared account settings page.
export default function StudentSettingsRedirect() {
  redirect('/account/settings');
}
