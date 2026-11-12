import { useEffect } from 'react';
import {
  AnnouncementBar,
  BrochureHelpdeskSection,
  HeroSection,
  PillarsSection,
  StepsSection,
  TestimonialsSection,
  TracksSection,
} from '../components/organisms';
import { useAppDispatch } from '../store';
import { fetchPublicOverview } from '../store/slices/ppdbPublicSlice';

export function LandingPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchPublicOverview());
  }, [dispatch]);

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
