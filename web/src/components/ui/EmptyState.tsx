"use client";

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon-ring">
        {icon ?? (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm0 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 18.5c-4 0-7.535-2.04-9.622-5.145C10.417 22.115 15.27 21 20 21s9.583 1.115 9.622 3.355C27.535 27.46 24 29.5 20 29.5z" fill="currentColor"/>
          </svg>
        )}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <button className="empty-state-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
