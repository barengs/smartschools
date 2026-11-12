import React from 'react';

interface WizardSplitTemplateProps {
  header: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
  footerBanner?: React.ReactNode;
}

export function WizardSplitTemplate({
  header,
  main,
  sidebar,
  footerBanner,
}: WizardSplitTemplateProps) {
  return (
    <div className="bs-container py-8 space-y-6">
      {header}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8">{main}</div>
        <aside className="lg:col-span-4">{sidebar}</aside>
      </div>

      {footerBanner}
    </div>
  );
}

