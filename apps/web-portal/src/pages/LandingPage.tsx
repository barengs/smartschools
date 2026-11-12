import {
  AnnouncementBar,
  BrochureHelpdeskSection,
  HeroSection,
  PillarsSection,
  StepsSection,
  TestimonialsSection,
  TracksSection,
} from '../components/organisms';

export function LandingPage() {
  return (
    <div>
      <AnnouncementBar />
      <HeroSection />
      <PillarsSection />
      <TracksSection />
      <StepsSection />
      <TestimonialsSection />
      <BrochureHelpdeskSection />
    </div>
  );
}

