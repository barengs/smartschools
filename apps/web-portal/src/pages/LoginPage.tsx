import { LoginBrandPanel, LoginFormPanel } from '../components/organisms';
import { AuthLayout } from '../components/templates';

export function LoginPage() {
  return <AuthLayout left={<LoginBrandPanel />} right={<LoginFormPanel />} />;
}
