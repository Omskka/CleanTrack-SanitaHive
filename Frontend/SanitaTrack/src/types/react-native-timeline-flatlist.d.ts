declare module 'react-native-timeline-flatlist' {
  import { ComponentType } from 'react';
  import { TextStyle, ViewStyle } from 'react-native';

  export interface TimelineItem {
    time: string;
    title: string;
    description?: string;
    circleColor?: string;
    lineColor?: string;
    [key: string]: any;
  }

  export interface TimelineProps {
    data: TimelineItem[];
    circleSize?: number;
    circleColor?: string;
    lineColor?: string;
    timeStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    separator?: boolean;
    showTime?: boolean;
    innerCircle?: 'dot' | 'icon';
    renderDetail?: (rowData: any) => React.ReactNode;
  }

  const Timeline: ComponentType<TimelineProps>;
  export default Timeline;
}
