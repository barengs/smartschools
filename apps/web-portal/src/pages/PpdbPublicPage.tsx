import { HelpCircle, MessageSquare } from 'lucide-react';
import { Button, Card } from '../components/atoms';
import {
  PpdbWizardSidebar,
  PpdbWizardStepContent,
  PpdbWizardStepper,
} from '../components/organisms';
import { WizardSplitTemplate } from '../components/templates';
import { useAppDispatch, useAppSelector } from '../store';
import { setWizardStep, submitPpdbRegistration } from '../store/slices/ppdbPublicSlice';

export function PpdbPublicPage() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.ppdbPublic.draft);

  async function handleFinalSubmit() {
    if (!draft.username.trim() || draft.password.length < 8) {
      dispatch(setWizardStep(1));
      return;
    }
    if (!draft.parentName.trim() || !draft.parentPhone.trim()) {
      dispatch(setWizardStep(4));
      return;
    }
    await dispatch(submitPpdbRegistration(draft));
  }

  return (
    <WizardSplitTemplate
      header={<PpdbWizardStepper />}
      main={<PpdbWizardStepContent onFinalSubmit={handleFinalSubmit} />}
      sidebar={<PpdbWizardSidebar onFinalSubmit={handleFinalSubmit} />}
      footerBanner={
        <Card padding="md" className="bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-900 text-white">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Butuh Bantuan Pengukuran Jarak Rumah atau Berkas?
              </h3>
              <p className="text-xs text-slate-600">
                Operator Verifikator PPDB siap melayani pertanyaan via live chat resmi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="https://wa.me/6281123456789"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp Verifikator PPDB</span>
            </a>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<HelpCircle className="h-3.5 w-3.5" />}
              onClick={() => dispatch(setWizardStep(2))}
            >
              FAQ Zonasi
            </Button>
          </div>
        </Card>
      }
    />
  );
}
