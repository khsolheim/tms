import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { InformationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid';
import { useTranslation } from '../../contexts/I18nContext';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: TooltipPlacement;
  trigger?: TooltipTrigger;
  delay?: number;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  showArrow?: boolean;
  maxWidth?: number;
  id?: string;
}

interface Position {
  top: number;
  left: number;
  placement: TooltipPlacement;
}

export function Tooltip({
  content,
  children,
  placement = 'auto',
  trigger = 'hover',
  delay = 200,
  className = '',
  contentClassName = '',
  disabled = false,
  showArrow = true,
  maxWidth = 320,
  id
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  // const { t: _ } = useTranslation(); // Currently unused

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate space available
    const spaceAbove = triggerRect.top;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceRight = viewportWidth - triggerRect.right;
    
    // Determine position
    let newPosition = placement;
    if (placement === 'auto') {
      if (spaceBelow >= tooltipRect.height + 10) {
        newPosition = 'bottom';
      } else if (spaceAbove >= tooltipRect.height + 10) {
        newPosition = 'top';
      } else if (spaceRight >= tooltipRect.width + 10) {
        newPosition = 'right';
      } else {
        newPosition = 'left';
      }
    }

    // Calculate position based on final placement
    let top = 0;
    let left = 0;
    switch (newPosition) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
    }

    // Ensure tooltip stays within viewport
    left = Math.max(8, Math.min(left, viewportWidth - tooltipRect.width - 8));
    top = Math.max(8, Math.min(top, viewportHeight - tooltipRect.height - 8));

    setPosition({ top, left, placement: newPosition });
  }, [placement]);

  const showTooltip = useCallback(() => {
    if (disabled || !triggerRef.current || !content) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, trigger === 'hover' ? delay : 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, content, delay, trigger]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, trigger === 'hover' ? 100 : 0);
  }, [trigger]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]); // updatePosition is stable from useCallback

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        hideTooltip();
        triggerRef.current?.focus();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, hideTooltip]);

  const handleTriggerClick = useCallback((e: React.MouseEvent) => {
    if (trigger === 'click') {
      e.preventDefault();
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  }, [trigger, isVisible, showTooltip, hideTooltip]);

  const clonedTrigger = React.cloneElement(children as React.ReactElement, {
    ref: triggerRef,
    onMouseEnter: trigger === 'hover' ? showTooltip : undefined,
    onMouseLeave: trigger === 'hover' ? hideTooltip : undefined,
    onFocus: trigger === 'focus' ? showTooltip : undefined,
    onBlur: trigger === 'focus' ? hideTooltip : undefined,
    onClick: handleTriggerClick,
    'aria-describedby': id || (isVisible ? 'tooltip' : undefined),
    className: `${(children as React.ReactElement).props.className || ''} ${className}`.trim()
  });

  const tooltipPortal = isVisible && position && createPortal(
    <div
      ref={tooltipRef}
      id={id || 'tooltip'}
      role="tooltip"
      className={`
        fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg
        pointer-events-none select-none
        ${contentClassName}
      `}
      style={{
        top: position.top,
        left: position.left,
        maxWidth
      }}
      onMouseEnter={trigger === 'hover' ? showTooltip : undefined}
      onMouseLeave={trigger === 'hover' ? hideTooltip : undefined}
    >
      {content}
      {showArrow && (
        <div
          className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            position.placement === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
            position.placement === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
            position.placement === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
            position.placement === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' :
            'bottom-[-4px] left-1/2 -translate-x-1/2'
          }`}
        />
      )}
    </div>,
    document.body
  );

  return (
    <>
      {clonedTrigger}
      {tooltipPortal}
    </>
  );
}

// Contextual Help Components
interface HelpIconProps {
  helpKey: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'info' | 'question';
}

export function HelpIcon({ 
  helpKey, 
  className = '', 
  size = 'md', 
  variant = 'info' 
}: HelpIconProps) {
  const { t } = useTranslation();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  };
  
  const Icon = variant === 'info' ? InformationCircleIcon : QuestionMarkCircleIcon;
  
  return (
    <Tooltip
      content={
        <div className="max-w-xs">
          <p className="font-medium mb-1">{t(`help.${helpKey}.title`)}</p>
          <p className="text-gray-200">{t(`help.${helpKey}.description`)}</p>
          {t(`help.${helpKey}.example`) && (
            <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
              <span className="text-gray-400">{t('help.example')}:</span>
              <br />
              {t(`help.${helpKey}.example`)}
            </div>
          )}
        </div>
      }
      trigger="hover"
      placement="auto"
    >
      <Icon 
        className={`${sizeClasses[size]} text-gray-400 hover:text-gray-600 transition-colors cursor-help ${className}`}
        aria-label={t('help.showHelp')}
      />
    </Tooltip>
  );
}

// Field Help - for form fields
interface FieldHelpProps {
  helpKey: string;
  label?: string;
  className?: string;
  inline?: boolean;
}

export function FieldHelp({ helpKey, label, className = '', inline = false }: FieldHelpProps) {
  const { t } = useTranslation();
  
  const helpContent = (
    <div className="max-w-sm">
      {label && <p className="font-medium mb-1">{label}</p>}
      <p className="text-gray-200">{t(`help.fields.${helpKey}.description`)}</p>
      {t(`help.fields.${helpKey}.validation`) && (
        <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
          <span className="text-gray-400">{t('help.validation')}:</span>
          <br />
          {t(`help.fields.${helpKey}.validation`)}
        </div>
      )}
      {t(`help.fields.${helpKey}.example`) && (
        <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
          <span className="text-gray-400">{t('help.example')}:</span>
          <br />
          {t(`help.fields.${helpKey}.example`)}
        </div>
      )}
    </div>
  );
  
  if (inline) {
    return (
      <Tooltip content={helpContent} trigger="hover" placement="right">
        <QuestionMarkCircleIcon 
          className={`h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help ${className}`}
          aria-label={t('help.fieldHelp')}
        />
      </Tooltip>
    );
  }
  
  return (
    <div className={`mt-1 ${className}`}>
      <Tooltip content={helpContent} trigger="click" placement="bottom">
        <button onClick={() => console.log('Button clicked')}
          type="button"
          className="text-xs text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          aria-label={t('help.showFieldHelp', { field: label })}
        >
          {t('help.whatIsThis')}
        </button>
      </Tooltip>
    </div>
  );
}

// Context Help Panel - for complex help
interface ContextHelpProps {
  helpKey: string;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function ContextHelp({ 
  helpKey, 
  className = '', 
  collapsible = true, 
  defaultExpanded = false 
}: ContextHelpProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { t } = useTranslation();
  
  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };
  
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              {t(`help.context.${helpKey}.title`)}
            </h3>
            {(isExpanded || !collapsible) && (
              <div className="text-sm text-blue-700 space-y-6">
                <p>{t(`help.context.${helpKey}.description`)}</p>
                {(() => {
                  const steps = t(`help.context.${helpKey}.steps`);
                  if (!steps || steps === `help.context.${helpKey}.steps`) return null;
                  
                  // Handle array case
                  const stepsData = t(`help.context.${helpKey}.steps`, { returnObjects: true } as any);
                  if (Array.isArray(stepsData)) {
                    return (
                      <div>
                        <p className="font-medium mb-1">{t('help.steps')}:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          {stepsData.map((step: string, index: number) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    );
                  }
                  return null;
                })()}
                {(() => {
                  const tips = t(`help.context.${helpKey}.tips`);
                  if (!tips || tips === `help.context.${helpKey}.tips`) return null;
                  
                  // Handle array case
                  const tipsData = t(`help.context.${helpKey}.tips`, { returnObjects: true } as any);
                  if (Array.isArray(tipsData)) {
                    return (
                      <div>
                        <p className="font-medium mb-1">{t('help.tips')}:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          {tipsData.map((tip: string, index: number) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
        </div>
        {collapsible && (
          <button
            onClick={toggleExpanded}
            className="ml-2 p-1 text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            aria-label={isExpanded ? t('help.collapse') : t('help.expand')}
          >
            <svg 
              className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Guided Tour Component
interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: TooltipPlacement;
  action?: () => void;
}

interface GuidedTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export function GuidedTour({ 
  steps, 
  isActive, 
  onComplete, 
  onSkip, 
  currentStep = 0, 
  onStepChange 
}: GuidedTourProps) {
  const [step, setStep] = useState(currentStep);
  const { t } = useTranslation();
  
  const currentStepData = steps[step];
  const isLastStep = step === steps.length - 1;
  
  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);
  
  const nextStep = () => {
    if (currentStepData.action) {
      currentStepData.action();
    }
    
    if (isLastStep) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  if (!isActive || !currentStepData) {
    return null;
  }
  
  const targetElement = document.querySelector(currentStepData.target) as HTMLElement;
  
  if (!targetElement) {
    return null;
  }
  
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Tour tooltip */}
      <Tooltip
        content={
          <div className="max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">{currentStepData.title}</h3>
              <span className="text-xs text-gray-300">
                {step + 1} / {steps.length}
              </span>
            </div>
            <p className="text-gray-200 mb-4">{currentStepData.content}</p>
            <div className="flex items-center justify-between">
              <button
                onClick={onSkip}
                className="text-xs text-gray-300 hover:text-white underline"
              >
                {t('help.tour.skip')}
              </button>
              <div className="flex space-x-2">
                {step > 0 && (
                  <button
                    onClick={prevStep}
                    className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
                  >
                    {t('help.tour.previous')}
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  {isLastStep ? t('help.tour.finish') : t('help.tour.next')}
                </button>
              </div>
            </div>
          </div>
        }
        trigger="manual"
        placement={currentStepData.placement || 'bottom'}
        contentClassName="bg-gray-900"
      >
        <div
          className="fixed z-50 ring-2 ring-blue-500 ring-opacity-75 rounded-lg"
          style={{
            top: targetElement.offsetTop - 4,
            left: targetElement.offsetLeft - 4,
            width: targetElement.offsetWidth + 8,
            height: targetElement.offsetHeight + 8,
            pointerEvents: 'none'
          }}
        />
      </Tooltip>
    </>
  );
} 