import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BottomNav, TabId } from '@/components/BottomNav';
import { HomePage } from '@/pages/HomePage';
import { WorkoutsPage } from '@/pages/WorkoutsPage';
import { NutritionPage } from '@/pages/NutritionPage';
import { ProfilePage } from '@/pages/ProfilePage';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  return (
    <div className="min-h-screen max-w-md mx-auto relative">
      <AnimatePresence mode="wait">
        {activeTab === 'home' && <HomePage key="home" />}
        {activeTab === 'workouts' && <WorkoutsPage key="workouts" />}
        {activeTab === 'nutrition' && <NutritionPage key="nutrition" />}
        {activeTab === 'profile' && <ProfilePage key="profile" />}
      </AnimatePresence>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index;
