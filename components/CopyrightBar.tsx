
import React from 'react';

const CopyrightBar: React.FC = () => {
  return (
    <div className="w-full bg-light-green/40 border-t border-primary/10 py-3 dark:bg-gray-800/80 dark:border-primary/20">
      <div className="container mx-auto px-4 text-center">
        <p className="text-[10px] sm:text-xs text-primary-dark/70 dark:text-primary/60 font-bold tracking-widest uppercase">
          © 2025 HarvestHub. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default CopyrightBar;
