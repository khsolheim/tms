import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from './MetricsCard';
import { ChartWidget } from './ChartWidget';
import { ActivityFeed } from './ActivityFeed';

interface DashboardWidgetProps {
  type: 'metrics' | 'chart' | 'list' | 'activity';
  title: string;
  config: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  type,
  title,
  config,
  position,
  size
}) => {
  const renderWidgetContent = () => {
    switch (type) {
      case 'metrics':
        return <MetricsCard config={config} />;
      case 'chart':
        return <ChartWidget config={config} />;
      case 'list':
        return <ActivityFeed config={config} />;
      default:
        return <div>Ukjent widget-type</div>;
    }
  };

  return (
    <div
      className="absolute"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderWidgetContent()}
        </CardContent>
      </Card>
    </div>
  );
};